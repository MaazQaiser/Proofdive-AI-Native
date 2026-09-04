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
  ArrowUpRight,
  BookOpen,
  FileText,
  Gauge,
  GraduationCap,
  MessageCircleQuestion,
  Mic,
  PauseCircle,
  Sparkles,
  UserCheck,
  X,
  type LucideIcon,
} from "lucide-react";

import { AgentPrompt } from "@/components/agents/AgentPrompt";
import { AiOrb, type AiOrbState } from "@/components/chat/AiOrb";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { FaqAssistantThread } from "@/components/faq/FaqAssistantThread";
import { AiProgressStatus } from "@/components/onboarding/AiProgressStatus";
import { WelcomeAmbience } from "@/components/onboarding/WelcomeAmbience";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  | "bgStudy"
  | "bgExp"
  | "bgInterests"
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
  bgStudy: 0,
  bgExp: 0,
  bgInterests: 0,
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
  interests: string;
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

/* Roles by seniority band. Forty options is far too many to show flat, so the
 * question renders one band at a time (`ROLE_BANDS` below drives the group
 * picker): the user says how senior they are, then reads ten roles instead of
 * scanning forty. Typing still bypasses the whole thing. */
const ROLE_BANDS = [
  {
    id: "internship",
    label: "Internships",
    roles: [
      "HR Intern",
      "Investment Banking Intern",
      "Marketing Intern",
      "Sales Intern",
      "UX Design Intern",
      "Software Engineering Intern",
      "Data Analyst Intern",
      "Product Management Intern",
      "Finance Intern",
      "Operations Intern",
    ],
  },
  {
    id: "entry",
    label: "Entry-Level",
    roles: [
      "Talent Acquisition Specialist",
      "UX Design Specialist",
      "Business Analyst",
      "Data Analyst",
      "Software Engineer",
      "Marketing Coordinator",
      "Sales Development Representative",
      "Financial Analyst",
      "Customer Success Associate",
      "Operations Analyst",
    ],
  },
  {
    id: "mid",
    label: "Mid-Management",
    roles: [
      "HR Manager",
      "UX Design Manager",
      "Product Manager",
      "Marketing Manager",
      "Sales Manager",
      "Finance Manager",
      "Operations Manager",
      "Customer Success Manager",
      "Strategy Manager",
      "Transformation Manager",
    ],
  },
  {
    id: "senior",
    label: "Senior Management",
    roles: [
      "HR Director",
      "Design Director",
      "Product Director",
      "Marketing Director",
      "Sales Director",
      "Finance Director",
      "Operations Director",
      "Customer Success Director",
      "Strategy Director",
      "Transformation Director",
    ],
  },
] as const;

type RoleBandId = (typeof ROLE_BANDS)[number]["id"];

const INDUSTRY_OPTIONS = [
  "Technology",
  "Financial Services",
  "Consulting",
  "Advertising & Creative",
  "Retail & Consumer",
  "Healthcare",
  "Government & Public Sector",
  "Energy",
  "Hospitality & Tourism",
  "Education",
];

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

/* Every value the rest of the flow can produce. The resume parse and the
 * free-text shortcut ("6 years") still yield the granular ones and
 * `applyExperienceId` maps all of them, so the union stays complete even
 * though the QUESTION now offers only the two in STATUS_OPTIONS below. */
type ExperienceId = "student" | "new_grad" | "1-4" | "5-9" | "10+";

/* Status. The brief said "fresh graduate vs experienced professional", and
 * this ladder answers exactly that — `applyExperienceId` folds Student and
 * New grad into backgroundType "fresh_grad"/"under_grad" and every year band
 * into "experienced". Offering the bands rather than the bare binary costs
 * the user nothing (still one tap) and keeps `experienceLevel`, which
 * `generateMockJobDescription` uses to pitch the posting — a two-way question
 * would throw that away and leave the JD generator on its fallback. */
const STATUS_OPTIONS = [
  { id: "student", label: "Student" },
  { id: "new_grad", label: "New grad" },
  { id: "1-4", label: "1–4 yrs" },
  { id: "5-9", label: "5–9 yrs" },
  { id: "10+", label: "10+ yrs" },
] as const;

/** Suggested interests. Deliberately broad and non-professional: this is the
 *  one question on the path that is not about work, and the chips are there to
 *  show that, not to constrain the answer — anything can be typed instead. */
const INTEREST_OPTIONS = [
  "Sport",
  "Music",
  "Reading",
  "Travel",
  "Cooking",
  "Volunteering",
];

/* The welcome screen's "How it works": the product's actual loop, in the order
 * the user will walk it, and each icon is the one that will be sitting in the
 * left rail from the next screen on — so the list teaches the navigation
 * rather than decorating the hero. Bold carries the module name, because the
 * name is the thing worth remembering; the rest is one clause of plain
 * explanation. */
const HOW_IT_WORKS: Array<{ icon: LucideIcon; name: string; detail: string }> = [
  { icon: BookOpen, name: "Storyboard", detail: "real experience, turned into proof" },
  { icon: UserCheck, name: "Mock Interview", detail: "timed, adaptive follow-ups" },
  { icon: Gauge, name: "Report", detail: "scored, with what to improve next" },
];

const RESUME_ACCEPT = ".pdf,.doc,.docx,.txt";
const MAX_RESUME_BYTES = 10 * 1024 * 1024;

/** Staged parse ticks — honest progress, never a bare spinner. */
const PARSE_PHASES = [
  "Reading the document",
  "Found 3 roles across 6 years",
  "Matching your skills to interview topics",
];

/* The two lists below name what their generators actually assemble — see
 * `generateMockJobDescription` (title from role + level + industry, then a
 * responsibilities list, then the "what we're looking for" list) and
 * `suggestCoreFour` (scores role + posting against each competency's keyword
 * set and keeps one winner per Success Driver). Kept honest on purpose: a
 * named sequence that does not match the work is a spinner that also lies. */
const JD_DRAFT_PHASES = [
  "Reading your role, level and industry",
  "Drafting the responsibilities",
  "Adding what they would look for",
];

const PLAN_PHASE_TAIL = [
  "Matching it against the competency framework",
  "Picking the strongest fit in each Success Driver",
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
  if (isEditMode) return "bgStudy";
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
    interests: profile?.interests ?? "",
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
  /** Education — asked of everyone on the no-resume path. (The resume-parse
   * path still fills it, or `lastWorkedAt`, from what it read.) */
  const [manualStudy, setManualStudy] = useState(
    isEditMode ? (roleProfile?.education ?? roleProfile?.lastWorkedAt ?? "") : "",
  );
  /** Hobbies / personal interests — question 3 on the no-resume path. */
  const [manualInterests, setManualInterests] = useState(
    isEditMode ? (roleProfile?.interests ?? "") : "",
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
  const [jdPhase, setJdPhase] = useState(0);
  /** The Core Four inference used to be instant and therefore invisible —
   *  the user arrived at four chosen competencies with no account of where
   *  they came from. It is an inference over the posting, so it now says so
   *  while it runs. */
  const [planPhase, setPlanPhase] = useState<number | null>(null);
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
    interests = "",
  ) {
    const detail = study.trim();
    // No experience answer (free text that never mentioned one) leaves the
    // draft's own values alone rather than guessing a seniority.
    let next = expId ? applyExperienceId(draft, expId) : draft;
    next = {
      ...next,
      // The role belongs to the Target step; anything parsed out of the
      // free-text shortcut only pre-fills it.
      targetRole: next.targetRole.trim() || manualRole.trim(),
      // Education is now asked of everyone, so it is no longer the
      // studying-path-only branch it was; `lastWorkedAt` is not collected on
      // this path at all any more (the resume parse still fills it).
      education: detail || next.education,
      industryVertical: skipped ? "" : industry,
      interests: interests.trim() || next.interests,
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

  /* The no-resume questionnaire, in the order the client specified:
   *   1. education   (bgStudy)
   *   2. status      (bgExp)
   *   3. interests   (bgInterests)
   * Education leads, which is why it is asked of everyone rather than
   * branching on status the way it used to — at question 1 the status is not
   * known yet, and a question that changes shape based on an answer the user
   * has not given is the thing to avoid, not a feature. */
  function chooseStudy(value: string) {
    setManualStudy(value);
    setDraft((d) => ({ ...d, education: value.trim() }));
    setStage("bgExp");
  }

  function chooseExperience(expId: ExperienceId) {
    setManualExp(expId);
    setDraft((d) => applyExperienceId(d, expId));
    setStage("bgInterests");
  }

  function chooseInterests(value: string) {
    const detail = value.trim();
    setManualInterests(detail);
    setDraft((d) => ({ ...d, interests: detail }));
    finishManual(manualExp as ExperienceId, manualStudy, manualIndustry, industrySkipped, detail);
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

  /* Which seniority band's roles are on screen. Defaults to whichever band
   * already contains the drafted role (so Back lands on the list the answer
   * came from), then to the one the background answer implies, then Entry. */
  const [roleBand, setRoleBand] = useState<RoleBandId>(() => {
    const current = (roleProfile?.targetRole ?? "").trim().toLowerCase();
    const owning = ROLE_BANDS.find((b) =>
      b.roles.some((r) => r.toLowerCase() === current),
    );
    return owning?.id ?? "entry";
  });

  const targetRoleChips = useMemo(() => {
    const band = ROLE_BANDS.find((b) => b.id === roleBand) ?? ROLE_BANDS[1];
    const chips: string[] = [...band.roles];
    // A typed role is kept at the head of whatever band is open, so it stays
    // visibly selected instead of vanishing when the band changes.
    const current = draft.targetRole.trim();
    if (current && !chips.some((c) => c.toLowerCase() === current.toLowerCase())) {
      chips.unshift(current);
    }
    return chips;
  }, [draft.targetRole, roleBand]);

  function jdMockInput() {
    return {
      targetRole: draft.targetRole,
      backgroundType: draft.backgroundType,
      experienceLevel: draft.experienceLevel,
      industryVertical: draft.industryVertical,
    };
  }

  /** One timeline for both draft and redraft. 3.4s rather than the old 1.4s:
   *  three named steps need long enough to be read, and a real generation call
   *  will not be faster than this — the old figure under-represented the work
   *  it stands in for. Paced like the resume parse (3.2s) so the two waits in
   *  the flow feel like the same machine. */
  function runJdGeneration(variant: number) {
    setGeneratedJdDraft(null);
    setJdPhase(0);
    setIsGeneratingJd(true);
    const input = jdMockInput();
    timersRef.current.push(
      window.setTimeout(() => setJdPhase(1), 1100),
      window.setTimeout(() => setJdPhase(2), 2300),
      window.setTimeout(() => {
        setJdVariant(variant);
        setGeneratedJdDraft(generateMockJobDescription(input, variant));
        setIsGeneratingJd(false);
      }, 3400),
    );
  }

  function handleGenerateJd() {
    runJdGeneration(0);
  }

  function handleRegenerateJd() {
    setIsEditingJd(false);
    runJdGeneration(jdVariant + 1);
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

    // Coming back to a plan that already exists is navigation, not inference:
    // only narrate when something is actually being worked out.
    if (keepExisting) {
      setPlanPhase(null);
      return;
    }
    setPlanPhase(0);
    timersRef.current.push(
      window.setTimeout(() => setPlanPhase(1), 900),
      window.setTimeout(() => setPlanPhase(2), 1800),
      window.setTimeout(() => setPlanPhase(null), 2700),
    );
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
      interests: nextDraft.interests.trim() || undefined,
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
        // Nothing precedes step 1 as a stage any more; Back reopens the
        // welcome overlay (wired at the progress header).
        return null;
      case "bgStudy":
        return isEditMode ? null : "bgEntry";
      case "bgExp":
        return "bgStudy";
      case "bgInterests":
        return "bgExp";
      case "targetRole":
        if (isNewRoleMode) return null;
        return parsed ? "bgConfirm" : "bgInterests";
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
      case "bgStudy":
        chooseStudy(cleaned);
        return;
      case "bgExp":
        applyManualText(cleaned);
        return;
      case "bgInterests":
        chooseInterests(cleaned);
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

  const composerPlaceholder: string =
    stage === "bgEntry"
      ? 'Or just tell me: "senior UX designer, 6 years, fintech"…'
      : stage === "bgParsing"
        ? "One moment…"
        : stage === "bgFailed"
          ? "Or describe your background in a sentence…"
          : stage === "bgConfirm"
            ? 'Anything to correct? Just type it: "actually 7 years"…'
            : stage === "bgStudy"
              ? 'Or type your field: "Computer Science"…'
              : stage === "bgExp"
                ? 'Or tell me: "6 years"…'
                : stage === "bgInterests"
                  ? 'Or type your own: "long-distance running, chess"…'
                : stage === "targetRole"
                  ? 'Type your target role. Example: "Senior UX Designer."'
                  : stage === "targetIndustry"
                    ? 'Type the industry. Example: "fintech."'
                    : stage === "targetJd"
                      ? generatedJdDraft
                        ? "Paste the real posting here to replace the draft…"
                        : "Paste the Job Description here, or upload it."
                      : stage === "plan"
                  ? "Confirm your selection above to continue"
                  : faq.isFaqMode
                    ? "I'm here to help."
                    : "Questions? Ask anytime";

  const prompt: string =
    stage === "bgEntry"
        ? "Let's start with your background.\n\nUpload your resume so ProofDive can identify your roles, education, experience, and possible story anchors. You will review and confirm anything we use before it shapes your MyStoryBoard journey."
        : stage === "bgParsing"
          ? "Reading your resume…"
          : stage === "bgFailed"
            ? "I couldn't read that file.\n\nScanned or image-based resumes are hard to read. A text-based PDF or DOCX works best, or skip this step."
            : stage === "bgConfirm"
            ? `Here's what I read. Does this look correct?\n\n${confirmNote ?? "Confirm it and the questionnaire is done."}`
            : stage === "bgStudy"
              ? "What did you study?\n\nYour field gives me context for the examples I ask about, so select one or type your own below."
              : stage === "bgExp"
                ? "How far along are you?\n\nThis sets the level your session is pitched at, so select the one that fits."
                : stage === "bgInterests"
                  ? "What do you do outside work?\n\nInterests are where some of the strongest stories come from — teams you have run, things you have organised, skills you taught yourself. Select any or type your own."
                : stage === "targetRole"
                  ? "What role are you preparing for?\n\nYour target role sets the direction for your preparation. ProofDive uses it to tailor your journey around the role you are preparing for."
                  : stage === "targetIndustry"
                    ? `Which industry is this ${draft.targetRole.trim() || "role"} role in?\n\nThe same role can carry different requirements across industries. Select the industry you are targeting so ProofDive can tailor your preparation to the right context.`
                    : stage === "targetJd"
                      ? isGeneratingJd
                        ? "Drafting a posting from your background…"
                        : generatedJdDraft
                          ? `We've prepared a working draft for ${draft.targetRole.trim() || "your role"}${draft.industryVertical.trim() ? ` in ${draft.industryVertical.trim()}` : ""}.\n\nBased on your role and industry, this draft gives ProofDive a working view of the responsibilities and expectations relevant to your preparation. It is not an employer-authored Job Description, so review it before continuing.`
                          : `Do you have the Job Description for the ${draft.targetRole.trim() || "target"} role?\n\nA Job Description gives ProofDive the clearest view of what this specific role requires. We use it to tailor your Core Four competencies, shape your questions, and where your preparation should focus.`
                      : stage === "plan"
                  ? planPhase !== null
                    ? "Working out where to start…"
                    : `Your recommended Core Four\n\nBased on your ${draft.targetRole.trim() || "target"} role and the ${
                        draft.jobDescriptionSource === "generated"
                          ? "working draft you approved"
                          : "Job Description you provided"
                      }, ProofDive has identified the Core Four competencies most critical to your target role. They are the strongest starting point for building role-relevant interview examples. Review the recommendations and make any changes before continuing.`
                  : `You're set${greetingName ? `, ${greetingName}` : ""}.\n\nYour preparation plan is ready, built around your background and the ${draft.targetRole.trim() || "target"} role. We recommend following the sequence below, but you can also jump straight into MyStoryBoard to develop your interview examples or go directly to Mock Studios to stress test your interviewing skills.`;

  /* Any flag that swaps the prompt text WITHOUT changing `stage` has to be in
   * this key, or TypingText keeps its old typed state and the two prompts read
   * as one merged sentence. */
  const promptKey = `${stage}-${stage === "targetJd" ? (generatedJdDraft ? "ready" : isGeneratingJd ? "gen" : "ask") : ""}-${confirmNote ?? ""}-${planPhase !== null ? "p" : ""}`;

  /** Sub-question position within the current step, shown above the heading
   * so the user always knows where they are inside a multi-question step. */
  const microStep: { index: number; total: number } | null =
    stage === "bgStudy"
      ? { index: 0, total: 3 }
      : stage === "bgExp"
        ? { index: 1, total: 3 }
        : stage === "bgInterests"
          ? { index: 2, total: 3 }
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
  /* One ambient AI signal, and it is one object: while the orb is mounted its
   * shader draws BOTH the resting light traveling around the chat bar and the
   * sphere that light condenses into, morphing between them (so the composer's
   * own CSS rim glow steps aside entirely — see `aiGlow` below). Engagement
   * with the chat drives the morph; parsing / failure hold the sphere. */
  const orbEngaged =
    stage === "bgParsing" ||
    stage === "bgFailed" ||
    composerFocused ||
    composerHasText;
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
      {/* The welcome moment's ambient AI light — the entry screen is the only
          stage that carries it, because it is the only one with no input of
          its own to answer. From step 1 onward the AI's presence is the chat
          bar's own glow instead, so there are never two of them at once. */}
      {stage === "welcome" ? <WelcomeAmbience /> : null}

      {/* App-level chrome. The theme switch belongs HERE rather than beside
          the flow's own controls: "Back" and "Step 2 of 4" describe progress
          through the questions, while the theme is a property of the app the
          questions happen to live in. Keeping the two on separate rows means
          the switch never reads as part of answering, it sits outside the
          800px reading column so it cannot compete with the prompt, and it is
          present on every stage including the welcome screen (where only the
          progress row is hidden). Far right also puts it where users already
          reach for account-level controls. */}
      <header
        className={cn(
          "relative z-30 flex h-14 w-full shrink-0 items-center justify-between px-6",
          /* On the welcome stage the mark is the hero below, so the header
             carries nothing but the switch — and the rule and glass would
             only draw a line across the ambience for no content. From step 1
             the chrome returns and the mark settles into its corner. */
          stage === "welcome"
            ? "bg-transparent"
            : "border-b border-border bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
        )}
      >
        {stage === "welcome" ? null : (
          <Link
            href="/"
            className="flex h-full shrink-0 items-center border-r border-border pr-6"
          >
            {/* Same `--primary` the welcome hero's mark carries, so the
                wordmark does not change colour when the flow moves off the
                welcome screen. The default `--logo-ink` (#062C35) is a brand
                token too, but it is the deepest one on the ladder and reads
                as near-black rather than as the brand. */}
            <Logo size="xxs" className="text-primary" />
          </Link>
        )}
        <ThemeToggle className="-mr-1.5 ml-auto" />
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

      {/* Everything below the header sits on its own ground. #F5F5F3 is the
          foundation's own `:root --background`, but it cannot be reached as
          `bg-background` here: `.app-canvas` on the page shell reassigns
          `--background: var(--canvas)` (white), so the token is shadowed for
          every descendant. In dark the class stands down entirely and the
          canvas keeps painting #0a1013, exactly as before.
          Full width and flex-1 so the colour fills the whole area rather than
          the 800px reading column, and a separate element so the header keeps
          its own translucent surface untouched. On the welcome stage it stands
          down entirely: there the ambience IS the ground, and a flat fill over
          it would paint the light out. */}
      <div
        className={cn(
          "relative flex min-h-0 w-full flex-1 flex-col",
          stage === "welcome" ? "bg-transparent" : "bg-[#F5F5F3] dark:bg-transparent",
        )}
      >
        <div className="relative z-[2] mx-auto flex min-h-0 w-[800px] max-w-full flex-1 flex-col px-6">
          <div
            className={cn(
              "shrink-0 bg-transparent pt-4",
              stage === "welcome" && "invisible",
            )}
          >
            <OnboardingProgressHeader
              currentIndex={STAGE_STEP[stage]}
              onBack={
                backTarget
                  ? goBack
                  : stage === "bgEntry"
                    ? () => setStage("welcome")
                    : undefined
              }
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
                {stage === "welcome" ? (
                  /* The welcome stage is composed here rather than through
                     AgentPrompt, because it is the only stage that asks
                     nothing. Typing is the agent's speaking voice — from step 1
                     on, every prompt is a question, so the effect earns itself.
                     Spending it on a fixed sentence nobody was asked is the
                     exact texture we are trying to get rid of, and AgentPrompt
                     can only carry a heading/subtext pair anyway, not a mark, a
                     display line and a control. One wrapper, one entrance: the
                     composition arrives as a single object, using the same rise
                     the landing hero uses (globals.css --animate-landing-rise),
                     so the screen behind sign-in arrives the way the screen in
                     front of it did. */
                  <div className="motion-safe:animate-landing-rise flex w-full flex-col items-start">
                    {/* `sm` (48px) is sized against the headline, not chosen
                        off the ladder. The asset is an icon (89.6% of the box)
                        plus the wordmark, and the icon is the densest ink here
                        — at 48px it renders 43px against the headline's 33.6px
                        caps, so the mark reads as a signature above the line
                        rather than competing with it. */}
                    {/* The default `--logo-ink` (#062C35) is a brand token,
                        but it is the deepest one on the ladder — at hero size
                        over the ambience it just reads black. `--primary` is
                        the brand's anchor teal, so the mark reads as the brand
                        rather than as dark type, and against the deep
                        --heading-teal line below it the bright mark and the
                        dark headline each keep their own job. The wordmark is
                        painted as a mask over currentColor, so a text class is
                        the whole change. */}
                    <Logo size="sm" className="max-w-full text-primary" />

                    {/* `--primary`, matching the logo above it exactly — one
                        brand ink for the mark and the message.

                        Known and accepted: against this plate --primary
                        measures 2.37:1, under the 3:1 WCAG asks of a 48px bold
                        line, so the headline sits lighter than the paragraph
                        beneath it. --extended-blue (#006F8F) is the same teal a
                        few steps deeper and clears it at 4.07:1 — swap the two
                        classes here and on the Logo above if that call is ever
                        revisited.

                        One ink, not the landing's two-tone: measured on this
                        plate the second tone falls to 1.16:1 against the first
                        in dark, and a flat two-colour split is the non-gradient
                        version of the gradient-headline tic. Authority comes
                        from the family instead — Gilroy Bold against the flow's
                        Inter Medium — which is also why 48px can outrank step
                        1's 40px without the jump reading as an accident.
                        6vw (not the landing's 4.2vw) because this column is
                        fixed at 800px rather than fluid, so the headline pins
                        at 48px exactly where the column stops being fixed and
                        scales only below it. Broken by hand on the full stop so
                        the line break is a syntactic hinge, not wherever 752px
                        ran out. `cap-baseline` trims Gilroy's ~6px of shoulder
                        and ~14px of descent space so the authored 32/20 gaps
                        are the gaps the eye actually sees; `-ml-[0.065em]`
                        cancels the 'E's left sidebearing, since the logo's
                        first tile has none. */}
                    <h1 className="mt-8 -ml-[0.065em] w-full whitespace-pre-line cap-baseline font-gilroy text-[clamp(2rem,6vw,3rem)] font-bold leading-[1.12] tracking-[-0.04em] text-heading-teal">
                      {`Hi${greetingName ? ` ${greetingName}` : ""}, I'm your assigned\nProofDive Consultant.`}
                    </h1>

                    {/* 28rem, the landing's own measure: ~62 characters,
                        against the 752px column the old paragraph ran to.
                        Demoting this from 28px to 20px is the change that
                        creates a second read where there was none. */}
                    {/* 42rem, not the 30rem it was: the headline runs the
                        column's full 752px and a 480px paragraph under it read
                        as a narrow inset rather than the same block. Measured
                        on this string, 672px is 72 characters over 3 lines —
                        the top of the 45-75 band that stays comfortable, and
                        the widest it can go before the measure starts costing
                        the reader. The full 752px would be 81. */}
                    <p className="mt-5 max-w-[42rem] text-body-lg leading-7 text-text-primary/80">
                      I will work with you through a guided experience to help you
                      prepare for your target role. We will deep dive into your real
                      experiences, develop interview ready examples, and stress test
                      them under realistic interview conditions.
                    </p>

                    {/* "How it works" sits BEFORE the CTA because it answers a
                        pre-commitment question — what am I about to do — and
                        that reassurance is worth nothing after the click.

                        Held to the paragraph's own 30rem measure rather than
                        run to the 752px column: the block above it tapers
                        (headline ~640px, paragraph 480px, CTA row ~380px), and
                        a full-width list at the bottom would invert that and
                        leave the composition bottom-heavy. At 30rem every row
                        still sets on one line, so the three read as a column of
                        three, not a paragraph of three.

                        The chips are the modal's, minus its solid `bg-muted`
                        fill: on a card that fill was correct, but here they sit
                        on the ambience, and an opaque disc punches a hole in
                        the light. A hairline ring over a transparent centre
                        lets the plate through, so they read as lit by the same
                        source as everything else. Ink stays neutral — the
                        headline and the CTA are already carrying the teal, and
                        a third saturated element would flatten the hierarchy
                        the CTA depends on. */}
                    <div className="mt-10 w-full max-w-[42rem]">
                      {/* Not text-secondary: over the light plate that ink
                          measures 3.20:1, and a 12px label needs 4.5. At 70%
                          the primary ink gives 5.98 light / 8.66 dark and still
                          reads as a label rather than a heading. */}
                      <p className="text-overline font-medium uppercase tracking-wide text-text-primary/70">
                        How it works
                      </p>
                      <ul className="mt-4 flex flex-col gap-3.5">
                        {HOW_IT_WORKS.map(({ icon: Icon, name, detail }) => (
                          <li key={name} className="flex items-center gap-3">
                            <span
                              aria-hidden
                              className="grid size-9 shrink-0 place-items-center rounded-full border border-primary/25 bg-primary/[0.08] text-heading-teal"
                            >
                              <Icon className="size-[18px]" strokeWidth={1.75} />
                            </span>
                            <span className="min-w-0 text-body-sm leading-6 text-text-primary/80">
                              <span className="font-semibold text-text-primary">
                                {name}
                              </span>{" "}
                              — {detail}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* The reassurance belongs beside the control it reassures
                        about, not stacked above it as a third rank of type. */}
                    <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 motion-safe:animate-landing-cta">
                      <Button
                        type="button"
                        onClick={() => setStage("bgEntry")}
                        /* A brand-tinted lift, welcome screen only. The CTA
                           sits on the ambience plate rather than on a flat
                           page, and in light mode its fill measures 3.04:1
                           against that wash — a pass, but with no margin. The
                           shadow makes the button's edge independent of
                           whatever the plate is doing behind it, and reads as
                           elevation rather than an added border. */
                        className="h-11 rounded-md pl-6! pr-4! text-body-sm font-medium shadow-[0_4px_16px_-4px_rgba(14,154,181,0.55)] dark:shadow-[0_6px_20px_-6px_rgba(0,0,0,0.75)]"
                      >
                        Begin
                        <ArrowRight />
                      </Button>
                      <span className="text-caption text-text-primary/80">
                        Let&apos;s take it one step at a time.
                      </span>
                    </div>
                  </div>
                ) : (
                  /* On the plan step the guide sits beside the heading —
                     offered where the decision starts, without a full-width
                     banner above the cards. */
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
                        /* `--extended-blue`, the same ink the storyboard's question
                         headings carry — one colour on every 40px agent
                         heading in the product.

                         Not `--primary`, the brighter anchor the welcome hero
                         and the logo use: at this weight it measures 3.05:1 on
                         `--app-ground`, clearing the 3:1 the size needs by
                         0.05 and nothing more, and it reads washed on Inter
                         Medium — the hero can carry it only because Gilroy
                         Bold lays down far more ink per glyph.
                         `--extended-blue` is the same teal a few steps deeper:
                         5.24:1 light, 11.37:1 dark. */
                      headingClassName="text-agent-heading text-extended-blue"
                        subtextClassName="mt-3 text-agent-question text-text-primary"
                        mode="word"
                      />
                    </div>
                    {stage === "plan" ? (
                      <SuccessDriversGuideCard className="w-full max-w-[280px] shrink-0 sm:mt-1 sm:w-[232px] min-[1360px]:hidden" />
                    ) : null}
                  </div>
                )}

                {/* No resume, no substitute questionnaire: the only alternative
                    is to skip, using the same chip control the flow's other
                    optional question uses. */}
                {stage === "bgEntry" ? (
                  <div className="mt-8 flex flex-col gap-2">
                    <span className="text-body-sm font-semibold text-text-secondary">
                      No resume?
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {/* Not "Skip" any more: this path no longer skips
                          anything, it swaps one long input for three short
                          questions. Saying so up front is what keeps the
                          choice honest — a chip labelled "Skip" that opens a
                          questionnaire is a trapdoor. */}
                      <SelectionChip onClick={() => setStage("bgStudy")}>
                        Answer 3 quick questions instead
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
                      setStage("bgStudy");
                    }}
                  />
                ) : null}

                {/* The no-resume questionnaire — one question per screen, in
                    the client's order: education, status, interests. Each is
                    the same `ManualQuestion` chrome the rest of the flow uses,
                    so the transition from the upload screen into the questions
                    is a change of question, not a change of interface. Every
                    one accepts a typed answer too (see `handleSend`), so the
                    chips suggest without constraining. */}

                {stage === "bgStudy" ? (
                  <ManualQuestion
                    chipsLabel="Popular fields"
                    chips={studyChips}
                    selectedLabel={manualStudy}
                    onPick={chooseStudy}
                    trailing={
                      <span className="inline-flex h-9 items-center rounded-full border border-dashed border-chip-border px-4 text-[16px] font-medium leading-[1.3] text-text-secondary">
                        Type any field below ↓
                      </span>
                    }
                  />
                ) : null}

                {stage === "bgExp" ? (
                  <ManualQuestion
                    chipsLabel="Select one"
                    chips={STATUS_OPTIONS.map((o) => o.label)}
                    selectedLabel={
                      STATUS_OPTIONS.find((o) => o.id === manualExp)?.label ?? ""
                    }
                    onPick={(label) => {
                      const opt = STATUS_OPTIONS.find((o) => o.label === label);
                      if (opt) chooseExperience(opt.id);
                    }}
                  />
                ) : null}

                {stage === "bgInterests" ? (
                  <ManualQuestion
                    chipsLabel="Pick any, or type your own"
                    chips={INTEREST_OPTIONS}
                    selectedLabel={manualInterests}
                    onPick={chooseInterests}
                    trailing={
                      <span className="inline-flex h-9 items-center rounded-full border border-dashed border-chip-border px-4 text-[16px] font-medium leading-[1.3] text-text-secondary">
                        Type anything below ↓
                      </span>
                    }
                  />
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
                  /* Forty roles across four seniority bands. Shown flat they
                     would be a wall; the band row above narrows it to ten at a
                     time, which is a list you read rather than search. The
                     bands are a FILTER, not an answer — nothing is recorded by
                     switching one, so there is no wrong turn to undo. */
                  <div className="mt-8 flex w-full flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <div className="text-body-sm font-semibold text-text-secondary">
                        Suggested roles
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ROLE_BANDS.map((band) => (
                          <SelectionChip
                            key={band.id}
                            selected={band.id === roleBand}
                            onClick={() => setRoleBand(band.id)}
                          >
                            {band.label}
                          </SelectionChip>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {targetRoleChips.map((label) => (
                        <SelectionChip
                          key={label}
                          selected={
                            label.toLowerCase() ===
                            draft.targetRole.trim().toLowerCase()
                          }
                          onClick={() => {
                            setDraft((d) => ({ ...d, targetRole: label }));
                            setStage("targetIndustry");
                          }}
                        >
                          {label}
                        </SelectionChip>
                      ))}
                      <span className="inline-flex h-9 items-center rounded-full border border-dashed border-chip-border px-4 text-[16px] font-medium leading-[1.3] text-text-secondary">
                        Enter your own role below ↓
                      </span>
                    </div>
                  </div>
                ) : null}

                {stage === "targetJd" ? (
                  <div className="mt-6 flex w-full flex-col gap-6">
                    {!isGeneratingJd && !generatedJdDraft ? (
                      /* Same shape as step 1's "No resume?" — a short label
                         above, the escape hatch as a chip below. Both screens
                         ask for one big input and both offer a way past it, so
                         the offer should look the same in both places; it used
                         to be a prose link here and a chip there, which made
                         two identical decisions read as two different kinds of
                         thing. */
                      <div className="mt-2 flex flex-col gap-2">
                        <span className="text-body-sm font-semibold text-text-secondary">
                          Don&apos;t have the posting?
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {draft.jobDescription.trim() ? (
                            <SelectionChip onClick={() => goToPlan(draft)}>
                              Keep the posting on file
                              <ArrowRight className="size-4" aria-hidden />
                            </SelectionChip>
                          ) : null}
                          <SelectionChip onClick={handleGenerateJd}>
                            Draft one from your background
                            <ArrowRight className="size-4" aria-hidden />
                          </SelectionChip>
                        </div>
                      </div>
                    ) : null}

                    {isGeneratingJd ? (
                      <AiProgressStatus
                        className="mt-6 max-w-[30rem]"
                        ariaLabel="Drafting your job posting"
                        subtitle={
                          draft.targetRole.trim()
                            ? `Writing a ${draft.targetRole.trim()} posting from your answers.`
                            : "Writing a posting from your answers."
                        }
                        steps={JD_DRAFT_PHASES}
                        activeIndex={jdPhase}
                        caption="A starting point, not the final word — you can edit it, redraft it, or paste the real posting instead."
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

                {stage === "plan" && planPhase !== null ? (
                  <AiProgressStatus
                    className="mt-6 max-w-[30rem]"
                    ariaLabel="Choosing your focus areas"
                    subtitle="Reading what this role is assessed on, one Success Driver at a time."
                    steps={[
                      draft.jobDescription.trim()
                        ? "Reading the job posting"
                        : "Reading your role and background",
                      ...PLAN_PHASE_TAIL,
                    ]}
                    activeIndex={planPhase}
                    caption="Nothing is locked in — you can swap any of the four before you confirm."
                  />
                ) : null}

                {stage === "plan" && planPhase === null ? (
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

          {/* The welcome moment is a single CTA — no input to type into. */}
          <div
            className={cn(
              "fixed bottom-0 left-0 right-0 z-40 w-full",
              stage === "welcome" && "hidden",
            )}
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
                engaged={orbEngaged}
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
                    className="relative w-64 rounded-xl border border-border bg-card p-3 pr-8 shadow-[var(--elevation-card)]"
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
              <ChatComposer
                key={stage}
                placeholder={composerPlaceholder}
                onSend={handleSend}
                disabled={composerDisabled}
                uploadAccept={RESUME_ACCEPT}
                onUpload={handleUpload}
                showUploadButton={showUpload}
                uploadLabel={composerGuidesUpload ? "Upload resume" : undefined}
                // One ambient AI signal per screen. The CSS rim glow is the
                // resting state on every other step; where the orb is mounted the
                // orb's own shader draws that same traveling light and morphs it
                // into the sphere, so this one stands down rather than competing.
                aiGlow={!showOrb}
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
            </div>
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
  return (
    <div className="mt-8 flex w-full flex-col gap-5">
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

      {/* No title: the step's own heading already says "Reading your resume". */}
      <AiProgressStatus
        ariaLabel="Reading your resume"
        steps={PARSE_PHASES}
        activeIndex={phase}
        caption="Usually under 20 seconds. You'll confirm everything before it is saved."
      />
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
          <Badge key={skill}>{skill}</Badge>
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
          className="inline-flex h-11 items-center rounded-md border border-input bg-card px-6 text-body-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
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
  { icon: PauseCircle, text: "Save and resume anytime — nothing is lost." },
  { icon: Mic, text: "Use voice or text, whichever you prefer." },
  {
    icon: FileText,
    text: "Anything we build from your experience stays grounded in what actually happened.",
  },
];

/**
 * The three modules as one timeline, in the order the product recommends
 * them (see `pickRecommendedNextStep`): learn the standard, build the
 * evidence, then perform. The rail carries the sequence, so the rows need
 * no "Step 1/2/3" labels — and every node is entered directly, because the
 * user is free to start anywhere.
 */
function journeySteps(targetRole: string, focusTitles: string[]) {
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
      icon: GraduationCap,
      title: "Learn the Craft through our Master Classes",
      badge: "Start here",
      meta:
        "Learn the interviewing essentials and the employer's perspective on what they listen for, what strong evidence looks like, and how the four Success Drivers shape that judgement.",
      cta: "Start learning",
    },
    {
      href: "/storyboard",
      icon: BookOpen,
      title: "Build your MyStoryBoard",
      badge: null,
      meta: `Turn your real experiences into structured, interview ready examples around the Core Four competencies prioritised for your role.${
        focus !== "Your focus areas" ? ` Starting with ${focus}.` : ""
      }`,
      cta: "Build MyStoryBoard",
    },
    {
      href: "/interview",
      icon: UserCheck,
      title: "Take a Mock Studios session",
      badge: null,
      meta: `Put your preparation into practice under realistic interview conditions and see how clearly your evidence comes through.${
        role ? ` Pitched at your ${role} target.` : ""
      }`,
      cta: "Start Mock Studios",
    },
  ];
}

/** One node on the path. The whole row is the link, so any step can be
 * entered directly; the labelled arrow on the right says so out loud, and
 * the rail's connector is drawn on the row so it stretches with the copy. */
function JourneyNode({
  step,
  isLast,
}: {
  step: ReturnType<typeof journeySteps>[number];
  isLast: boolean;
}) {
  const Icon = step.icon;
  return (
    <li className="relative">
      {!isLast ? (
        <span
          aria-hidden
          // Runs a touch past the row so the breathing room above and below
          // the line matches (the next row's own top padding sits in between).
          className="absolute left-5 top-[58px] -bottom-[10px] w-px bg-border"
        />
      ) : null}
      <Link
        href={step.href}
        className={cn(
          "group grid grid-cols-[auto_1fr_auto] items-center gap-x-4 rounded-lg px-2 -mx-2 transition-colors",
          "hover:bg-brand-1000/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
          isLast ? "py-3.5" : "pt-3.5 pb-9",
        )}
      >
        {/* Every node looks the same: the path is a sequence, not a ranking,
            and the user may start at any of them. */}
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center self-start rounded-full transition-colors",
            "border border-dashed border-brand-400/70 bg-card text-primary",
            "group-hover:border-primary group-hover:bg-brand-1000",
          )}
          aria-hidden
        >
          <Icon className="size-4" />
        </span>

        <span className="flex min-w-0 flex-col gap-1">
          {/* Title and its badge share a line: "Start here" qualifies the step,
              so it belongs beside the name rather than floating above it. */}
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-body-sm font-semibold leading-snug text-text-primary transition-colors group-hover:text-extended-blue">
              {step.title}
            </span>
            {step.badge ? <Badge>{step.badge}</Badge> : null}
          </span>
          <span className="text-caption leading-snug text-text-secondary">
            {step.meta}
          </span>
        </span>

        {/* Says the row is a door, without waiting for a hover to say it. */}
        <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap text-caption font-medium text-extended-dark-cyan/70 transition-colors group-hover:text-extended-dark-cyan">
          {step.cta}
          <ArrowUpRight
            aria-hidden
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none"
          />
        </span>
      </Link>
    </li>
  );
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
  const steps = journeySteps(targetRole, focusTitles);
  return (
    <>
      <div
        className={cn(
          "mt-6 w-full rounded-xl border-[0.5px] border-solid border-border px-4 pb-3 pt-4",
          "bg-[linear-gradient(121.89deg,var(--glass-from)_0%,var(--glass-to)_98.96%)]",
        )}
      >
        {/* Header echoes the timeline language: what this is on the left, and
            the one thing worth knowing about it on the right — the path is a
            recommendation, not a lock. */}
        <div className="flex items-center gap-3">
          {/* "Suggested for you", not "Suggested by AI coach" — same call as
              the focus-areas tag: everything on this screen is generated, so
              naming the machine labels nothing, and the product does not
              introduce an "AI coach" persona anywhere else. */}
          <span className="flex shrink-0 items-center gap-1.5 text-overline font-medium uppercase tracking-wide text-text-secondary">
            <Sparkles className="size-3 text-primary" aria-hidden />
            Your preparation plan
          </span>
          <span aria-hidden className="h-px flex-1 border-t border-dashed border-border" />
          <Badge>Start anywhere</Badge>
        </div>

        <ol className="mt-1 flex w-full flex-col">
          {steps.map((step, i) => (
            <JourneyNode
              key={step.href}
              step={step}
              isLast={i === steps.length - 1}
            />
          ))}
        </ol>
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
        Want to look around first?{" "}
        <Link
          href={homeHref}
          className="app-link inline-flex items-center gap-1 font-medium"
        >
          Go to home
          <ArrowRight className="size-[0.7em] shrink-0 text-primary" aria-hidden />
        </Link>
      </p>
    </>
  );
}

