"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Download,
  Plus,
  X,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { AgentPrompt } from "@/components/agents/AgentPrompt";
import { CoachBrief } from "@/components/agents/CoachBrief";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { COACH_HUB_CONTENT_TOP_CLASS } from "@/components/coachNavLayout";
import { Badge } from "@/components/ui/badge";
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
import {
  applyFinanceDemoAssessments,
  financeDemoPrefill,
} from "@/app/storyboard/crafting/financeFpaDemoFixture";
import { GenericUpgradeModal } from "@/components/GenericUpgradeModal";
import { CoreFourSelectionPanel } from "@/app/onboarding/ui/CoreFourSelectionPanel";
import { computeCandidateUsage, isFreePlan } from "@/lib/candidateUsage";
import {
  CAR_FIELD_GUIDANCE,
  COMPETENCY_GUIDANCE,
  CONSULTANT_WHY,
  DEMO_CONSULTANT_QUESTION_COUNT,
  carActionWhy,
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
import { readJson, writeJson } from "@/lib/storage";
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

This becomes the opening of your Storyboard — the answer to “tell me about yourself”. Who you are, what you’re moving toward, and one or two things you’re proud of.`;

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

function clampText(text: string, maxChars: number) {
  const t = text.trim();
  if (t.length <= maxChars) return t;
  const cut = t.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, Math.max(0, lastSpace)).trim()}…`;
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

  /* Demo scaffolding: read-only here. Turning the mode on (and seeding the
   * persona) happens in the nav, deliberately — `useLocalStorageState` writes
   * its hydrated value back on mount, so seeding from inside this component
   * races that write and loses. The DEFAULT Storyboard is untouched by all of
   * this: the composer only ever arrives pre-filled when this is on. */
  const [demoMode, setDemoMode] = useState(false);
  useEffect(() => {
    setDemoMode(readJson<boolean>(StorageKeys.storyboardDemoMode) === true);
  }, []);

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

  /* THE QUESTION, AND NOTHING BUT THE QUESTION — on the three capture phases.
   *
   * The guidance used to ride in this same string after a `\n\n`, which
   * `splitPrompt` turned into 28px subtext UNDER the question. It now lives
   * above the question in `storyBrief`, so it must NOT be here as well: these
   * three branches return one sentence with nothing after it, which
   * `splitPrompt` (still used inside AgentPrompt) cannot split — its paragraph
   * rule needs a `\n\n` and its sentence fallback needs trailing text — so
   * AgentPrompt types one heading and renders no subtext. No change to
   * AgentPrompt, TypingText or splitPrompt is required.
   *
   * Invariant to keep: every capture question stays a SINGLE sentence. Add a
   * second sentence here and splitPrompt's fallback will silently demote it
   * into the subtext slot.
   *
   * greet / aboutYou / closing keep their heading + subtext shape: they have
   * no competency to file a brief under, so no brief renders on them and the
   * subtext is still the right home for their second line. */
  const storyPrompt = useMemo(() => {
    if (phase.kind === "greet") {
      return `Hey ${firstName}, let's build interview-ready proof from real experience.`;
    }
    if (phase.kind === "title") {
      return `Which experience best shows your ${competencySpec(phase.competencyId).title}?`;
    }
    if (phase.kind === "car") return CAR_FIELD_GUIDANCE[phase.field].question;
    if (phase.kind === "consultant") return phase.question;
    if (phase.kind === "aboutYou") {
      return ABOUT_YOU_PROMPT;
    }
    return `This is coming together really well.`;
  }, [phase, firstName]);

  /* WHY THIS QUESTION EXISTS — the coach's brief, rendered above the question.
   *
   * This is now the ONLY guidance surface. There used to be a second one, a
   * cue line against the composer carrying `COMPETENCY_GUIDANCE[id].good` —
   * what a strong answer contains — and the split was WHY up here, HOW down
   * there. That line has been removed, so this brief and `composerPlaceholder`
   * carry everything between them: the brief says why the question is asked,
   * the placeholder shows the shape of an answer. Worth knowing if the scoring
   * standard ever needs a home again — `.good` is still in the data, unused.
   *
   * Two things that used to be welded onto the end of the guidance sentence
   * are gone, because they were bottom-surface material:
   *   - "Give it a short name so we can refer to it" — `composerPlaceholder`
   *     already says exactly this, at the moment it applies.
   *   - "Follow-up 1 of 2." — a progress fact. CONSULTANT_WHY now carries it
   *     in prose ("Two short follow-ups now…", "Last one."), so the screen
   *     does not grow a third counter next to the rail's two. */
  const storyBrief = useMemo<string | null>(() => {
    if (phase.kind === "title") return COMPETENCY_GUIDANCE[phase.competencyId].why;
    if (phase.kind === "car") {
      if (phase.field === "action") {
        return carActionWhy(competencySpec(phase.competencyId).title);
      }
      return CAR_FIELD_GUIDANCE[phase.field].why;
    }
    if (phase.kind === "consultant") {
      return (
        CONSULTANT_WHY[phase.qIndex] ??
        CONSULTANT_WHY[CONSULTANT_WHY.length - 1] ??
        null
      );
    }
    return null;
  }, [phase]);

  /* THE TRANSCRIPT, DERIVED — never stored. Every completed turn is already in
   * `roleExperiences` (title, the three CAR fields, and each follow-up with its
   * question) plus `aboutYouAnswer`, in exactly the order `deriveCapturePhase`
   * walked them. Rebuilding the history from that store means it can never
   * drift from the truth the way an appended message log could, costs no new
   * state, and survives reloads for free. Each step carries the same guidance
   * sentence the coach showed at the time, from the same constants the live
   * brief reads — so the history shows what the user actually saw.
   *
   * Order inside a competency intentionally mirrors the phase machine: title,
   * then CAR fields IN ORDER (stopping at the first empty one, since nothing
   * past it can have been asked), then follow-ups. */
  const capturedSteps = useMemo(() => {
    type CapturedStep = {
      key: string;
      guidance: string | null;
      question: string;
      answer: string;
    };
    const steps: CapturedStep[] = [];
    for (const compId of focusQueue) {
      const exp = experienceForCompetency(roleExperiences, compId);
      if (!exp?.title?.trim()) continue;
      const spec = competencySpec(compId);
      steps.push({
        key: `${compId}-title`,
        guidance: COMPETENCY_GUIDANCE[compId].why,
        question: `Which experience best shows your ${spec.title}?`,
        answer: exp.title.trim(),
      });
      for (const field of CAR_FIELDS) {
        const val = exp.car?.[field]?.trim();
        if (!val) break;
        steps.push({
          key: `${compId}-${field}`,
          guidance:
            field === "action"
              ? carActionWhy(spec.title)
              : CAR_FIELD_GUIDANCE[field].why,
          question: CAR_FIELD_GUIDANCE[field].question,
          answer: val,
        });
      }
      (exp.consultantAnswers ?? []).forEach((ca, i) => {
        if (!ca.answer?.trim()) return;
        steps.push({
          key: `${compId}-fu${i}`,
          guidance: CONSULTANT_WHY[i] ?? CONSULTANT_WHY[CONSULTANT_WHY.length - 1] ?? null,
          question: ca.question,
          answer: ca.answer.trim(),
        });
      });
    }
    const about = roleProfile?.aboutYouAnswer?.trim();
    if (about) {
      steps.push({
        key: "about-you",
        guidance: ABOUT_YOU_PROMPT.split("\n\n")[1] ?? null,
        question: ABOUT_YOU_PROMPT.split("\n\n")[0] ?? "Tell me about yourself.",
        answer: about,
      });
    }
    return steps;
  }, [focusQueue, roleExperiences, roleProfile?.aboutYouAnswer]);

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

  /* Keeps the DEFAULT view exactly what it was before the transcript existed:
   * the live coach brief + question aligned to the top of the scroll viewport,
   * with all history off-screen ABOVE it. Fired on every phase change (the
   * prompt key) and again when hydration brings the stored history in under a
   * mounted component (`capturedSteps.length`), or the first paint would land
   * mid-transcript. First alignment is instant — it is layout, not an event;
   * after that it glides, so a send visibly advances the timeline the way a
   * chat does. Reduced-motion never glides. The user's own scrolling is never
   * fought: nothing here runs on scroll, only on turn boundaries. */
  const liveTurnRef = useRef<HTMLDivElement | null>(null);
  const hasAlignedOnce = useRef(false);
  useEffect(() => {
    const el = liveTurnRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({
      behavior: hasAlignedOnce.current && !reduced ? "smooth" : ("instant" as ScrollBehavior),
      block: "start",
    });
    hasAlignedOnce.current = true;
  }, [storyPromptKey, capturedSteps.length]);


  /* The persona's answer for whatever is being asked right now. Computed from
   * the same phase the question came from, so the two can never drift apart. */
  const demoPrefill = useMemo(() => {
    if (!demoMode) return "";
    switch (phase.kind) {
      case "greet":
        return financeDemoPrefill({ kind: "greet" });
      case "title":
        return financeDemoPrefill({ kind: "title", competencyId: phase.competencyId });
      case "car":
        return financeDemoPrefill({
          kind: "car",
          competencyId: phase.competencyId,
          field: phase.field,
        });
      case "consultant":
        return financeDemoPrefill({
          kind: "consultant",
          competencyId: phase.competencyId,
          qIndex: phase.qIndex,
        });
      case "aboutYou":
        return financeDemoPrefill({ kind: "aboutYou" });
      default:
        return "";
    }
  }, [demoMode, phase]);

  /* No prefilled answers: the audit found the composer arrived with a
   * fabricated example already typed in as its VALUE, so one Send submitted
   * invented evidence — the opposite of the product's guardrails. The example
   * lives here instead, as the SHAPE of a good answer. (The competency's own
   * scoring standard used to sit beside the composer as a cue line; that
   * surface has been removed.) */
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
    const seededRaw = seedDiveFromDemoExperiences(
      base,
      roleExperiences,
      focusQueue,
      roleProfile?.aboutYouAnswer,
    );
    // In demo mode the judgement comes from the persona's fixture rather than
    // the word-count heuristic, which scores these long answers at 4.9/5 —
    // a number that contradicts the "here is what is missing" half of the
    // product. Everything the user typed is kept as-is.
    const seeded = demoMode ? applyFinanceDemoAssessments(seededRaw) : seededRaw;
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

  type StoryQuick = { title: string; body: string };

  const storyQuick = useMemo<StoryQuick>(() => {
    if (phase.kind === "aboutYou") {
      return {
        title: "Your introduction",
        body: "This becomes the opening of your Storyboard — the first thing an interviewer hears. It isn't scored against a single competency.",
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
        };
      }
      return {
        title: "Ready when you are",
        body: `One experience for each of ${focusQueue.length} competencies, then we craft your storyboard.${scopeNote}`,
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

    return {
      title: selected.title || "Untitled experience",
      body:
        bodyParts.join("\n\n") ||
        "Next: the situation — what was going on, and what was at stake.",
    };
  }, [selected, phase, focusQueue.length, roleProfile?.coreFourCompetencies?.length]);

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

  /* How many of this Dive's competencies are fully captured — the number the
   * section heading shows. Not a hook: this sits after an early return. */
  const capturedCount = focusQueue.filter((compId) =>
    isDemoExperienceComplete(experienceForCompetency(roleExperiences, compId)),
  ).length;

  const storyboardRightPanel = (
    <div className="space-y-3">
      {/* The draft leads. It is the thing being built — the competency list and
          the scores are both readouts ABOUT it — so it should be the first
          thing in the rail rather than the last, and it is the block that
          changes on every answer. No `pt-2`: that padding existed to open a gap
          under the card above, and there is nothing above it now. */}
      <div className="text-overline text-text-primary">Your story draft</div>
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

      {/* The count belongs to the SECTION, not to each card. On the cards it
          read as "1/2" beside a pillar name, which looks like a score — the
          one number a rail of Strength scores must not be ambiguous about.
          Here it is unmistakably progress through the list. */}
      <div className="flex items-center gap-2 pt-2 text-overline text-text-primary">
        Competencies
        <Badge className="ml-auto">
          {capturedCount} of {focusQueue.length}
        </Badge>
      </div>

      <div className="space-y-2">
        {focusQueue.map((compId) => {
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
                {/* Two rows, not three. The competency is what the card is
                    about, so it takes the top line; the pillar is a filing
                    label, so it goes right, as a tag. That folds the old pillar
                    row away and drops ~20px from every card — over four cards
                    it is a whole card's worth of rail back.

                    Done does not add a second tag beside the first. The pillar
                    tag already sits where a status would go, so it carries the
                    status instead: its leading mark swaps from the pillar glyph
                    to a tick and the fill goes solid. One element, one
                    footprint, and the pillar label survives either way. */}
                <CardContent className="space-y-1 p-4">
                  <div className="flex items-start gap-2">
                    <span className="min-w-0 flex-1 truncate text-body-sm font-semibold text-text-primary">
                      {spec.title}
                    </span>
                    {/* `default` fills with --primary, and its own token note
                        warns why that is wrong here: --primary-foreground on
                        #0E9AB5 measures 3.05:1, fine on an 18px button label
                        and under the 4.5:1 this 12px tag needs. Measured on the
                        card it came back at exactly 3.05. --extended-blue is
                        the same teal a few steps deeper and takes the same
                        light ink to 5.25:1 (11.4:1 in dark), so the captured
                        tag can stay solid — which is what makes it findable in
                        a rail of four — without shipping a failing label. */}
                    <Badge
                      variant={done ? "default" : "secondary"}
                      className={cn("mt-px", done && "bg-extended-blue")}
                    >
                      {done ? (
                        <Check aria-hidden strokeWidth={3} />
                      ) : (
                        <SuccessDriverIcon driver={driver} aria-hidden />
                      )}
                      {SUCCESS_DRIVERS[driver].shortLabel}
                      <span className="sr-only">
                        {done ? " — captured" : " — waiting for experience"}
                      </span>
                    </Badge>
                  </div>
                  <div className="truncate text-caption text-text-secondary">
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

      {/* No "Previous dives" here. The other three blocks are all about
          THIS Dive as it is being captured; a saved Dive is a different
          scope, and its card navigates away — offering that beside a
          half-answered question is a trap, not an affordance. Saved Dives
          live on the hub, which is one click away. */}
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
              confirmLabel="Confirm selection"
              helperText="When you're happy with your selection, confirm to start the next Dive."
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
            {/* THE TRANSCRIPT. Every completed turn, oldest first, stacked
                ABOVE the live question inside the shell's own scroll column —
                so by default it sits off-screen (the alignment effect pins the
                live turn to the viewport top) and scrolling up reveals it as a
                continuous timeline, the way a chat's history does.

                Each turn mirrors the live screen's own order — guidance, then
                question, then the answer — but demoted a full rank: the
                guidance drops to a muted caption, the question from 40px to
                20px, and only the ANSWER keeps full ink and gains a card,
                because the user's own words are what someone scrolls back to
                re-read. Separators are the neutral `--border` hairline; the
                live block below keeps the teal one — past turns file away in
                grey, the coach's live rule stays the one brand-coloured line.

                Static on purpose: no TypingText (a transcript retyping itself
                would be absurd) and no per-item entrance animation — items are
                revealed by the user's own scrolling, which needs no help. */}
            {capturedSteps.length ? (
              <section aria-label="Completed questions and answers">
                <ol>
                  {capturedSteps.map((step) => (
                    <li
                      key={step.key}
                      /* py-12, twice the original rhythm: each turn owns 48px
                         either side of its rule. The gaps INSIDE a turn
                         (guidance 6px, question-to-answer 12px) stay small on
                         purpose — scanning works off the contrast between the
                         tight inside and the wide outside, so widening only
                         the outside is what buys the grouping. */
                      className="border-b border-border py-12 first:pt-4"
                    >
                      {step.guidance ? (
                        /* /70, not text-secondary: the standing AA fix — the
                           secondary ink is 4.43:1 on this ground, under the
                           4.5 small text needs. */
                        <p className="text-caption leading-5 text-text-primary/70">
                          {step.guidance}
                        </p>
                      ) : null}
                      <h3 className="mt-1.5 text-body-lg font-medium tracking-[-0.5px] text-heading-teal">
                        {step.question}
                      </h3>
                      {/* The user's words, on the RIGHT — the coach speaks
                          from the left margin, the user answers from the
                          right, which is the geometry every chat has taught.
                          `rounded-br-md` breaks one corner toward the
                          composer the answer came from; alignment does the
                          rest, so the card needs no other bubble costume. */}
                      <div className="ml-auto mt-3 w-fit max-w-[62ch] rounded-xl rounded-br-md border border-border bg-card px-4 py-3">
                        <p className="whitespace-pre-wrap text-body-sm leading-6 text-text-primary">
                          {step.answer}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ) : null}

            {/* The LIVE turn. The ref is the transcript's anchor: the
                alignment effect pins this block's top to the viewport top on
                every turn boundary, which is exactly the screen the flow
                showed before the transcript existed. `scroll-mt-3` matches the
                scroll container's own pt-3, so the pinned position and the
                no-history position are the same 12px below the header.

                The min-height (viewport minus the 3.5rem header minus the
                scroller's 8rem pb) is what makes the pin PHYSICALLY POSSIBLE:
                scrollIntoView can only move as far as there is content below,
                and after one answered question there is not a screenful of it —
                without this, a short transcript would sit half-visible above
                the live turn instead of off-screen. It also reproduces the old
                screen exactly: question at the top, open space down to the
                composer. Gated on the transcript existing so the greet screen
                keeps its centred-hero layout, which has no history above it. */}
            <div
              ref={liveTurnRef}
              className={cn(
                "scroll-mt-3",
                capturedSteps.length > 0 && "min-h-[calc(100vh-11.5rem)]",
                /* The completion moment is a destination, not another turn in
                   the queue, so it re-earns the centred hero the flow always
                   gave it: the wrapper is a full viewport tall either way, and
                   centring INSIDE it means the pin (which aligns the wrapper's
                   top) lands the message mid-screen — transcript still one
                   scroll above. Question turns stay top-pinned: they hold a
                   composer conversation and belong at the reading line. */
                /* The closing box reuses the ORIGINAL hero's own numbers
                   (100vh - 3.5rem header - 10rem composer zone) rather than
                   the pin calc: it is 2rem shorter than what perfect pinning
                   needs, so the wrapper rests that little bit lower and the
                   message lands where the pre-transcript hero always did. */
                capturedSteps.length > 0 &&
                  phase.kind === "closing" &&
                  "flex min-h-[calc(100vh-3.5rem-10rem)] flex-col justify-center",
              )}
            >
            {/* The brief REPLACES the free-floating competency pill that used
                to sit here, and absorbs its content into its own byline row —
                so the screen gains a container and loses a floater, and it
                loses the 28px guidance subtext under the question too. Net
                effect on column height is ~+18px, not a new block of chrome.
                `showCaptureChrome` is the same gate the pill used, so this is
                a straight swap on exactly the screens that had one. */}
            {showCaptureChrome && storyBrief ? (
              <CoachBrief note={storyBrief} />
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
                  className="app-link inline-flex items-center gap-1 font-semibold"
                >
                  Let&apos;s Start
                  <ArrowRight className="size-[0.7em] shrink-0" aria-hidden />
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
                  className="app-link inline-flex items-center gap-1 font-semibold"
                >
                  {craftUi === "crafting" ? "Crafting…" : "Craft my story"}
                  <ArrowRight
                    className="size-[1.15em] shrink-0"
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>
              </p>
            ) : null}

            {statusLine ? (
              <p className="mt-6 text-caption leading-6 text-text-secondary">{statusLine}</p>
            ) : null}
            </div>
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
        /* Demo only. The product ships with an empty composer on purpose —
           a prefilled answer means one Send submits invented evidence — so
           this is gated on demoMode and nothing else can reach it. */
        prefill={demoMode ? demoPrefill : ""}
        prefillKey={
          addCompetencyOpen ? "add-competency" : showDiveHome ? "post-craft" : replyPrefillKey
        }
        showUploadButton={false}
        // Guidance rides with the composer, and only while the composer is the
        // thing to use: the hub and the competency picker offer buttons.
        rightPanelMaxWidth={showDiveHome || addCompetencyOpen ? undefined : 400}
      />
    </AppShell>
  );
}
