"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  GraduationCap,
  MessageCircleQuestion,
  Mic,
  PauseCircle,
  UserCheck,
  X,
} from "lucide-react";

import { AgentPrompt } from "@/components/agents/AgentPrompt";
import { AiOrb, type AiOrbState } from "@/components/chat/AiOrb";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { Button } from "@/components/ui/button";
import { CardButton } from "@/components/ui/card-button";
import { FaqAssistantThread } from "@/components/faq/FaqAssistantThread";
import { Logo } from "@/components/ui/logo";
import { SelectionChip } from "@/components/ui/selection-chip";
import { useFaqAssistant } from "@/components/faq/useFaqAssistant";
import {
  AssessmentPlanPanel,
  SuccessDriversGuideCard,
} from "@/app/onboarding/ui/AssessmentPlanPanel";
import { GeneratedJdPanel } from "@/app/onboarding/ui/GeneratedJdPanel";
import { OnboardingProgressHeader } from "@/app/onboarding/ui/OnboardingProgressHeader";
import { reportCountForRole, upsertSavedRole } from "@/lib/proofdiveLogic";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { firstNameOf, readAuthIdentity } from "@/lib/authIdentity";
import type { RoleProfile } from "@/lib/proofdiveTypes";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import {
  coreFourValidationError,
  suggestCoreFour,
} from "@/lib/coreFourSuggestion";
import { generateMockJobDescription } from "@/lib/jobDescriptionMock";
import { cn } from "@/lib/utils";
import { COMPETENCY_SPECS, type CompetencyId } from "@/lib/storyboardDraft";

/**
 * Onboarding flow — four named steps, import-first:
 *
 *   1. Your background — resume drop (parse → confirm) or skip; no substitute questionnaire.
 *      Import demotes the old questionnaire: the resume answers role, stage,
 *      years, employer, and industry in one gesture.
 *   2. Target — what they're preparing for + the job posting (paste the real
 *      one; generation is an explained fallback).
 *   3. Focus areas — inferred Core Four with reasoning, swap-any.
 *   4. First session — the session contract, then straight into value.
 */
type Stage =
  | "welcome"
  | "bgEntry"
  | "bgParsing"
  | "bgFailed"
  | "bgConfirm"
  | "bgExp"
  | "bgStudy"
  | "targetRole"
  | "targetIndustry"
  | "targetJd"
  | "plan"
  | "session";

const STAGE_STEP: Record<Stage, number> = {
  // `welcome` sits before the numbered steps; its header is hidden.
  welcome: 0,
  bgEntry: 0,
  bgParsing: 0,
  bgFailed: 0,
  bgConfirm: 0,
  bgExp: 0,
  bgStudy: 0,
  targetRole: 1,
  targetIndustry: 1,
  targetJd: 1,
  plan: 2,
  session: 3,
};

type Draft = {
  name: string;
  targetRole: string;
  backgroundType: NonNullable<RoleProfile["backgroundType"]> | "";
  experienceLevel: NonNullable<RoleProfile["experienceLevel"]> | "";
  education: string;
  lastWorkedAt: string;
  background: string;
  jobDescription: string;
  jobDescriptionSource: "user" | "generated";
  resume: string;
  industryVertical: string;
  coreFourCompetencies: CompetencyId[];
};

/** What the (mock) resume parse "read". Fixture data in the repo's usual
 * mock style; the name is genuinely derived from the file name. */
type ParsedResume = {
  name: string;
  role: string;
  years: number;
  employer: string;
  industry: string;
  skills: string[];
};

const SUGGESTED_ROLES = [
  "UX Designer",
  "Product Manager",
  "Software Engineer",
  "Data Analyst",
  "Project Manager",
];

const INDUSTRY_OPTIONS = ["Technology", "Finance", "Healthcare", "Retail"];

/** Fields of study for the student / new-grad path. A degree is the background
 * signal they actually have; asking them to name a role here would force a
 * decision they may not have made yet, and the Target step asks for it anyway. */
const FIELD_OF_STUDY_OPTIONS = [
  "Computer Science",
  "Software Engineering",
  "Business",
  "Design",
  "Engineering",
  "Data Science",
];

const EXPERIENCE_OPTIONS = [
  { id: "student", label: "Student" },
  { id: "new_grad", label: "New grad" },
  { id: "1-4", label: "1–4 yrs" },
  { id: "5-9", label: "5–9 yrs" },
  { id: "10+", label: "10+ yrs" },
] as const;

type ExperienceId = (typeof EXPERIENCE_OPTIONS)[number]["id"];

const RESUME_ACCEPT = ".pdf,.doc,.docx,.txt";
const MAX_RESUME_BYTES = 10 * 1024 * 1024;

/** Staged parse ticks — honest progress, never a bare spinner. */
const PARSE_PHASES = [
  "Reading the document",
  "Found 3 roles across 6 years",
  "Matching your skills to interview topics",
];

/** "kashif-resume.pdf" → "Kashif". Empty string when nothing name-like. */
function nameFromFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "");
  const token = base
    .split(/[-_ .]+/)
    .find(
      (t) =>
        /^[a-zA-Z]{2,}$/.test(t) &&
        !/^(resume|cv|final|updated|new|copy|latest|draft|v\d*)$/i.test(t),
    );
  return token ? token[0].toUpperCase() + token.slice(1).toLowerCase() : "";
}

function experienceIdFromYears(years: number): ExperienceId {
  if (years >= 10) return "10+";
  if (years >= 5) return "5-9";
  if (years >= 1) return "1-4";
  return "new_grad";
}

function experienceIdFromProfile(profile: RoleProfile | null): ExperienceId | "" {
  if (!profile?.backgroundType) return "";
  if (profile.backgroundType === "under_grad") return "student";
  if (profile.backgroundType === "fresh_grad" || profile.backgroundType === "diploma_holder")
    return "new_grad";
  if (profile.experienceLevel === "10+") return "10+";
  if (profile.experienceLevel === "5-10") return "5-9";
  return "1-4";
}

function applyExperienceId(
  draft: Draft,
  expId: ExperienceId,
): Draft {
  if (expId === "student") {
    return { ...draft, backgroundType: "under_grad", experienceLevel: "" };
  }
  if (expId === "new_grad") {
    return { ...draft, backgroundType: "fresh_grad", experienceLevel: "" };
  }
  const experienceLevel = expId === "10+" ? "10+" : expId === "5-9" ? "5-10" : "1-5";
  return { ...draft, backgroundType: "experienced", experienceLevel };
}

/** Naive free-text background parse — "senior UX designer, 6 years, fintech"
 * → role / experience chip / industry. Good enough for chip pre-selection;
 * everything stays editable on screen. */
function parseBackgroundText(text: string): {
  role: string;
  expId: ExperienceId | "";
  industry: string;
} {
  let rest = text.trim();

  let expId: ExperienceId | "" = "";
  const yearsMatch = rest.match(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)/i);
  if (yearsMatch) {
    expId = experienceIdFromYears(Number(yearsMatch[1]));
    rest = rest.replace(yearsMatch[0], " ");
  } else if (/\bstudent\b/i.test(rest)) {
    expId = "student";
    rest = rest.replace(/\bstudent\b/i, " ");
  } else if (/\b(new grad|fresh grad|graduate)\b/i.test(rest)) {
    expId = "new_grad";
    rest = rest.replace(/\b(new grad|fresh grad|graduate)\b/i, " ");
  }

  let industry = "";
  const industryAliases: Record<string, string> = {
    tech: "Technology",
    technology: "Technology",
    software: "Technology",
    fintech: "Finance",
    finance: "Finance",
    banking: "Finance",
    healthcare: "Healthcare",
    health: "Healthcare",
    retail: "Retail",
    ecommerce: "Retail",
    "e-commerce": "Retail",
    education: "Education",
    consulting: "Consulting",
  };
  for (const [alias, canonical] of Object.entries(industryAliases)) {
    const re = new RegExp(`\\b${alias}\\b`, "i");
    if (re.test(rest)) {
      industry = canonical;
      rest = rest.replace(re, " ");
      break;
    }
  }

  const role = rest
    .replace(/[,.;]+/g, " ")
    .replace(/\b(i am|i'm|a|an|with|of|experience|in)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return { role, expId, industry };
}

function initialStage(
  profile: RoleProfile | null,
  isEditMode: boolean,
  isNewRoleMode: boolean,
): Stage {
  if (isNewRoleMode) return "targetRole";
  if (isEditMode) return "bgExp";
  if (profile?.targetRole?.trim()) return "session";
  return "welcome";
}

function initialDraft(
  profile: RoleProfile | null,
  isNewRoleMode: boolean,
): Draft {
  return {
    name: profile?.name ?? "",
    targetRole: isNewRoleMode ? "" : (profile?.targetRole ?? ""),
    backgroundType: profile?.backgroundType ?? "",
    experienceLevel: profile?.experienceLevel ?? "",
    education: profile?.education ?? "",
    lastWorkedAt: profile?.lastWorkedAt ?? "",
    background: profile?.background ?? "",
    jobDescription: isNewRoleMode ? "" : (profile?.jobDescription ?? ""),
    jobDescriptionSource: isNewRoleMode
      ? "user"
      : (profile?.jobDescriptionSource ?? "user"),
    resume: profile?.resume ?? "",
    industryVertical: profile?.industryVertical ?? "",
    coreFourCompetencies: isNewRoleMode
      ? []
      : (profile?.coreFourCompetencies ?? []),
  };
}

/** `roleProfile` is always null until `useLocalStorageState` finishes reading
 * localStorage one tick after mount. Gating the inner component's mount on
 * hydration means its lazy initializers see the real value on their first
 * run — returning users land on the right step. */
export function OnboardingAgent() {
  const searchParams = useSearchParams();
  const [roleProfile, setRoleProfile, roleProfileHydrated] =
    useLocalStorageState<RoleProfile | null>(StorageKeys.roleProfile, null);
  const [, setSavedRoles] = useLocalStorageState<RoleProfile[]>(
    StorageKeys.savedRoles,
    [],
  );

  if (!roleProfileHydrated) {
    return <div className="min-h-screen w-full" aria-hidden />;
  }

  return (
    <OnboardingAgentInner
      roleProfile={roleProfile}
      setRoleProfile={setRoleProfile}
      setSavedRoles={setSavedRoles}
      isEditMode={searchParams.get("edit") === "1"}
      isNewRoleMode={searchParams.get("newRole") === "1"}
    />
  );
}

function OnboardingAgentInner({
  roleProfile,
  setRoleProfile,
  setSavedRoles,
  isEditMode,
  isNewRoleMode,
}: {
  roleProfile: RoleProfile | null;
  setRoleProfile: Dispatch<SetStateAction<RoleProfile | null>>;
  setSavedRoles: Dispatch<SetStateAction<RoleProfile[]>>;
  isEditMode: boolean;
  isNewRoleMode: boolean;
}) {
  const faq = useFaqAssistant();

  /** First name from the saved profile or the sign-up identity (social
   * providers hand us one; the email form derives it). Read after mount so
   * the server and first client render agree. */
  const [greetingName, setGreetingName] = useState("");
  useEffect(() => {
    setGreetingName(
      firstNameOf(roleProfile?.name ?? readAuthIdentity()?.name ?? ""),
    );
  }, [roleProfile?.name]);

  /** The role title being edited, captured before any in-flow rename, so the
   * matching `savedRoles` entry gets replaced in place rather than duplicated. */
  const originalTitleRef = useRef(roleProfile?.targetRole ?? "");

  const [stage, setStage] = useState<Stage>(() =>
    initialStage(roleProfile, isEditMode, isNewRoleMode),
  );
  const [draft, setDraft] = useState<Draft>(() =>
    initialDraft(roleProfile, isNewRoleMode),
  );

  // --- Step 1 state ---------------------------------------------------
  /** Testing-only A/B for the entry screen's upload affordance: 1 = mid-canvas
   * drop card, 2 = guided upload strip docked above the composer. Switched via
   * the tiny "view option" links; not production UI. */
  const [uploadHintDismissed, setUploadHintDismissed] = useState(false);
  // Orb inputs — the composer's focus/text are read via capture events on
  // the dock (no changes to the shared composer). Step-1 screens only.
  const [composerFocused, setComposerFocused] = useState(false);
  const [composerHasText, setComposerHasText] = useState(false);
  /** Bumped on every composer input event; the orb's animation loop reads it
   * each frame and turns the bump RATE into wave energy. A ref, never state:
   * re-rendering mid-keystroke re-commits the controlled input and drops the
   * character (see the composer capture-handler note below). */
  const composerPulseRef = useRef(0);
  const [parsed, setParsed] = useState<ParsedResume | null>(null);
  const [parsePhase, setParsePhase] = useState(0);
  const [parseFile, setParseFile] = useState<{ name: string; sizeKb: number } | null>(null);
  const [confirmNote, setConfirmNote] = useState<string | null>(null);
  const [manualRole, setManualRole] = useState(
    isEditMode ? (roleProfile?.targetRole ?? "") : "",
  );
  const [manualExp, setManualExp] = useState<ExperienceId | "">(
    isEditMode ? experienceIdFromProfile(roleProfile) : "",
  );
  /** The background answer: field of study for students / new grads, most
   * recent employer for experienced users. */
  const [manualStudy, setManualStudy] = useState(
    isEditMode ? (roleProfile?.education ?? roleProfile?.lastWorkedAt ?? "") : "",
  );
  const [manualIndustry, setManualIndustry] = useState(
    isEditMode ? (roleProfile?.industryVertical ?? "") : "",
  );
  const [industrySkipped, setIndustrySkipped] = useState(false);
  const timersRef = useRef<number[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --- Step 2 state ---------------------------------------------------
  const [generatedJdDraft, setGeneratedJdDraft] = useState<string | null>(null);
  const [isGeneratingJd, setIsGeneratingJd] = useState(false);
  const [jdVariant, setJdVariant] = useState(0);
  const [isEditingJd, setIsEditingJd] = useState(false);
  const [, setEditedJdText] = useState("");

  // --- Step 3 state ---------------------------------------------------
  const [coreFourError, setCoreFourError] = useState<string | null>(null);

  // Stage changes remount the composer, so stale focus/text signals must
  // clear with it (render-time adjust, per React's derived-state pattern).
  const [orbStage, setOrbStage] = useState(stage);
  if (orbStage !== stage) {
    setOrbStage(stage);
    setComposerFocused(false);
    setComposerHasText(false);
  }

  function clearTimers() {
    for (const t of timersRef.current) window.clearTimeout(t);
    timersRef.current = [];
  }
  useEffect(() => clearTimers, []);

  /** Returning users (already completed ≥1 mock interview for this role) skip the
   * first-time welcome intro and land directly on the module hub. */
  const homeHref = useMemo(() => {
    const roleTitle = roleProfile?.targetRole?.trim() ?? "";
    return reportCountForRole(roleTitle) > 0
      ? "/coach?journey=1"
      : "/coach?welcome=1";
  }, [roleProfile]);

  // --- Step 1: resume parse --------------------------------------------

  function startParsing(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const readable = ["pdf", "doc", "docx", "txt"].includes(ext);
    if (!readable || file.size > MAX_RESUME_BYTES) {
      setParseFile({ name: file.name, sizeKb: Math.round(file.size / 1024) });
      setStage("bgFailed");
      return;
    }

    clearTimers();
    setParseFile({ name: file.name, sizeKb: Math.max(1, Math.round(file.size / 1024)) });
    setParsePhase(0);
    setStage("bgParsing");

    timersRef.current = [
      window.setTimeout(() => setParsePhase(1), 900),
      window.setTimeout(() => setParsePhase(2), 2000),
      window.setTimeout(() => {
        // Mock parse result (repo-standard fixture data); the name is
        // genuinely derived from the file name.
        setParsed({
          name: nameFromFileName(file.name),
          role: "Senior UX Designer",
          years: 6,
          employer: "Acme",
          industry: "Technology",
          skills: ["Design systems", "Checkout redesign", "Accessibility", "Mentoring"],
        });
        setConfirmNote(null);
        setStage("bgConfirm");
      }, 3200),
    ];
  }

  function confirmParsed() {
    if (!parsed) return;
    const expId = experienceIdFromYears(parsed.years);
    let next = applyExperienceId(draft, expId);
    next = {
      ...next,
      name: parsed.name || next.name,
      targetRole: next.targetRole.trim() || parsed.role,
      lastWorkedAt: parsed.employer,
      industryVertical: parsed.industry,
      background: `${parsed.role} at ${parsed.employer}, ${parsed.years} years. Highlights: ${parsed.skills.join(", ")}.`,
      resume: parseFile ? `📎 ${parseFile.name}` : next.resume,
    };
    setDraft(next);
    setStage("targetRole");
  }

  /** Typed corrections on the confirm card — "actually 7 years", "at Globex",
   * "fintech". Applies what it can recognize; anything else lands in the
   * background notes so nothing typed is silently dropped. */
  function applyCorrection(text: string) {
    if (!parsed) return;
    const cleaned = text.trim();
    if (!cleaned) return;

    const next = { ...parsed };
    let recognized = false;

    const yearsMatch = cleaned.match(/(\d{1,2})\s*\+?\s*(?:years?|yrs?)/i);
    if (yearsMatch) {
      next.years = Number(yearsMatch[1]);
      recognized = true;
    }
    const employerMatch = cleaned.match(/(?:^|\s)(?:at|@)\s+([A-Za-z][\w&.\- ]{1,30})/i);
    if (employerMatch) {
      next.employer = employerMatch[1].trim();
      recognized = true;
    }
    const { industry, role } = parseBackgroundText(cleaned);
    if (industry) {
      next.industry = industry;
      recognized = true;
    }
    if (!yearsMatch && !employerMatch && !industry && role && role.length <= 40) {
      next.role = role;
      recognized = true;
    }

    if (!recognized) {
      setDraft((d) => ({
        ...d,
        background: d.background ? `${d.background}\n${cleaned}` : cleaned,
      }));
      setConfirmNote("Noted. I've added that to your background.");
      return;
    }
    setParsed(next);
    setConfirmNote("Updated. Anything else?");
  }

  // --- Step 1: manual path — one question per screen ----------------------

  /** Finishes the manual path from explicit values (state setters are async,
   * so auto-advance handlers pass what they just chose). */
  function finishManual(
    expId: ExperienceId | "",
    study: string,
    industry: string,
    skipped: boolean,
  ) {
    const studying = expId === "student" || expId === "new_grad";
    const detail = study.trim();
    // No experience answer (free text that never mentioned one) leaves the
    // draft's own values alone rather than guessing a seniority.
    let next = expId ? applyExperienceId(draft, expId) : draft;
    next = {
      ...next,
      // The role belongs to the Target step; anything parsed out of the
      // free-text shortcut only pre-fills it.
      targetRole: next.targetRole.trim() || manualRole.trim(),
      education: studying ? detail : next.education,
      lastWorkedAt: studying ? next.lastWorkedAt : detail,
      industryVertical: skipped ? "" : industry,
      background: [detail, skipped ? "" : industry].filter(Boolean).join(" · "),
    };
    setDraft(next);
    setStage("targetRole");
  }

  /** Free-text shortcut — "senior UX designer, 6 years, fintech" fills every
   * question it can answer and lands on the first one still open (or straight
   * through when nothing is left to ask). */
  function applyManualText(text: string, finishNow = false) {
    const parsedText = parseBackgroundText(text);
    const role = parsedText.role || manualRole;
    const expId = parsedText.expId || manualExp;
    const study = manualStudy;
    const industry = parsedText.industry || manualIndustry;
    const skipped = parsedText.industry ? false : industrySkipped;

    if (parsedText.role) setManualRole(parsedText.role);
    if (parsedText.expId) setManualExp(parsedText.expId);
    if (parsedText.industry) {
      setManualIndustry(parsedText.industry);
      setIndustrySkipped(false);
    }

    // From the entry screen there is no questionnaire to fall into: keep
    // whatever the sentence gave us and move to the target.
    if (finishNow) {
      finishManual(expId, study, industry, skipped);
      return;
    }
    if (!expId) {
      setStage("bgExp");
      return;
    }
    if (study.trim().length < 2) {
      setStage("bgStudy");
      return;
    }
    finishManual(expId as ExperienceId, study, industry, skipped);
  }

  function chooseExperience(expId: ExperienceId) {
    setManualExp(expId);
    setStage("bgStudy");
  }

  function chooseStudy(value: string) {
    setManualStudy(value);
    finishManual(manualExp as ExperienceId, value, manualIndustry, industrySkipped);
  }

  /** Industry now belongs to the target step — it describes the job being
   * prepared for, not the user's history. */
  function chooseIndustry(industry: string, skipped: boolean) {
    setManualIndustry(skipped ? "" : industry);
    setIndustrySkipped(skipped);
    setDraft((d) => ({ ...d, industryVertical: skipped ? "" : industry }));
    setStage("targetJd");
  }

  /** Study chips for the student / new-grad path — suggested fields plus any
   * custom value the user already typed or that came from a parsed resume. */
  const studyChips = useMemo(() => {
    const chips = [...FIELD_OF_STUDY_OPTIONS];
    const current = manualStudy.trim();
    if (current && !chips.some((c) => c.toLowerCase() === current.toLowerCase())) {
      chips.unshift(current);
    }
    return chips.slice(0, 6);
  }, [manualStudy]);

  // --- Step 2: target + job posting --------------------------------------

  const targetRoleChips = useMemo(() => {
    const chips = [...SUGGESTED_ROLES];
    const current = draft.targetRole.trim();
    if (current && !chips.some((c) => c.toLowerCase() === current.toLowerCase())) {
      chips.unshift(current);
    }
    return chips.slice(0, 6);
  }, [draft.targetRole]);

  function jdMockInput() {
    return {
      targetRole: draft.targetRole,
      backgroundType: draft.backgroundType,
      experienceLevel: draft.experienceLevel,
      industryVertical: draft.industryVertical,
    };
  }

  function handleGenerateJd() {
    setGeneratedJdDraft(null);
    setIsGeneratingJd(true);
    const input = jdMockInput();
    timersRef.current.push(
      window.setTimeout(() => {
        setJdVariant(0);
        setGeneratedJdDraft(generateMockJobDescription(input, 0));
        setIsGeneratingJd(false);
      }, 1400),
    );
  }

  function handleRegenerateJd() {
    setIsEditingJd(false);
    setGeneratedJdDraft(null);
    setIsGeneratingJd(true);
    const input = jdMockInput();
    const v = jdVariant + 1;
    timersRef.current.push(
      window.setTimeout(() => {
        setJdVariant(v);
        setGeneratedJdDraft(generateMockJobDescription(input, v));
        setIsGeneratingJd(false);
      }, 1400),
    );
  }

  function goToPlan(next: Draft) {
    const keepExisting =
      next.coreFourCompetencies.length >= 4 &&
      !coreFourValidationError(next.coreFourCompetencies);
    const withPlan = keepExisting
      ? next
      : {
          ...next,
          coreFourCompetencies: suggestCoreFour({
            targetRole: next.targetRole,
            jobDescription: next.jobDescription,
          }),
        };
    setCoreFourError(null);
    setDraft(withPlan);
    setStage("plan");
  }

  function acceptJobDescription(text: string, source: "user" | "generated") {
    const payload = text.trim();
    if (!payload) return;
    setIsEditingJd(false);
    setGeneratedJdDraft(null);
    setIsGeneratingJd(false);
    goToPlan({ ...draft, jobDescription: payload, jobDescriptionSource: source });
  }

  function acceptGeneratedJobDescription(text: string) {
    const wasEdited =
      isEditingJd || (generatedJdDraft != null && text.trim() !== generatedJdDraft);
    acceptJobDescription(text, wasEdited ? "user" : "generated");
  }

  // --- Step 3: plan -------------------------------------------------------

  function selectPlanCompetency(id: CompetencyId) {
    setCoreFourError(null);
    setDraft((d) => {
      const targetPillar = COMPETENCY_SPECS.find((spec) => spec.id === id)?.pillar;
      const keep = d.coreFourCompetencies.filter((selectedId) => {
        const pillar = COMPETENCY_SPECS.find((spec) => spec.id === selectedId)?.pillar;
        return pillar !== targetPillar;
      });
      return { ...d, coreFourCompetencies: [...keep, id] };
    });
  }

  function confirmPlan() {
    const err = coreFourValidationError(draft.coreFourCompetencies);
    if (err) {
      setCoreFourError(err);
      return;
    }
    finalizeProfile(draft);
  }

  function finalizeProfile(nextDraft: Draft) {
    const finalized: RoleProfile = {
      name: nextDraft.name.trim() || undefined,
      targetRole: nextDraft.targetRole.trim(),
      backgroundType: nextDraft.backgroundType || undefined,
      experienceLevel: nextDraft.experienceLevel || undefined,
      education: nextDraft.education.trim() || undefined,
      lastWorkedAt: nextDraft.lastWorkedAt.trim() || undefined,
      background: nextDraft.background.trim() || undefined,
      jobDescription: nextDraft.jobDescription.trim() || undefined,
      jobDescriptionSource: nextDraft.jobDescription.trim()
        ? nextDraft.jobDescriptionSource
        : undefined,
      resume: nextDraft.resume.trim() || undefined,
      industryVertical: nextDraft.industryVertical.trim() || undefined,
      coreFourCompetencies: nextDraft.coreFourCompetencies.length
        ? nextDraft.coreFourCompetencies
        : undefined,
      createdAt: roleProfile?.createdAt ?? new Date().toISOString(),
    };

    setSavedRoles((prev) => {
      if (isEditMode) {
        return upsertSavedRole(prev, finalized, originalTitleRef.current);
      }
      // Adding a role (or a first-time finalize): keep whatever was active
      // under its own title before swapping the new one in.
      const withPreviousActive = roleProfile?.targetRole?.trim()
        ? upsertSavedRole(prev, roleProfile)
        : prev;
      return upsertSavedRole(withPreviousActive, finalized);
    });
    setRoleProfile(finalized);
    setStage("session");
  }

  // --- Navigation ---------------------------------------------------------

  function prevStage(current: Stage): Stage | null {
    switch (current) {
      case "bgParsing":
      case "bgFailed":
      case "bgConfirm":
        return "bgEntry";
      case "bgEntry":
        return "welcome";
      case "bgExp":
        return isEditMode ? null : "bgEntry";
      case "bgStudy":
        return "bgExp";
      case "targetRole":
        if (isNewRoleMode) return null;
        return parsed ? "bgConfirm" : "bgStudy";
      case "targetIndustry":
        return "targetRole";
      case "targetJd":
        return "targetIndustry";
      case "plan":
        return "targetJd";
      case "session":
        return null;
      default:
        return null;
    }
  }

  const backTarget = prevStage(stage);

  function goBack() {
    if (!backTarget) return;
    clearTimers();
    setIsGeneratingJd(false);
    setGeneratedJdDraft(null);
    setIsEditingJd(false);
    setCoreFourError(null);
    setStage(backTarget);
  }

  // --- Composer -------------------------------------------------------------

  function handleSend(text: string) {
    const cleaned = text.trim();
    if (!cleaned) return;
    switch (stage) {
      case "bgEntry":
      case "bgFailed":
        applyManualText(cleaned, true);
        return;
      case "bgExp":
        applyManualText(cleaned);
        return;
      case "bgStudy":
        chooseStudy(cleaned);
        return;
      case "bgConfirm":
        applyCorrection(cleaned);
        return;
      case "targetIndustry":
        chooseIndustry(cleaned, false);
        return;
      case "targetRole": {
        // A long or multi-line answer is a pasted posting (power shortcut —
        // it answers both questions); a short one is the target role.
        if (cleaned.length >= 120 || /\n/.test(cleaned)) {
          acceptJobDescription(cleaned, "user");
        } else {
          setDraft((d) => ({ ...d, targetRole: cleaned }));
          setStage("targetIndustry");
        }
        return;
      }
      case "targetJd": {
        if (cleaned.length >= 120 || /\n/.test(cleaned)) {
          acceptJobDescription(cleaned, "user");
        } else {
          // A short reply here is a role correction, not a posting.
          setDraft((d) => ({ ...d, targetRole: cleaned }));
        }
        return;
      }
      case "session":
        faq.handleFreeText(cleaned);
        return;
      default:
        return;
    }
  }

  function handleUpload(files: File[]) {
    const file = files[0];
    if (!file) return;
    if (stage === "targetRole" || stage === "targetJd") {
      acceptJobDescription(`📎 ${file.name}`, "user");
      return;
    }
    startParsing(file);
  }

  /** Students / new grads answer with a field of study; everyone else with
   * where they have been working. Drives the background question's copy. */
  const studyingPath = manualExp === "student" || manualExp === "new_grad";

  const composerPlaceholder: string =
    stage === "bgEntry"
      ? 'Or just tell me: "senior UX designer, 6 years, fintech"…'
      : stage === "bgParsing"
        ? "One moment…"
        : stage === "bgFailed"
          ? "Or describe your background in a sentence…"
          : stage === "bgConfirm"
            ? 'Anything to correct? Just type it: "actually 7 years"…'
            : stage === "bgExp"
              ? 'Or tell me: "6 years"…'
              : stage === "bgStudy"
                ? studyingPath
                  ? 'Or type your field: "Computer Science"…'
                  : 'Type your company: "Acme"…'
                : stage === "targetRole"
                  ? 'Or type your target role: "senior UX designer"…'
                  : stage === "targetIndustry"
                    ? 'Or type the industry: "fintech"…'
                    : stage === "targetJd"
                      ? generatedJdDraft
                        ? "Paste the real posting here to replace the draft…"
                        : "Paste the job posting here…"
                      : stage === "plan"
                  ? "Confirm your selection above to continue"
                  : faq.isFaqMode
                    ? "I'm here to help."
                    : "Questions? Ask anytime";

  const prompt: string =
    stage === "welcome"
      ? `${greetingName ? `Welcome, ${greetingName}.` : "Welcome to ProofDive."}\n\nProofDive turns your real experience into interview-ready proof: you practice, and every answer is scored against the four Success Drivers so you can see exactly what to improve. Setting up takes about a minute.`
      : stage === "bgEntry"
        ? "Let's start with your resume.\n\nI'll read your role, experience, and industry from it, so everything ahead is built on your real background instead of guesswork. You'll review and confirm it all before it's saved."
        : stage === "bgParsing"
          ? "Reading your resume…"
          : stage === "bgFailed"
            ? "I couldn't read that file.\n\nScanned or image-based resumes are hard to read. A text-based PDF or DOCX works best, or skip this step."
            : stage === "bgConfirm"
            ? `Here's what I read. Does this look correct?\n\n${confirmNote ?? "Confirm it and the questionnaire is done."}`
            : stage === "bgExp"
              ? "How far along are you?\n\nThis sets the level your session is pitched at, so select the one that fits."
              : stage === "bgStudy"
                ? studyingPath
                  ? "What did you study?\n\nYour field gives me context for the examples I ask about, so select one or type your own below."
                  : "Where have you been working?\n\nYour most recent company gives me context for the examples I ask about. Type it below."
                : stage === "targetRole"
                  ? "What are you preparing for?\n\nYour sessions are built and scored against this target, so select a role or type your own below."
                  : stage === "targetIndustry"
                    ? "Which industry are you targeting?\n\nIt sharpens the scenarios and the wording of your questions. Skip if nothing fits."
                    : stage === "targetJd"
                      ? isGeneratingJd
                        ? "Drafting a posting from your background…"
                        : generatedJdDraft
                          ? "Here's a draft to work from.\n\nReview it as an interviewer would, and replace it with the real posting whenever you have one."
                          : `Target set: ${draft.targetRole.trim() || "your role"}.\n\nDo you have the job posting? Paste it below. It shapes the questions and how the evidence is assessed.`
                      : stage === "plan"
                  ? "Here's the plan I'd start with.\n\nFour competencies, one per Success Driver, selected from your role and posting to keep your first Storyboard focused. You can change any before you confirm."
                  : `You're set${greetingName ? `, ${greetingName}` : ""}.\n\nHere's your path to a strong ${draft.targetRole.trim() ? `${draft.targetRole.trim()} interview` : "interview"}. Prepare at your own pace, or begin your first session now.`;

  const promptKey = `${stage}-${stage === "targetJd" ? (generatedJdDraft ? "ready" : isGeneratingJd ? "gen" : "ask") : ""}-${confirmNote ?? ""}`;

  /** Sub-question position within the current step, shown above the heading
   * so the user always knows where they are inside a multi-question step. */
  const microStep: { index: number; total: number } | null =
    stage === "bgExp"
      ? { index: 0, total: 2 }
      : stage === "bgStudy"
        ? { index: 1, total: 2 }
        : stage === "targetRole"
          ? { index: 0, total: 3 }
          : stage === "targetIndustry"
            ? { index: 1, total: 3 }
            : stage === "targetJd"
              ? { index: 2, total: 3 }
              : null;

  const composerDisabled = stage === "bgParsing" || stage === "plan" || isEditingJd;
  const showUpload =
    (stage === "bgEntry" || stage === "bgFailed" || stage === "targetRole" || stage === "targetJd") && !isEditingJd;

  // The composer's labeled attach control is the upload path, with
  // page-wide drop while on the entry screen.
  const pageDropActive = stage === "bgEntry";
  const composerGuidesUpload = stage === "bgEntry";

  /* AI orb (step 1 only): the liquid-glass sphere behind the chat
   * bar reflects what the AI is doing — parsing a resume reads as thinking,
   * an unreadable file as error; otherwise it mirrors the user's engagement
   * with the composer. Later steps keep the plain composer for comparison. */
  const showOrb =
    stage === "bgEntry" || stage === "bgParsing" || stage === "bgFailed";
  /* Ambient AI signal, handed between two visuals so there is only ever one:
   * at rest the composer's rim glow travels around the chat bar; the moment
   * the user engages the chat (focus, or text still in it) the glow fades and
   * the orb rises out of the bar in its place. Parsing / failure own the orb
   * outright. The welcome moment carries neither — it stays clean. */
  const composerEngaged = composerFocused || composerHasText;
  const orbVisible =
    stage === "bgParsing" || stage === "bgFailed" || composerEngaged;
  const orbState: AiOrbState =
    stage === "bgParsing"
      ? "thinking"
      : stage === "bgFailed"
        ? "error"
        : composerHasText
          ? "typing"
          : composerFocused
            ? "attentive"
            : "idle";

  /** "Role · seniority · industry" provenance chips, shared by the generated
   * spec panel (Built from) and the assessment plan (Plan matched to). */
  const targetingSummary = [
    draft.targetRole,
    draft.backgroundType === "experienced"
      ? `${draft.experienceLevel} yrs`
      : draft.backgroundType === "under_grad"
        ? "Student"
        : draft.backgroundType
          ? "New grad"
          : "",
    draft.industryVertical,
  ];

  return (
    <div
      className="app-canvas app-canvas--plain relative flex h-dvh w-full flex-col overflow-hidden"
      onDragOver={
        pageDropActive
          ? (e) => {
              e.preventDefault();
            }
          : undefined
      }
      onDrop={
        pageDropActive
          ? (e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) startParsing(file);
            }
          : undefined
      }
    >
      <header className="relative z-30 flex h-14 w-full shrink-0 items-center border-b border-border bg-background/75 px-6 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <Link
          href="/"
          className="flex h-full shrink-0 items-center border-r border-border pr-6"
        >
          <Logo size="xxs" />
        </Link>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept={RESUME_ACCEPT}
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) startParsing(file);
        }}
      />

      {/* Guide video, plan step only: parked in the bottom-left corner of the
          viewport so it stays put while the plan scrolls — present for the
          whole decision without touching the reading path. Below min-[1360px]
          the in-flow header-row card takes over. */}
      {stage === "plan" ? (
        <div className="fixed bottom-10 left-6 z-20 hidden w-[232px] min-[1360px]:block">
          <SuccessDriversGuideCard />
        </div>
      ) : null}

      <div className="relative z-[2] mx-auto flex min-h-0 w-[800px] max-w-full flex-1 flex-col px-6">
        <div
          className={cn(
            "shrink-0 bg-transparent pt-4",
            stage === "welcome" && "invisible",
          )}
        >
          <OnboardingProgressHeader
            currentIndex={STAGE_STEP[stage]}
            onBack={backTarget ? goBack : undefined}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-32">
          <div className="flex min-h-full items-center justify-center py-10">
            <div className="w-full">
              {microStep ? (
                <div className="mb-3 text-overline font-medium uppercase tracking-wide text-text-secondary">
                  Question {microStep.index + 1} of {microStep.total}
                </div>
              ) : null}
              {/* On the plan step the guide sits beside the heading —
                  offered where the decision starts, without a full-width
                  banner above the cards. */}
              <div
                className={cn(
                  stage === "plan" &&
                    "flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-10",
                )}
              >
                <div className={cn(stage === "plan" && "min-w-0 flex-1")}>
                  <AgentPrompt
                    key={promptKey}
                    promptKey={promptKey}
                    prompt={prompt}
                    ariaLabel="Onboarding prompt"
                    headingClassName="text-agent-heading text-heading-teal"
                    subtextClassName="mt-3 text-agent-question text-text-primary"
                    mode="word"
                  />
                </div>
                {stage === "plan" ? (
                  <SuccessDriversGuideCard className="w-full max-w-[280px] shrink-0 sm:mt-1 sm:w-[232px] min-[1360px]:hidden" />
                ) : null}
              </div>

              {stage === "welcome" ? (
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Button
                    type="button"
                    size="lg"
                    onClick={() => setStage("bgEntry")}
                    className="h-11 gap-2 rounded-md px-5 text-body-sm font-medium"
                  >
                    Let&apos;s get started
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                  <span className="text-caption text-text-secondary">
                    About a minute · you can change anything later
                  </span>
                </div>
              ) : null}

              {/* No resume, no substitute questionnaire: the only alternative
                  is to skip, using the same chip control the flow's other
                  optional question uses. */}
              {stage === "bgEntry" ? (
                <div className="mt-8 flex flex-col gap-2">
                  <span className="text-body-sm font-semibold text-text-secondary">
                    No resume?
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <SelectionChip onClick={() => setStage("targetRole")}>
                      Skip
                    </SelectionChip>
                  </div>
                </div>
              ) : null}

              {stage === "bgParsing" && parseFile ? (
                <ParsingProgress file={parseFile} phase={parsePhase} />
              ) : null}

              {stage === "bgFailed" ? (
                <div className="mt-8 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl border-2 border-dashed border-brand-400 bg-card/60 p-5 text-left transition hover:bg-card focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <span className="block text-h5 font-medium text-foreground">
                      Try another file
                    </span>
                    <span className="mt-1 block text-caption text-text-secondary">
                      PDF or DOCX, up to 10 MB
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage("targetRole")}
                    className="rounded-xl border border-border bg-card p-5 text-left transition hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    <span className="block text-h5 font-medium text-foreground">
                      Skip
                    </span>
                    <span className="mt-1 block text-caption text-text-secondary">
                      Continue without a resume
                    </span>
                  </button>
                </div>
              ) : null}

              {stage === "bgConfirm" && parsed ? (
                <ParsedConfirmCard
                  parsed={parsed}
                  onConfirm={confirmParsed}
                  onEdit={() => {
                    setManualRole(parsed.role);
                    setManualExp(experienceIdFromYears(parsed.years));
                    setManualStudy(parsed.employer);
                    setManualIndustry(parsed.industry);
                    setIndustrySkipped(false);
                    setStage("bgExp");
                  }}
                />
              ) : null}

              {stage === "bgExp" ? (
                <ManualQuestion
                  chipsLabel="Select one"
                  chips={EXPERIENCE_OPTIONS.map((o) => o.label)}
                  selectedLabel={
                    EXPERIENCE_OPTIONS.find((o) => o.id === manualExp)?.label ?? ""
                  }
                  onPick={(label) => {
                    const opt = EXPERIENCE_OPTIONS.find((o) => o.label === label);
                    if (opt) chooseExperience(opt.id);
                  }}
                />
              ) : null}

              {stage === "bgStudy" ? (
                studyingPath ? (
                  <ManualQuestion
                    chipsLabel="Popular fields"
                    chips={studyChips}
                    selectedLabel={manualStudy}
                    onPick={chooseStudy}
                    trailing={
                      <span className="inline-flex h-9 items-center rounded-full border border-dashed border-[#adddda] px-4 text-[16px] font-medium leading-[1.3] text-text-secondary">
                        Type any field below ↓
                      </span>
                    }
                  />
                ) : (
                  <ManualQuestion
                    chipsLabel="Type your most recent company"
                    chips={[]}
                    selectedLabel={manualStudy}
                    onPick={chooseStudy}
                    trailing={
                      <span className="inline-flex h-9 items-center rounded-full border border-dashed border-[#adddda] px-4 text-[16px] font-medium leading-[1.3] text-text-secondary">
                        Type it below ↓
                      </span>
                    }
                  />
                )
              ) : null}

              {stage === "targetIndustry" ? (
                <ManualQuestion
                  chipsLabel="Optional: pick one or skip"
                  chips={INDUSTRY_OPTIONS}
                  selectedLabel={industrySkipped ? "" : manualIndustry}
                  onPick={(label) => chooseIndustry(label, false)}
                  trailing={
                    <SelectionChip
                      selected={industrySkipped}
                      onClick={() => chooseIndustry("", true)}
                    >
                      Skip
                    </SelectionChip>
                  }
                />
              ) : null}

              {stage === "targetRole" ? (
                <ManualQuestion
                  chipsLabel="Popular roles"
                  chips={targetRoleChips}
                  selectedLabel={draft.targetRole}
                  onPick={(r) => {
                    setDraft((d) => ({ ...d, targetRole: r }));
                    setStage("targetIndustry");
                  }}
                  trailing={
                    <span className="inline-flex h-9 items-center rounded-full border border-dashed border-[#adddda] px-4 text-[16px] font-medium leading-[1.3] text-text-secondary">
                      Type any role below ↓
                    </span>
                  }
                />
              ) : null}

              {stage === "targetJd" ? (
                <div className="mt-6 flex w-full flex-col gap-6">
                  {!isGeneratingJd && !generatedJdDraft ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap items-center gap-3">
                        {draft.jobDescription.trim() ? (
                          <SelectionChip onClick={() => goToPlan(draft)}>
                            Keep the posting on file
                            <ArrowRight className="size-4" aria-hidden />
                          </SelectionChip>
                        ) : null}
                        <button
                          type="button"
                          onClick={handleGenerateJd}
                          className="inline-flex items-center gap-1 text-body-sm font-medium text-[#095B73] underline-offset-2 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                        >
                          Don't have the posting? Draft one from your background
                          <ArrowRight className="size-[0.8em] shrink-0 text-primary" aria-hidden />
                        </button>
                      </div>
                    </div>
                  ) : null}

                  {isGeneratingJd ? (
                    <JdGeneratingSkeleton
                      roleTitle={draft.targetRole.trim() || undefined}
                    />
                  ) : generatedJdDraft ? (
                    <GeneratedJdPanel
                      text={generatedJdDraft}
                      targeting={targetingSummary}
                      variant={jdVariant}
                      onUseRealPosting={(text) => acceptJobDescription(text, "user")}
                      isEditing={isEditingJd}
                      onEdit={() => setIsEditingJd(true)}
                      onDoneEdit={(text) => {
                        const next = text.trim();
                        if (!next) return;
                        setGeneratedJdDraft(next);
                        setIsEditingJd(false);
                      }}
                      onRegenerate={handleRegenerateJd}
                      onAccept={acceptGeneratedJobDescription}
                      onDraftChange={setEditedJdText}
                    />
                  ) : null}
                </div>
              ) : null}

              {stage === "plan" ? (
                <AssessmentPlanPanel
                  targetRole={draft.targetRole}
                  jobDescription={draft.jobDescription}
                  selected={draft.coreFourCompetencies}
                  onSelect={selectPlanCompetency}
                  onConfirm={confirmPlan}
                  error={coreFourError}
                />
              ) : null}

              {stage === "session" ? (
                <SessionContract
                  homeHref={homeHref}
                  targetRole={draft.targetRole}
                  focusTitles={draft.coreFourCompetencies
                    .map(
                      (id) =>
                        COMPETENCY_SPECS.find((s) => s.id === id)?.title ?? "",
                    )
                    .filter(Boolean)}
                />
              ) : null}
            </div>
          </div>
        </div>

        <div
          className="fixed bottom-0 left-0 right-0 z-40 w-full"
          // These capture handlers only feed the ambient orb (focus / has-text).
          // They MUST be deferred out of the event: a synchronous re-render
          // during a keystroke re-commits the controlled input's `value` while
          // its onChange is still in flight, resetting React's value tracker and
          // dropping the character (the first keystroke, or many when typing
          // fast). Deferring lets the composer commit its own onChange first.
          onFocusCapture={(e) => {
            if ((e.target as HTMLElement).matches?.("input, textarea")) {
              setTimeout(() => setComposerFocused(true), 0);
            }
          }}
          onBlurCapture={(e) => {
            if ((e.target as HTMLElement).matches?.("input, textarea")) {
              setTimeout(() => setComposerFocused(false), 0);
            }
          }}
          onInputCapture={(e) => {
            const t = e.target as HTMLInputElement;
            if (t.matches?.("input, textarea")) {
              // Ref bump = no re-render, safe to run synchronously.
              composerPulseRef.current += 1;
              const hasText = Boolean(t.value?.trim());
              setTimeout(() => setComposerHasText(hasText), 0);
            }
          }}
        >
          {showOrb ? (
            <AiOrb
              state={orbState}
              visible={orbVisible}
              pulseRef={composerPulseRef}
            />
          ) : null}
          <div className="mx-auto flex w-full max-w-[800px] flex-col gap-2 px-6 py-5">
            {composerGuidesUpload && !uploadHintDismissed ? (
              /* Coach mark centered over the "Upload resume" pill, arrow at
                 the bubble's own center — one straight line from bubble to
                 arrow to pill. The 34px inset = (pill center from the
                 composer's right edge, 162px) − half the 256px bubble. */
              <div className="flex justify-end pr-[34px]">
                <div
                  role="status"
                  className="relative w-64 rounded-xl border border-border bg-card p-3 pr-8 shadow-[0_12px_32px_-16px_rgba(4,32,39,0.35)]"
                >
                  <p className="text-caption leading-snug text-text-primary">
                    <strong className="font-semibold">Add your resume here.</strong>{" "}
                    PDF or DOCX, up to 10 MB. Or drop it anywhere on this
                    page.
                  </p>
                  <button
                    type="button"
                    onClick={() => setUploadHintDismissed(true)}
                    aria-label="Dismiss upload hint"
                    className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full text-text-secondary transition hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 border-b border-r border-border bg-card"
                  />
                </div>
              </div>
            ) : null}
            {/* The welcome moment is a single CTA — no input to type into. */}
            {stage === "welcome" ? null : (
            <ChatComposer
              key={stage}
              placeholder={composerPlaceholder}
              onSend={handleSend}
              disabled={composerDisabled}
              uploadAccept={RESUME_ACCEPT}
              onUpload={handleUpload}
              showUploadButton={showUpload}
              uploadLabel={composerGuidesUpload ? "Upload resume" : undefined}
              // One ambient AI signal per screen. The rim glow is the resting
              // state everywhere; on the orb screens it fades out as the orb
              // takes over (see `orbVisible`), so the two never run together.
              aiGlow
              aiGlowMuted={showOrb && orbVisible}
              backgroundGlowIntensity="full"
              modeToggle={
                stage === "session"
                  ? {
                      isActive: faq.isFaqMode,
                      icon: MessageCircleQuestion,
                      activeLabel: "AI Assistant",
                      onToggle: () =>
                        faq.isFaqMode ? faq.exitFaqMode() : faq.enterFaqMode(),
                    }
                  : undefined
              }
              thread={
                stage === "session" && faq.isFaqMode ? (
                  <FaqAssistantThread
                    screenData={faq.screenData}
                    onSelectRootItem={faq.selectRootItem}
                    onSelectFollowup={faq.selectFollowup}
                    onBackToItemMenu={faq.backToItemMenu}
                    onBackToRootMenu={faq.backToRootMenu}
                  />
                ) : undefined
              }
              onThreadClose={
                stage === "session" && faq.isFaqMode ? faq.exitFaqMode : undefined
              }
              threadHeaderTitle="AI Assistant"
            />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 1 pieces
// ---------------------------------------------------------------------------

function ParsingProgress({
  file,
  phase,
}: {
  file: { name: string; sizeKb: number };
  phase: number;
}) {
  const percent = phase === 0 ? 22 : phase === 1 ? 55 : 85;
  return (
    <div
      className="mt-8 flex w-full flex-col gap-5"
      role="status"
      aria-label="Reading your resume"
    >
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
        <div className="flex min-w-0 items-baseline gap-3">
          <span className="truncate text-body-sm font-semibold text-foreground">
            {file.name}
          </span>
          <span className="shrink-0 text-caption text-text-secondary">
            {file.sizeKb} KB
          </span>
        </div>
        <span className="shrink-0 text-body-sm font-medium text-primary">
          reading…
        </span>
      </div>

      <ul className="flex flex-col gap-2.5">
        {PARSE_PHASES.map((label, i) => {
          const isDone = i < phase;
          const isCurrent = i === phase;
          return (
            <li
              key={label}
              className={cn(
                "flex items-center gap-2.5 text-body-sm",
                isDone
                  ? "text-foreground"
                  : isCurrent
                    ? "text-text-secondary"
                    : "text-text-secondary/50",
              )}
            >
              {isDone ? (
                <Check className="size-4 shrink-0 text-primary" aria-hidden />
              ) : (
                <span
                  aria-hidden
                  className={cn(
                    "size-2 shrink-0 rounded-full border",
                    isCurrent ? "border-primary" : "border-border",
                  )}
                />
              )}
              {label}
              {isCurrent ? "…" : ""}
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col gap-2">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-[linear-gradient(90deg,var(--brand-100),var(--brand-600))] transition-all duration-700"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="text-caption text-text-secondary">
          Usually under 20 seconds. You&apos;ll confirm everything before it
          is saved.
        </p>
      </div>
    </div>
  );
}

function ParsedConfirmCard({
  parsed,
  onConfirm,
  onEdit,
}: {
  parsed: ParsedResume;
  onConfirm: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="mt-8 w-full rounded-xl border border-border bg-card p-6 shadow-sm">
      <h3 className="text-h4 font-medium text-foreground">{parsed.role}</h3>
      <p className="mt-1 text-body-sm text-text-secondary">
        {parsed.years} years · {parsed.industry} · currently at {parsed.employer}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {parsed.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-brand-1000 px-3 py-1.5 text-caption font-medium text-extended-blue"
          >
            {skill}
          </span>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-body-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Looks right
          <ArrowRight className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex h-11 items-center rounded-md border border-border bg-white px-6 text-body-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          Edit details
        </button>
      </div>
    </div>
  );
}

/** One micro-question — a short chips-context label (the question itself is
 * the heading above), one chip row, and optional trailing affordance
 * (type-your-own hint, Skip). Tapping a chip answers and advances; there is
 * no Continue button. */
function ManualQuestion({
  chipsLabel,
  chips,
  selectedLabel,
  onPick,
  trailing,
}: {
  chipsLabel: string;
  chips: string[];
  selectedLabel: string;
  onPick: (label: string) => void;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="mt-8 flex w-full flex-col gap-2">
      <div className="text-body-sm font-semibold text-text-secondary">
        {chipsLabel}
      </div>
      <div className="flex flex-wrap gap-2">
        {chips.map((label) => (
          <SelectionChip
            key={label}
            selected={label.toLowerCase() === selectedLabel.trim().toLowerCase()}
            onClick={() => onPick(label)}
          >
            {label}
          </SelectionChip>
        ))}
        {trailing}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step 4 — session contract
// ---------------------------------------------------------------------------

/** Cross-cutting promises that hold in every module — the "no surprises"
 * reassurance the original contract card carried, kept as a compact strip so
 * it supports the cards instead of competing with them. */
const SESSION_PROMISES = [
  { icon: PauseCircle, text: "Pause anytime; skip or retry without losing progress" },
  { icon: Mic, text: "Voice or text, your choice" },
  { icon: FileText, text: "Every session ends with a proof report" },
];

/**
 * The three modules as module CTAs, in the order the product recommends them
 * (see `pickRecommendedNextStep`): learn the standard, build the evidence,
 * then perform. Each card carries only what is glanceable — a step label, a
 * short title, and one line of "what this costs / what you get" — so the
 * screen teaches the journey without a wall of copy. The session stays the
 * filled teal hero it has always been.
 */
function journeyCards(targetRole: string, focusTitles: string[]) {
  const role = targetRole.trim();
  const focus =
    focusTitles.length > 0
      ? `${focusTitles[0]}${
          focusTitles.length > 1 ? ` +${focusTitles.length - 1} more` : ""
        }`
      : "Your focus areas";
  return [
    {
      href: "/training",
      step: "Step 1",
      icon: <GraduationCap />,
      title: "Learn the standard",
      subtitle: "4 Success Driver guides · ~10 min each",
      illustrationSrc: "/brand/illustration-2.svg",
      variant: "gray" as const,
      wide: false,
    },
    {
      href: "/storyboard",
      step: "Step 2",
      icon: <BookOpen />,
      title: "Build your storyboard",
      subtitle: `${focus} · ~15 min each`,
      illustrationSrc: "/brand/illustration-1.svg",
      variant: "gray" as const,
      wide: false,
    },
    {
      href: "/interview",
      step: "Step 3",
      icon: <UserCheck />,
      title: "Start your first session",
      subtitle: role
        ? `${role} · 3 questions · ~8 minutes`
        : "3 questions · ~8 minutes",
      illustrationSrc: "/brand/illustration-4.svg",
      variant: "primary" as const,
      wide: true,
    },
  ];
}

function SessionContract({
  homeHref,
  targetRole,
  focusTitles,
}: {
  homeHref: string;
  targetRole: string;
  focusTitles: string[];
}) {
  const cards = journeyCards(targetRole, focusTitles);
  return (
    <>
      <div className="mt-6 grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <CardButton
            key={card.href}
            href={card.href}
            variant={card.variant}
            icon={card.icon}
            title={
              <>
                <span
                  className={cn(
                    "mb-1 block text-overline font-medium tracking-[0.5px] uppercase",
                    card.variant === "primary"
                      ? "text-primary-foreground/75"
                      : "text-text-secondary",
                  )}
                >
                  {card.step}
                </span>
                {card.title}
              </>
            }
            subtitle={card.subtitle}
            illustrationSrc={card.illustrationSrc}
            className={cn(card.wide && "sm:col-span-2")}
          />
        ))}
      </div>

      <ul className="mt-4 flex w-full flex-col gap-2">
        {SESSION_PROMISES.map(({ icon: Icon, text }) => (
          <li
            key={text}
            className="flex items-center gap-2 text-caption text-text-secondary"
          >
            <Icon className="size-4 shrink-0 text-primary" aria-hidden />
            {text}
          </li>
        ))}
      </ul>

      <p className="mt-6 text-agent-question text-text-primary">
        Prefer to look around?{" "}
        <Link
          href={homeHref}
          className="inline-flex items-center gap-1 font-medium text-[#095B73] underline-offset-2 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          go to home
          <ArrowRight className="size-[0.7em] shrink-0 text-primary" aria-hidden />
        </Link>
      </p>
    </>
  );
}

/** Skeleton loader shown while Proofy "thinks" — bar widths/heights mirror
 * the design's two line-pairs; the shimmer sweep reuses the design's motion
 * timing (2s, linear, infinite) via `animate-shimmer-sweep`. */
function JdGeneratingSkeleton({ roleTitle }: { roleTitle?: string }) {
  const shimmerBar =
    "rounded-full bg-[linear-gradient(90deg,var(--brand-100),var(--brand-400),var(--brand-700),var(--brand-1000),var(--brand-700),var(--brand-400),var(--brand-100))] bg-[length:200%_100%] animate-shimmer-sweep";
  return (
    <div
      className="mt-6 flex w-full flex-col gap-6"
      role="status"
      aria-label="Proofy is drafting a job description"
    >
      <div className="flex flex-col gap-1">
        <p className="text-body-sm font-medium text-heading-teal">
          Proofy is drafting…
        </p>
        <p className="text-caption text-text-secondary">
          {roleTitle
            ? `Writing a ${roleTitle} job description from your answers.`
            : "Writing a job description from your answers."}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <div className={cn("h-6 w-full", shimmerBar)} />
        <div className={cn("h-6 w-1/2", shimmerBar)} />
      </div>
      <div className="flex flex-col gap-2">
        <div className={cn("h-4 w-full", shimmerBar)} />
        <div className={cn("h-4 w-1/2", shimmerBar)} />
      </div>
    </div>
  );
}
