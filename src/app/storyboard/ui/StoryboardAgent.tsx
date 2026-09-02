"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  Plus,
  X,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { AgentPrompt } from "@/components/agents/AgentPrompt";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { COACH_HUB_CONTENT_TOP_CLASS } from "@/components/coachNavLayout";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import {
  SuccessDriverCompetencyPill,
  SuccessDriverInfoTip,
  SuccessDriverMark,
} from "@/components/ui/success-driver-card";
import { buildEmptyCraftingDive } from "@/app/storyboard/crafting/mockCraftingDraft";
import {
  buildSoftwareEngineerDive4,
  buildSoftwareEngineerDive4Experiences,
  SOFTWARE_ENGINEER_DIVE4_ID,
  SOFTWARE_ENGINEER_DIVE4_ROLE,
  softwareEngineerDive4RoleProfile,
} from "@/app/storyboard/crafting/softwareEngineerDive4Fixture";
import { GenericUpgradeModal } from "@/components/GenericUpgradeModal";
import { CoreFourSelectionPanel } from "@/app/onboarding/ui/CoreFourSelectionPanel";
import { computeCandidateUsage, isFreePlan } from "@/lib/candidateUsage";
import {
  CAR_FIELD_GUIDANCE,
  COMPETENCY_GUIDANCE,
  CONSULTANT_INTRO,
  DEMO_CONSULTANT_QUESTION_COUNT,
  competencySpec,
  completedCompetencyIds,
  consultantQuestionsFor,
  demoCompetencyQueue,
  experienceForCompetency,
  isDemoExperienceComplete,
  nextOpenDemoCompetency,
  pillarForCompetency,
  seedDiveFromDemoExperiences,
} from "@/lib/demoFocusCompetencies";
import { makeId } from "@/lib/id";
import { normalizeWhitespace } from "@/lib/proofdiveLogic";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import type { Experience, InterviewReport, RoleProfile, TrainingJourneyProgress } from "@/lib/proofdiveTypes";
import { scoringBandForScore } from "@/lib/scoringPalette";
import {
  COMPETENCY_SPECS,
  MAX_DIVES_PER_ROLE,
  type CloneDiveUnlock,
  type CompetencyId,
  type StoryboardDive,
  canStartNewDive,
  cloneDiveForNext,
  editingDiveForRole,
  latestSavedDive,
  remainingDives,
  savedDivesForRole,
  upsertEditingDive,
  strengthScore,
} from "@/lib/storyboardDraft";
import { writeJson } from "@/lib/storage";
import {
  SUCCESS_DRIVER_ORDER,
  SUCCESS_DRIVERS,
} from "@/lib/successDrivers";
import { cn } from "@/lib/utils";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { usePaymentBundles } from "@/lib/usePaymentBundles";
import { useStoryboardDiveStore } from "@/lib/useStoryboardDiveStore";
import {
  useCandidateEntitlements,
  useCandidateSubscription,
} from "@/lib/useSubscriberPayments";

type CarField = "context" | "action" | "result";

type CapturePhase =
  | { kind: "greet" }
  | { kind: "title"; competencyId: CompetencyId; index: number }
  | { kind: "car"; competencyId: CompetencyId; index: number; field: CarField }
  | {
      kind: "consultant";
      competencyId: CompetencyId;
      index: number;
      qIndex: number;
      question: string;
    }
  /** One-time after all focus experiences; feeds TMAY intro, not consultant caps. */
  | { kind: "aboutYou" }
  | { kind: "closing" };

const ABOUT_YOU_PROMPT = `Tell me about yourself.

This becomes the opening of your Storyboard — the answer to “tell me about yourself”. Who you are, what you’re moving toward, and one or two things you’re proud of. Aim for 150–220 words.`;

const CAR_FIELDS: CarField[] = ["context", "action", "result"];

/** Bright scoring fills for large dive-card numerals (Figma color/scoring/*). */
function diveScoreTextClass(score: number | null | undefined): string {
  const type = "font-gilroy";
  if (score == null || !Number.isFinite(score)) return `${type} text-text-secondary`;
  const band = scoringBandForScore(score);
  if (band === "cyan") return `${type} text-scoring-cyan`;
  if (band === "green") return `${type} text-scoring-green`;
  if (band === "yellow") return `${type} text-scoring-yellow`;
  return `${type} text-scoring-red`;
}

/* Helper lines for the CAR fields (the rail's suggestion while answering).
 * No prefilled answers: the audit found the composer arrived with a fabricated
 * example already typed in as its VALUE, so one Send submitted invented
 * evidence — the opposite of the product's guardrails. Examples now live in
 * the placeholder as the SHAPE of a good answer (see CAR_FIELD_GUIDANCE). */
const CAR_PROMPTS: Record<CarField, { helper: string }> = {
  context: {
    helper: "Give just enough background for someone to understand why the situation mattered.",
  },
  action: {
    helper: "Focus on what you personally did. Avoid saying only what the team did.",
  },
  result: {
    helper:
      "Share measurable outcomes where possible. If no metric exists, describe observable change or impact.",
  },
};

function clampText(text: string, maxChars: number) {
  const t = text.trim();
  if (t.length <= maxChars) return t;
  const cut = t.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, Math.max(0, lastSpace)).trim()}…`;
}

function emphasizeSuggestionText(s: string): ReactElement {
  const words = s.split(/\s+/);
  if (words.length <= 2) return <span className="font-extrabold">{s}</span>;
  const head = words.slice(0, 2).join(" ");
  const tail = words.slice(2).join(" ");
  return (
    <span>
      <span className="font-extrabold">{head}</span> {tail}
    </span>
  );
}

/**
 * Capture sequencing: greet → per experience (title → CAR → consultant) →
 * aboutYou (once, flow-level) → closing → craft.
 */
function deriveCapturePhase(
  queue: readonly CompetencyId[],
  roleExperiences: readonly Experience[],
  aboutYouAnswer?: string | null,
): CapturePhase {
  const openId = nextOpenDemoCompetency(queue, roleExperiences);
  if (!openId) {
    if (!aboutYouAnswer?.trim()) return { kind: "aboutYou" };
    return { kind: "closing" };
  }

  const index = queue.indexOf(openId);
  const exp = experienceForCompetency(roleExperiences, openId);

  if (!exp) {
    if (roleExperiences.filter((e) => e.competencyId && queue.includes(e.competencyId)).length === 0) {
      return { kind: "greet" };
    }
    return { kind: "title", competencyId: openId, index };
  }

  if (!exp.title?.trim()) {
    return { kind: "title", competencyId: openId, index };
  }

  for (const field of CAR_FIELDS) {
    if (!exp.car?.[field]?.trim()) {
      return { kind: "car", competencyId: openId, index, field };
    }
  }

  const answers = exp.consultantAnswers ?? [];
  if (answers.length < DEMO_CONSULTANT_QUESTION_COUNT) {
    const questions = consultantQuestionsFor(openId);
    const qIndex = answers.length;
    return {
      kind: "consultant",
      competencyId: openId,
      index,
      qIndex,
      question: questions[qIndex] ?? questions[0]!,
    };
  }

  // Current open competency is complete; nextOpenDemoCompetency should have
  // advanced — fall through defensively to aboutYou / closing.
  if (!aboutYouAnswer?.trim()) return { kind: "aboutYou" };
  return { kind: "closing" };
}

export function StoryboardAgent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roleProfile, setRoleProfile] = useLocalStorageState<RoleProfile | null>(
    StorageKeys.roleProfile,
    null,
  );
  const [experiences, setExperiences] = useLocalStorageState<Experience[]>(
    StorageKeys.experiences,
    [],
  );
  const [diveStore, setDiveStore, diveHydrated] = useStoryboardDiveStore();
  const [subscription] = useCandidateSubscription();
  const [entitlements] = useCandidateEntitlements();
  const { bundles } = usePaymentBundles();
  const [reports] = useLocalStorageState<Record<string, InterviewReport>>(StorageKeys.reports, {});
  const [trainingProgress] = useLocalStorageState<Record<string, TrainingJourneyProgress>>(
    StorageKeys.trainingProgress,
    {},
  );
  const [storyboardGenerationCount] = useLocalStorageState<number>(
    StorageKeys.candidateStoryboardGenerations,
    0,
  );
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [nearLimitBannerDismissedFor, setNearLimitBannerDismissedFor] =
    useLocalStorageState<number | null>(
      StorageKeys.candidateStoryboardNearLimitBannerDismissed,
      null,
    );

  const activeBundle =
    subscription.bundleId != null
      ? bundles.find((b) => b.id === subscription.bundleId) ?? null
      : null;

  const usage = useMemo(
    () =>
      computeCandidateUsage({
        subscription,
        entitlements,
        activeBundle,
        reports,
        diveStore,
        trainingProgress,
        storyboardGenerationCount,
      }),
    [
      subscription,
      entitlements,
      activeBundle,
      reports,
      diveStore,
      trainingProgress,
      storyboardGenerationCount,
    ],
  );

  const freePlan = isFreePlan(subscription);
  const showNearLimitBanner =
    usage.isNearStoryboardLimit &&
    (freePlan || nearLimitBannerDismissedFor !== usage.storyboardLimit);

  const role = roleProfile?.targetRole?.trim() ?? "";
  const firstName = useMemo(
    () => roleProfile?.name?.trim().split(/\s+/)[0] || "there",
    [roleProfile?.name],
  );

  const focusQueue = useMemo(() => demoCompetencyQueue(roleProfile), [roleProfile]);

  const allRoleExperiences = useMemo(
    () => experiences.filter((e) => e.role === role && Boolean(e.competencyId)),
    [experiences, role],
  );

  const roleExperiences = useMemo(
    () =>
      allRoleExperiences.filter(
        (e) => e.competencyId && focusQueue.includes(e.competencyId),
      ),
    [allRoleExperiences, focusQueue],
  );

  const lockedCompetencyIds = useMemo(
    () => completedCompetencyIds(allRoleExperiences),
    [allRoleExperiences],
  );
  /** Onboarding confirmed four focus areas; the first Dive captures two. The
   * other two come pre-ticked here so the user is not shown their own choices
   * as if they had never made them. */
  const initialAddSelection = useMemo(() => {
    const chosen = (roleProfile?.coreFourCompetencies ?? []).filter((id) =>
      COMPETENCY_SPECS.some((s) => s.id === id),
    );
    return Array.from(new Set([...lockedCompetencyIds, ...chosen]));
  }, [lockedCompetencyIds, roleProfile?.coreFourCompetencies]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [craftUi, setCraftUi] = useState<"idle" | "crafting" | "ready">("idle");
  const [isDraftUpdating, setIsDraftUpdating] = useState(false);
  const [suggestionCursor, setSuggestionCursor] = useState(0);
  const [greetAcknowledged, setGreetAcknowledged] = useState(false);
  const [diveConfirmOpen, setDiveConfirmOpen] = useState(false);
  const [diveConfirmAction, setDiveConfirmAction] = useState<"edit" | "addCompetency" | null>(
    null,
  );
  const [diveUnlock, setDiveUnlock] = useState<CloneDiveUnlock>({ kind: "all" });
  const [addCompetencyOpen, setAddCompetencyOpen] = useState(false);
  const [addCompetencySelected, setAddCompetencySelected] = useState<CompetencyId[]>([]);
  const [addCompetencyError, setAddCompetencyError] = useState<string | null>(null);
  const [pendingFocusIds, setPendingFocusIds] = useState<CompetencyId[] | null>(null);
  /** True while capturing more competencies for a new Dive (skip post-craft home). */
  const [intakeMode, setIntakeMode] = useState(false);

  const savedDives = useMemo(
    () => (role && diveHydrated ? savedDivesForRole(diveStore, role) : []),
    [role, diveHydrated, diveStore],
  );
  const postCraftHome = savedDives.length > 0;
  const showDiveHome = postCraftHome && !addCompetencyOpen && !intakeMode;
  const maxDives =
    usage.storyboardLimit > 0 ? usage.storyboardLimit : MAX_DIVES_PER_ROLE;
  const divesLeft =
    role && diveHydrated ? remainingDives(diveStore, role, maxDives) : maxDives;
  const latestDive = savedDives[0] ?? null;

  useEffect(() => {
    try {
      setIntakeMode(sessionStorage.getItem(StorageKeys.preferStoryboardIntake) === "1");
    } catch {
      setIntakeMode(false);
    }
  }, [searchParams]);

  // Seed Software Engineer Dive 4 data from the PDF fixture whenever the role
  // is Software Engineer and no experiences have been captured yet.
  useEffect(() => {
    if (!diveHydrated) return;
    const currentRole = roleProfile?.targetRole?.trim() ?? "";
    if (currentRole !== SOFTWARE_ENGINEER_DIVE4_ROLE) return;

    setExperiences((prev) => {
      const hasSeeded = prev.some((e) => e.id.startsWith("exp-se-dive4-"));
      if (hasSeeded) return prev;
      const seededExps = buildSoftwareEngineerDive4Experiences();
      const others = prev.filter((e) => e.role !== SOFTWARE_ENGINEER_DIVE4_ROLE);
      return [...others, ...seededExps];
    });

    setDiveStore((prev) => {
      const bank = prev.byRole[SOFTWARE_ENGINEER_DIVE4_ROLE];
      const existing = bank?.dives.find((d) => d.id === SOFTWARE_ENGINEER_DIVE4_ID);
      if (existing?.intro.text.trim()) return prev;
      const fixture = buildSoftwareEngineerDive4();
      const otherDives = (bank?.dives ?? []).filter((d) => d.id !== SOFTWARE_ENGINEER_DIVE4_ID);
      return {
        ...prev,
        byRole: {
          ...prev.byRole,
          [SOFTWARE_ENGINEER_DIVE4_ROLE]: { dives: [...otherDives, fixture] },
        },
      };
    });

    setRoleProfile((prev) =>
      prev ? softwareEngineerDive4RoleProfile(prev) : prev,
    );
  }, [diveHydrated, roleProfile?.targetRole, setExperiences, setDiveStore, setRoleProfile]);

  useEffect(() => {
    const wantNew = (searchParams.get("new") ?? "").trim();
    if (wantNew !== "1" && wantNew.toLowerCase() !== "true") return;
    if (!diveHydrated) return;
    setSelectedId(null);
    setStatusLine(null);
    setCraftUi("idle");
    setGreetAcknowledged(false);
    // Home's "Add competency" used to re-enter intake with nothing left to
    // capture and land on the hub — a dead end. If every focus competency is
    // already done and a Dive exists, "add" means the add-competency panel.
    const allCaptured = nextOpenDemoCompetency(focusQueue, roleExperiences) === null;
    if (allCaptured && savedDives.length > 0 && divesLeft > 0) {
      setAddCompetencySelected(initialAddSelection);
      setAddCompetencyError(null);
      setAddCompetencyOpen(true);
    } else {
      setAddCompetencyOpen(false);
      setIntakeMode(true);
    }
    router.replace("/storyboard");
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per ?new=1 arrival
  }, [searchParams, router, diveHydrated]);

  useEffect(() => {
    const wantAdd = (searchParams.get("addCompetency") ?? "").trim();
    if (wantAdd !== "1" && wantAdd.toLowerCase() !== "true") return;
    if (!role || !diveHydrated) return;
    if (divesLeft <= 0 || !canStartNewDive(diveStore, role, maxDives)) {
      router.replace("/storyboard");
      return;
    }
    setAddCompetencySelected(initialAddSelection);
    setAddCompetencyError(null);
    setAddCompetencyOpen(true);
    router.replace("/storyboard");
  }, [
    initialAddSelection,
    searchParams,
    router,
    role,
    diveHydrated,
    diveStore,
    divesLeft,
    maxDives,
    lockedCompetencyIds,
  ]);

  /** A read-only Dive's "Edit in a new Dive" lands here with the section to unlock. */
  useEffect(() => {
    const raw = (searchParams.get("editSection") ?? "").trim();
    if (!raw) return;
    if (!role || !diveHydrated || !latestDive) return;
    const unlock: CloneDiveUnlock =
      raw === "intro"
        ? { kind: "intro" }
        : { kind: "competency", index: Math.max(0, Math.min(11, Number(raw) || 0)) };
    router.replace("/storyboard");
    if (divesLeft <= 0 || usage.isStoryboardAtLimit) {
      setUpgradeModalOpen(true);
      return;
    }
    setDiveConfirmAction("edit");
    setDiveUnlock(unlock);
    setPendingFocusIds(null);
    setDiveConfirmOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per ?editSection arrival
  }, [searchParams, role, diveHydrated, latestDive]);

  /** Resume an unfinished editing Dive after leave / browser close. */
  useEffect(() => {
    const wantNew = (searchParams.get("new") ?? "").trim();
    if (wantNew === "1" || wantNew.toLowerCase() === "true") return;
    const wantAdd = (searchParams.get("addCompetency") ?? "").trim();
    if (wantAdd === "1" || wantAdd.toLowerCase() === "true") return;
    if (!role || !diveHydrated) return;
    if (addCompetencyOpen) return;
    if (intakeMode) return;
    if (postCraftHome && !editingDiveForRole(diveStore, role)) return;
    try {
      if (sessionStorage.getItem(StorageKeys.preferStoryboardIntake) === "1") return;
    } catch {
      // ignore
    }
    const editing = editingDiveForRole(diveStore, role);
    if (editing) {
      router.replace("/storyboard/crafting");
    }
  }, [
    role,
    diveHydrated,
    diveStore,
    postCraftHome,
    searchParams,
    router,
    addCompetencyOpen,
    intakeMode,
  ]);

  function beginNewDiveFromLatest(
    action: "edit" | "addCompetency",
    unlock: CloneDiveUnlock = { kind: "all" },
    focusIds?: CompetencyId[],
  ) {
    if (!role || !latestDive) return;
    if (!canStartNewDive(diveStore, role, maxDives)) return;
    if (usage.isStoryboardAtLimit) {
      setDiveConfirmOpen(false);
      setUpgradeModalOpen(true);
      return;
    }
    const nextNum = latestDive.diveNumber + 1;
    if (nextNum > maxDives) return;
    const queue = focusIds?.length ? focusIds : focusQueue;
    const cloned = cloneDiveForNext(latestDive, nextNum, unlock);
    const seeded = seedDiveFromDemoExperiences(
      cloned,
      allRoleExperiences,
      queue,
      roleProfile?.aboutYouAnswer,
    );
    const nextStore = upsertEditingDive(diveStore, seeded);
    setDiveStore(nextStore);
    writeJson(StorageKeys.storyboardDives, nextStore);
    setDiveConfirmOpen(false);
    setDiveConfirmAction(null);
    setDiveUnlock({ kind: "all" });
    setPendingFocusIds(null);
    setAddCompetencyOpen(false);
    if (action === "addCompetency") {
      setSelectedId(null);
      setStatusLine(null);
      setCraftUi("idle");
      setGreetAcknowledged(false);
      try {
        sessionStorage.setItem(StorageKeys.preferStoryboardIntake, "1");
      } catch {
        // ignore
      }
      setIntakeMode(true);
      // The Introduction answer carries forward: re-asking "tell me about
      // yourself" on every Dive, and discarding the last answer, was pure
      // repetition. The user can still edit it on the review screen.
      setRoleProfile((prev) =>
        prev ? { ...prev, storyboardFocusCompetencies: queue } : prev,
      );
      router.push("/storyboard?new=1");
    } else {
      router.push("/storyboard/crafting");
    }
  }

  function requestNewDive(
    action: "edit" | "addCompetency",
    unlock: CloneDiveUnlock = { kind: "all" },
    focusIds?: CompetencyId[],
  ) {
    if (!role || !latestDive) return;
    if (divesLeft <= 0) return;
    if (usage.isStoryboardAtLimit) {
      setUpgradeModalOpen(true);
      return;
    }
    setDiveConfirmAction(action);
    setDiveUnlock(unlock);
    setPendingFocusIds(focusIds ?? null);
    setDiveConfirmOpen(true);
  }

  function toggleAddCompetency(id: CompetencyId) {
    if (lockedCompetencyIds.includes(id)) return;
    setAddCompetencyError(null);
    setAddCompetencySelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function confirmAddCompetencySelection() {
    const locked = new Set(lockedCompetencyIds);
    const newlySelected = addCompetencySelected.filter((id) => !locked.has(id));
    if (!newlySelected.length) {
      setAddCompetencyError("Select at least one new competency to add.");
      return;
    }
    const nextFocus = [
      ...lockedCompetencyIds,
      ...newlySelected.filter((id) => !lockedCompetencyIds.includes(id)),
    ];
    requestNewDive("addCompetency", { kind: "all" }, nextFocus);
  }

  /* During capture the rail's Success Drivers used to read "—" until Craft,
   * even though the spec calls for a live draft. Now each pillar reflects the
   * Strength of what has been captured so far; on the hub the saved Dive's
   * numbers stand. */
  const pillarScores = useMemo(() => {
    const capturing = intakeMode || savedDives.length === 0;
    return SUCCESS_DRIVER_ORDER.map((id) => {
      if (!capturing) return { id, score: latestDive?.pillarScores?.[id] ?? 0 };
      const scores = roleExperiences
        .filter((e) => e.competencyId && pillarForCompetency(e.competencyId) === id && e.car)
        .map((e) => Number(strengthScore(e.car!)))
        .filter((n) => n > 0);
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return { id, score: Math.round(avg * 10) / 10 };
    });
  }, [latestDive, intakeMode, savedDives.length, roleExperiences]);

  const phase = useMemo(() => {
    const base = deriveCapturePhase(
      focusQueue,
      roleExperiences,
      roleProfile?.aboutYouAnswer,
    );
    if (base.kind === "greet" && greetAcknowledged) {
      return {
        kind: "title" as const,
        competencyId: focusQueue[0]!,
        index: 0,
      };
    }
    return base;
  }, [focusQueue, roleExperiences, greetAcknowledged, roleProfile?.aboutYouAnswer]);

  const activeCompetencyId = useMemo(() => {
    if (phase.kind === "greet" || phase.kind === "aboutYou" || phase.kind === "closing") {
      return selectedId
        ? roleExperiences.find((e) => e.id === selectedId)?.competencyId ?? null
        : roleExperiences[roleExperiences.length - 1]?.competencyId ?? focusQueue[0] ?? null;
    }
    return phase.competencyId;
  }, [phase, selectedId, roleExperiences, focusQueue]);

  const selected = useMemo(() => {
    // While a new competency is being titled there is no experience for it
    // yet; showing the previous one here is what left the rail saying
    // "Anchored to Analytical Thinking" on Competency 2.
    if (phase.kind === "title") {
      return experienceForCompetency(roleExperiences, phase.competencyId) ?? null;
    }
    if (selectedId) {
      return roleExperiences.find((e) => e.id === selectedId) ?? null;
    }
    if (activeCompetencyId) {
      return experienceForCompetency(roleExperiences, activeCompetencyId) ?? null;
    }
    return null;
  }, [phase, selectedId, roleExperiences, activeCompetencyId]);

  const storyPrompt = useMemo(() => {
    if (phase.kind === "greet") {
      return `Hey ${firstName}, let's build interview-ready proof from real experience.`;
    }
    // Heading = the question, in the agent's voice. Competency and progress
    // already live in the pill and the rail, so the heading no longer repeats
    // them. Subtext = why we ask, tied to this competency, plus what a strong
    // answer contains — the same signals the Strength score is judged on.
    if (phase.kind === "title") {
      const spec = competencySpec(phase.competencyId);
      const guide = COMPETENCY_GUIDANCE[phase.competencyId];
      return `Which experience best shows your ${spec.title}?

${guide.why} Give it a short name so we can refer to it — you'll tell the story next.`;
    }
    if (phase.kind === "car") {
      const field = CAR_FIELD_GUIDANCE[phase.field];
      const guide = COMPETENCY_GUIDANCE[phase.competencyId];
      const cue = phase.field === "action" ? ` ${guide.good}` : "";
      return `${field.question}

${field.why}${cue}`;
    }
    if (phase.kind === "consultant") {
      const guide = COMPETENCY_GUIDANCE[phase.competencyId];
      const intro = phase.qIndex === 0 ? `${CONSULTANT_INTRO} ` : "";
      return `${phase.question}

${intro}Follow-up ${phase.qIndex + 1} of ${DEMO_CONSULTANT_QUESTION_COUNT} · ${guide.good}`;
    }
    if (phase.kind === "aboutYou") {
      return ABOUT_YOU_PROMPT;
    }
    return `This is coming together really well.`;
  }, [phase, firstName]);

  const storyPromptKey = `${phase.kind}-${activeCompetencyId ?? "none"}-${
    phase.kind === "car"
      ? phase.field
      : phase.kind === "consultant"
        ? phase.qIndex
        : phase.kind === "title"
          ? phase.index
          : phase.kind === "aboutYou"
            ? "personal"
            : "x"
  }`;

  const replyPrefillKey = storyPromptKey;

  const composerPlaceholder = useMemo(() => {
    if (phase.kind === "closing") return "Craft your story above when ready…";
    if (phase.kind === "greet") return "Say hi to begin, or press Let’s Start above";
    if (phase.kind === "title") return "A short name for this experience, e.g. “Q3 launch turnaround”";
    if (phase.kind === "car") return `${CAR_FIELD_GUIDANCE[phase.field].shape} Type or use voice.`;
    if (phase.kind === "aboutYou") return "Who you are, where you’re headed, one thing you’re proud of…";
    return "Be specific — the situation, your reasoning, the trade-off. Type or use voice.";
  }, [phase]);

  function upsertExperience(next: Experience) {
    setExperiences((prev) => {
      const idx = prev.findIndex((e) => e.id === next.id);
      if (idx === -1) return [next, ...prev];
      const copy = prev.slice();
      copy[idx] = next;
      return copy;
    });
  }

  function startCrafting() {
    if (craftUi === "crafting" || !role) return;
    if (usage.isStoryboardAtLimit) {
      setUpgradeModalOpen(true);
      return;
    }
    setCraftUi("crafting");
    setStatusLine("It will take a moment. I'm crafting your story…");
    try {
      sessionStorage.removeItem(StorageKeys.preferStoryboardIntake);
    } catch {
      // ignore
    }
    setIntakeMode(false);

    if (!roleProfile?.storyboardFocusCompetencies?.length) {
      setRoleProfile((prev) =>
        prev ? { ...prev, storyboardFocusCompetencies: focusQueue } : prev,
      );
    }

    const existingEditing = editingDiveForRole(diveStore, role);
    const diveNumber =
      existingEditing?.diveNumber ?? (latestSavedDive(diveStore, role)?.diveNumber ?? 0) + 1;
    const safeNumber = Math.min(maxDives, Math.max(1, diveNumber));

    const base =
      existingEditing ??
      buildEmptyCraftingDive(role, safeNumber);
    const seeded = seedDiveFromDemoExperiences(
      base,
      roleExperiences,
      focusQueue,
      roleProfile?.aboutYouAnswer,
    );
    // Craft opens the storyboard for REVIEW. Saving — and spending one of the
    // three Dives — is the user's explicit act on that screen. Previously this
    // committed the Dive as read-only before the user had seen a word of it.
    const nextStore = upsertEditingDive(diveStore, seeded);
    writeJson(StorageKeys.storyboardDives, nextStore);
    setDiveStore(nextStore);
    // A short, honest beat: something is being made. Long enough to register,
    // short enough not to feel like a spinner.
    window.setTimeout(() => {
      setCraftUi("idle");
      setStatusLine(null);
      router.push("/storyboard/crafting");
    }, 1400);
  }

  function handleText(text: string) {
    setStatusLine(null);
    setIsDraftUpdating(true);
    setSuggestionCursor((v) => v + 1);
    window.setTimeout(() => setIsDraftUpdating(false), 450);

    const cleaned = normalizeWhitespace(text);
    if (cleaned.length < 2) {
      setStatusLine("Add a little more detail so we can use this as evidence.");
      return;
    }

    if (phase.kind === "closing") return;

    if (phase.kind === "greet") {
      setGreetAcknowledged(true);
      return;
    }

    if (phase.kind === "aboutYou") {
      setRoleProfile((prev) => (prev ? { ...prev, aboutYouAnswer: cleaned } : prev));
      return;
    }

    if (phase.kind === "title") {
      const title = cleaned.slice(0, 80);
      if (title.length < 2) {
        setStatusLine("Try a short label for this experience.");
        return;
      }
      const existing = experienceForCompetency(roleExperiences, phase.competencyId);
      if (existing) {
        upsertExperience({ ...existing, title, raw: existing.raw || title });
        setSelectedId(existing.id);
      } else {
        const exp: Experience = {
          id: makeId(),
          role,
          title,
          raw: title,
          createdAt: new Date().toISOString(),
          competencyId: phase.competencyId,
          car: { context: "", action: "", result: "" },
          consultantAnswers: [],
        };
        upsertExperience(exp);
        setSelectedId(exp.id);
      }
      return;
    }

    const current =
      experienceForCompetency(roleExperiences, phase.competencyId) ?? selected;
    if (!current) {
      setStatusLine("Start with an experience title first.");
      return;
    }

    if (phase.kind === "car") {
      const nextCar = {
        context: current.car?.context ?? "",
        action: current.car?.action ?? "",
        result: current.car?.result ?? "",
        [phase.field]: cleaned,
      };
      const rawParts = [nextCar.context, nextCar.action, nextCar.result].filter(Boolean);
      upsertExperience({
        ...current,
        car: nextCar,
        raw: rawParts.join("\n\n") || current.raw,
      });
      return;
    }

    if (phase.kind === "consultant") {
      const prevAnswers = current.consultantAnswers ?? [];
      const nextAnswers = [
        ...prevAnswers,
        {
          id: makeId(),
          question: phase.question,
          answer: cleaned,
        },
      ];
      upsertExperience({
        ...current,
        consultantAnswers: nextAnswers,
        raw: [current.raw, cleaned].filter(Boolean).join("\n\n"),
      });
    }
  }

  type StoryQuick = { title: string; body: string; suggestions: Array<string | ReactElement> };

  const storyQuick = useMemo<StoryQuick>(() => {
    if (phase.kind === "aboutYou") {
      return {
        title: "Your introduction",
        body: "This becomes the opening of your Storyboard — the first thing an interviewer hears. It isn't scored against a single competency.",
        suggestions: ["Aim for 150–220 words. Who you are, where you’re headed, one thing you’re proud of."],
      };
    }

    if (!selected) {
      const chosen = roleProfile?.coreFourCompetencies?.length ?? 0;
      const scopeNote =
        chosen > focusQueue.length
          ? ` This Dive starts with ${focusQueue.length} of your ${chosen} focus areas; the rest can come in your next Dive.`
          : "";
      if (phase.kind === "title") {
        const spec = competencySpec(phase.competencyId);
        return {
          title: `Competency ${phase.index + 1} of ${focusQueue.length}`,
          body: `${spec.title}. Name the experience first, then we'll take the situation, what you did, and what changed.`,
          suggestions: [COMPETENCY_GUIDANCE[phase.competencyId].good],
        };
      }
      return {
        title: "Ready when you are",
        body: `One experience for each of ${focusQueue.length} competencies, then we craft your storyboard.${scopeNote}`,
        suggestions: ["Real experiences only — we never invent details, and neither should you."],
      };
    }

    const car = selected.car;
    const notes = (selected.consultantAnswers ?? []).map((a) => a.answer).filter(Boolean);
    const bodyParts = [
      car?.context ? `Context: ${clampText(car.context, 160)}` : "",
      car?.action ? `Action: ${clampText(car.action, 200)}` : "",
      car?.result ? `Result: ${clampText(car.result, 140)}` : "",
      // Follow-up answers land here the moment they are sent — the user can
      // see the consultant's questions doing something.
      ...notes.map((n) => `Follow-up: ${clampText(n, 140)}`),
    ].filter(Boolean);

    const suggestions: string[] = [];
    if (phase.kind === "car") {
      suggestions.push(CAR_PROMPTS[phase.field].helper);
    } else if (phase.kind === "consultant") {
      suggestions.push(
        `Follow-up ${phase.qIndex + 1} of ${DEMO_CONSULTANT_QUESTION_COUNT}. Specifics beat summary — your answer is quoted back as evidence.`,
      );
    } else if (isDemoExperienceComplete(selected)) {
      suggestions.push("Add one crisp metric if you can (before → after).");
    } else {
      suggestions.push("Keep going — finish Context, Action, and Result for this competency.");
    }

    const spec = selected.competencyId ? competencySpec(selected.competencyId) : null;

    return {
      title: selected.title || "Untitled experience",
      body:
        bodyParts.join("\n\n") ||
        "Next: the situation — what was going on, and what was at stake.",
      suggestions: spec ? [`Anchored to ${spec.title}`, ...suggestions] : suggestions,
    };
  }, [selected, phase, focusQueue.length, roleProfile?.coreFourCompetencies?.length]);

  const activeSuggestion = useMemo(() => {
    const list = storyQuick.suggestions;
    if (!list.length) return null;
    return list[suggestionCursor % list.length] ?? null;
  }, [storyQuick.suggestions, suggestionCursor]);

  if (!role) {
    return (
      <AppShell contentTopClassName={COACH_HUB_CONTENT_TOP_CLASS}>
        <CoachFloatingNav />
        <div className="pb-44">
          <Card className="gap-0 py-0">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-h4 text-text-primary">First, set a target role.</h2>
              <p className="text-caption leading-6 text-text-secondary">
                Story banks are saved per role. Complete onboarding (including Core Four
                competencies) so we know which experiences to capture.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href="/onboarding">Go to onboarding</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/coach?journey=1">Back to Coach</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <CoachBottomChatBar showUploadButton={false} />
      </AppShell>
    );
  }

  const storyboardRightPanel = (
    <div className="space-y-3">
      <div className="text-overline text-text-primary">Competencies</div>

      <div className="space-y-2">
        {focusQueue.map((compId, idx) => {
          const exp = experienceForCompetency(roleExperiences, compId);
          const spec = competencySpec(compId);
          const driver = pillarForCompetency(compId);
          const isActive =
            activeCompetencyId === compId &&
            phase.kind !== "closing" &&
            phase.kind !== "aboutYou";
          const done = isDemoExperienceComplete(exp);
          return (
            <button
              key={compId}
              type="button"
              className="block w-full text-left"
              onClick={() => {
                if (exp) {
                  setSelectedId(exp.id);
                  setStatusLine(null);
                  setCraftUi("idle");
                }
              }}
              disabled={!exp}
            >
              <Card
                className={cn(
                  "gap-0 py-0 transition",
                  isActive
                    ? "border-primary ring-2 ring-primary/40"
                    : "hover:border-border hover:ring-2 hover:ring-primary/10",
                  !exp && "opacity-70",
                )}
              >
                <CardContent className="space-y-2 p-4">
                  <div className="flex items-center gap-2">
                    <SuccessDriverIcon driver={driver} className="size-4" />
                    <span className="text-overline text-text-secondary">
                      {SUCCESS_DRIVERS[driver].shortLabel} · {idx + 1}/{focusQueue.length}
                    </span>
                    {done ? (
                      <span className="ml-auto text-overline text-extended-cyan-green">Done</span>
                    ) : null}
                  </div>
                  <div className="text-caption font-semibold text-text-primary">{spec.title}</div>
                  <div className="text-caption text-text-secondary">
                    {exp?.title?.trim() || "Waiting for experience…"}
                  </div>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      <div className="pt-2 text-overline text-text-primary">Success Drivers</div>
      <Card className="gap-0 py-0">
        <CardContent className="space-y-2.5 p-4">
          {pillarScores.map(({ id, score }) => (
            <div key={id} className="flex items-center justify-between gap-2">
              <SuccessDriverMark
                driver={id}
                label="short"
                showInfoTooltip
                className="text-caption"
                iconClassName="size-3.5"
                infoClassName="size-3"
              />
              <span className="shrink-0 font-gilroy text-caption tabular-nums text-text-secondary">
                {score > 0 ? score.toFixed(1) : "—"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="pt-2 text-overline text-text-primary">Your story draft</div>
      <Card className="gap-0 py-0">
        <CardContent className="space-y-3 p-5">
          {isDraftUpdating ? (
            <div className="space-y-3">
              <div className="h-5 w-44 animate-pulse rounded-lg bg-muted" />
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded-lg bg-muted" />
                <div className="h-4 w-11/12 animate-pulse rounded-lg bg-muted" />
              </div>
            </div>
          ) : (
            <>
              <div className="text-body-sm font-semibold text-text-primary">{storyQuick.title}</div>
              <div className="whitespace-pre-wrap text-caption leading-6 text-text-secondary">
                {storyQuick.body}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="pt-2 text-overline text-text-primary">Suggestions</div>
      <Card className="gap-0 py-0">
        <CardContent className="space-y-3 p-5">
          <div className="text-caption leading-6 text-text-primary">
            {typeof activeSuggestion === "string"
              ? emphasizeSuggestionText(activeSuggestion)
              : activeSuggestion}
          </div>
        </CardContent>
      </Card>

      {savedDives.length > 0 ? (
        <>
          <div className="pt-2 text-overline text-text-primary">Previous dives</div>
          <div className="space-y-2">
            {[...savedDives]
              .sort((a, b) => a.diveNumber - b.diveNumber)
              .map((dive) => {
                const score = dive.overallScore > 0 ? dive.overallScore : null;
                return (
                  <button
                    key={dive.id}
                    type="button"
                    className="block w-full text-left"
                    onClick={() =>
                      router.push(
                        `/storyboard/crafting?dive=${encodeURIComponent(dive.id)}&from=previous`,
                      )
                    }
                    aria-label={`View Dive ${dive.diveNumber} story`}
                  >
                    <div
                      data-slot="previous-dive-card"
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-[16px] border-[0.5px] border-solid border-[#dde7e9] p-4",
                        "backdrop-blur-[42px]",
                        "bg-[linear-gradient(114.96deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.5)_98.96%)]",
                        "transition hover:ring-2 hover:ring-primary/10",
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className="flex shrink-0 items-baseline gap-0.5 font-gilroy whitespace-nowrap">
                          <span
                            className={cn(
                              "cap-baseline text-[32px] font-normal leading-none tracking-[-1.6px] tabular-nums",
                              diveScoreTextClass(score),
                            )}
                          >
                            {score != null ? score.toFixed(1) : "—"}
                          </span>
                          <span className="cap-baseline text-[20px] font-normal leading-none tracking-[-1px] text-[#abadb2]">
                            /5
                          </span>
                        </div>
                        <div className="flex min-w-0 flex-col gap-0.5">
                          <span className="text-[16px] font-medium tracking-[-0.5px] text-extended-blue">
                            Dive {dive.diveNumber}
                          </span>
                          <span className="text-[12px] font-medium tracking-[-0.5px] text-text-primary">
                            Overall story score
                          </span>
                        </div>
                      </div>
                      <span
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-400 text-white [&_svg]:size-4"
                        aria-hidden
                      >
                        <ArrowUpRight />
                      </span>
                    </div>
                  </button>
                );
              })}
          </div>
        </>
      ) : null}
    </div>
  );

  function renderDiveCard(dive: StoryboardDive) {
    const overallScore = dive.overallScore > 0 ? dive.overallScore : null;
    const showBreakdown = latestDive?.id === dive.id;
    const divePillars = showBreakdown
      ? SUCCESS_DRIVER_ORDER.map((id) => ({
          id,
          score: dive.pillarScores?.[id] ?? 0,
        }))
      : [];

    return (
      <div key={dive.id} className="flex w-full flex-col gap-2">
        <div
          className={cn(
            "flex w-full flex-col gap-2.5 rounded-[20px] border-[0.5px] border-solid border-[#dde7e9]",
            "p-4 backdrop-blur-[42px]",
            "bg-[linear-gradient(114.96deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.5)_98.96%)]",
          )}
        >
          <div className="flex w-full items-center justify-between gap-4 py-4">
            <div className="flex min-w-0 flex-1 items-end gap-4">
              <div className="flex w-[148px] shrink-0 items-baseline gap-1 font-gilroy whitespace-nowrap">
                <span
                  className={cn(
                    "cap-baseline text-[64px] font-normal leading-none tracking-[-3.2px] tabular-nums",
                    diveScoreTextClass(overallScore),
                  )}
                >
                  {overallScore != null ? overallScore.toFixed(1) : "—"}
                </span>
                <span className="cap-baseline text-[48px] font-normal leading-none tracking-[-2.4px] text-[#abadb2]">
                  /5
                </span>
              </div>
              <div className="flex flex-col justify-between self-stretch">
                <span className="cap-baseline text-[20px] font-medium tracking-[-0.5px] text-extended-blue">
                  Dive {dive.diveNumber}
                </span>
                <span className="cap-baseline text-[16px] font-medium tracking-[-0.5px] text-text-primary">
                  Overall story score
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <IconButton
                type="button"
                variant="ghost"
                size="md"
                className="text-text-primary hover:bg-transparent hover:text-text-primary"
                aria-label={`Download Dive ${dive.diveNumber}`}
                title="Download"
                onClick={() =>
                  router.push(
                    `/storyboard/crafting?dive=${encodeURIComponent(dive.id)}&print=1`,
                  )
                }
              >
                <Download />
              </IconButton>
              <IconButton
                type="button"
                variant="solid"
                size="md"
                className="bg-brand-400 text-white hover:bg-brand-300"
                aria-label={`View Dive ${dive.diveNumber} story`}
                title="View Story"
                onClick={() =>
                  router.push(`/storyboard/crafting?dive=${encodeURIComponent(dive.id)}`)
                }
              >
                <ArrowUpRight />
              </IconButton>
            </div>
          </div>

          {showBreakdown ? (
            <div className="flex w-full flex-col">
              {divePillars.map(({ id, score }) => {
                const displayScore = score > 0 ? score : null;
                return (
                  <div
                    key={id}
                    className="flex w-full items-center gap-4 border-t border-extended-green py-[18px]"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <SuccessDriverIcon
                        driver={id}
                        className="size-4 shrink-0 text-text-primary"
                      />
                      <span className="truncate text-[16px] font-medium tracking-[-0.5px] text-text-primary">
                        {SUCCESS_DRIVERS[id].shortLabel}
                      </span>
                      <SuccessDriverInfoTip driver={id} />
                    </div>
                    {displayScore != null ? (
                      <div className="flex w-[88px] shrink-0 items-baseline justify-end gap-1 font-gilroy whitespace-nowrap">
                        <span
                          className={cn(
                            "cap-baseline w-[72px] text-right text-[32px] font-medium leading-none tracking-[-1.6px] tabular-nums",
                            diveScoreTextClass(displayScore),
                          )}
                        >
                          {displayScore.toFixed(1)}
                        </span>
                        <span className="cap-baseline text-[24px] font-medium leading-none tracking-[-1.2px] text-[#abadb2]">
                          /5
                        </span>
                      </div>
                    ) : (
                      <span className="shrink-0 text-caption text-text-secondary">Not yet covered</span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const showCaptureChrome =
    !showDiveHome &&
    !addCompetencyOpen &&
    phase.kind !== "greet" &&
    phase.kind !== "aboutYou" &&
    phase.kind !== "closing" &&
    activeCompetencyId;

  return (
    <AppShell
      rightPanel={showDiveHome || addCompetencyOpen ? undefined : storyboardRightPanel}
      rightPanelMaxWidth={400}
      contentTopClassName={showDiveHome ? COACH_HUB_CONTENT_TOP_CLASS : "pt-3"}
    >
      <CoachFloatingNav />
      <div
        className={cn(
          "mx-auto w-[800px] max-w-full",
          (phase.kind === "greet" || phase.kind === "closing") &&
            !showDiveHome &&
            !addCompetencyOpen &&
            "flex min-h-[calc(100vh-3.5rem-10rem)] flex-col justify-center",
        )}
      >
        {addCompetencyOpen ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-agent-heading text-left text-heading-teal">Add competencies</h2>
              <p className="text-left text-agent-question text-text-primary">
                Choose additional competencies to deepen this Dive. Competencies you&apos;ve
                already captured stay selected and can&apos;t be removed.
              </p>
            </div>
            <CoreFourSelectionPanel
              selected={addCompetencySelected}
              lockedIds={lockedCompetencyIds}
              targetRole={role}
              jobDescription={roleProfile?.jobDescription ?? ""}
              onToggle={toggleAddCompetency}
              onConfirm={confirmAddCompetencySelection}
              onCancel={() => {
                setAddCompetencyOpen(false);
                setAddCompetencyError(null);
              }}
              error={addCompetencyError}
              hideSuggestionReasoning
              confirmLabel="Confirm selection"
              helperText="When you're happy with your selection, confirm to start the next Dive."
              selectionMode="multi"
            />
          </div>
        ) : showDiveHome ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-agent-heading text-left text-heading-teal">
                {savedDives.length > 1
                  ? `Hey ${firstName}, this Dive adds more evidence to your Storyboard.`
                  : `Hey ${firstName}, your Storyboard is ready.`}
              </h2>
              <p className="text-left text-agent-question text-text-primary">
                Structured from the evidence you provided for{" "}
                <span className="rounded-sm bg-secondary px-1 text-secondary-foreground">{role}</span>
                .
              </p>
              {/* The word "Dive" used to appear first as a card title and was
                  defined only inside a dialog and the FAQ. One line, here. */}
              <p className="text-left text-caption leading-6 text-text-secondary">
                A Dive is a saved version of your Storyboard.{" "}
                {divesLeft > 0
                  ? `You have ${divesLeft} of ${maxDives} left — each new one builds on everything you've captured.`
                  : `You've used all ${maxDives} for this role.`}
              </p>
            </div>
            {showNearLimitBanner ? (
              <div
                role="status"
                className="flex w-full flex-col gap-3 rounded-lg border border-extended-light-cyan bg-extended-light-cyan/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="min-w-0 flex-1 text-body-sm leading-6 text-extended-green-blue">
                  {freePlan
                    ? "Keep refining your stories. Upgrade for more generations."
                    : `You're close to your ${activeBundle?.name ?? "plan"} storyboard limit. Purchase add-ons anytime for more.`}
                </p>
                {freePlan ? (
                  <Button asChild size="sm" className="shrink-0 self-start sm:self-center">
                    <Link href="/profile/pricing">Upgrade Plan</Link>
                  </Button>
                ) : (
                  <IconButton
                    type="button"
                    variant="ghost"
                    size="md"
                    className="shrink-0 self-start text-extended-green-blue sm:self-center"
                    aria-label="Dismiss"
                    onClick={() => setNearLimitBannerDismissedFor(usage.storyboardLimit)}
                  >
                    <X />
                  </IconButton>
                )}
              </div>
            ) : null}
            <div className="space-y-4">
              {savedDives.map((dive) => renderDiveCard(dive))}
              {divesLeft > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    if (usage.isStoryboardAtLimit) {
                      setUpgradeModalOpen(true);
                      return;
                    }
                    setAddCompetencySelected(initialAddSelection);
                    setAddCompetencyError(null);
                    setAddCompetencyOpen(true);
                  }}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-[20px] border border-dashed border-[#9FDFDA] px-4 py-5 text-left",
                    "bg-[linear-gradient(114.96deg,rgba(255,255,255,0.8)_0%,rgba(255,255,255,0.5)_98.96%)] backdrop-blur-[42px]",
                    "text-[16px] font-medium tracking-[-0.5px] text-extended-dark-cyan",
                    "transition hover:-translate-y-0.5 hover:bg-white/90",
                    "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
                    "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                  )}
                >
                  <Plus className="size-4 shrink-0" aria-hidden />
                  Take another dive to enrich your story
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <>
            {showCaptureChrome ? (
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <SuccessDriverCompetencyPill
                  driver={pillarForCompetency(activeCompetencyId)}
                  label={
                    <>
                      {SUCCESS_DRIVERS[pillarForCompetency(activeCompetencyId)].shortLabel}
                      {" · "}
                      {competencySpec(activeCompetencyId).title}
                    </>
                  }
                />
              </div>
            ) : null}

            <AgentPrompt
              promptKey={storyPromptKey}
              prompt={storyPrompt}
              ariaLabel="Storyboard prompt"
              headingClassName="text-agent-heading text-heading-teal"
              subtextClassName="mt-3 text-agent-question text-text-primary"
            />

            {phase.kind === "greet" ? (
              <p className="mt-3 text-agent-question text-text-primary">
                I&apos;ll guide you through real experiences that become clear,
                evidence-backed stories.{" "}
                <button
                  type="button"
                  onClick={() => setGreetAcknowledged(true)}
                  className="inline-flex items-center gap-1 font-medium text-[#095B73] underline-offset-2 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                >
                  Let&apos;s Start
                  <ArrowRight className="size-[0.7em] shrink-0 text-primary" aria-hidden />
                </button>
              </p>
            ) : null}

            {phase.kind === "closing" ? (
              <p className="mt-3 text-agent-question text-text-primary">
                Your experiences are ready to shape into interview-ready proof — you&apos;ll
                review it before it&apos;s saved.{" "}
                <button
                  type="button"
                  onClick={startCrafting}
                  disabled={craftUi === "crafting"}
                  className="inline-flex items-center gap-1 font-medium text-[#095B73] underline-offset-2 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-60"
                >
                  {craftUi === "crafting" ? "Crafting…" : "Craft my story"}
                  <ArrowRight
                    className="size-[1.15em] shrink-0 text-primary"
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>
              </p>
            ) : null}

            {statusLine ? (
              <p className="mt-6 text-caption leading-6 text-text-secondary">{statusLine}</p>
            ) : null}
          </>
        )}
      </div>

      <Dialog open={diveConfirmOpen} onOpenChange={setDiveConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start a new Dive?</DialogTitle>
            <DialogDescription>
              A Dive is a saved version of your Storyboard. This one starts from everything
              you&apos;ve captured so far and is saved when you finish reviewing it. You have{" "}
              {divesLeft} of {maxDives} remaining.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDiveConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (diveConfirmAction) {
                  beginNewDiveFromLatest(
                    diveConfirmAction,
                    diveUnlock,
                    pendingFocusIds ?? undefined,
                  );
                }
              }}
            >
              Start Dive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <GenericUpgradeModal open={upgradeModalOpen} onOpenChange={setUpgradeModalOpen} />

      <CoachBottomChatBar
        placeholder={
          addCompetencyOpen
            ? "Select competencies above to continue…"
            : showDiveHome
              ? "Open a Dive above to read or add to it…"
              : composerPlaceholder
        }
        onSend={handleText}
        freeTextMode="host"
        // On greet the bar is LIVE: typing anything begins, exactly as the
        // rail promises. Only closing (where the action is Craft) and the hub
        // disable it.
        disabled={
          addCompetencyOpen ||
          showDiveHome ||
          phase.kind === "closing" ||
          craftUi === "crafting"
        }
        prefill=""
        prefillKey={
          addCompetencyOpen ? "add-competency" : showDiveHome ? "post-craft" : replyPrefillKey
        }
        showUploadButton={false}
        rightPanelMaxWidth={showDiveHome || addCompetencyOpen ? undefined : 400}
      />
    </AppShell>
  );
}
