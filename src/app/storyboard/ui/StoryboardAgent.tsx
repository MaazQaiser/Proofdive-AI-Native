"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import {
  ArrowRight,
  BookOpen,
  Download,
  Plus,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { AgentPrompt } from "@/components/agents/AgentPrompt";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardNested,
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
import { SuccessDriverMark } from "@/components/ui/success-driver-card";
import { buildEmptyCraftingDive } from "@/app/storyboard/crafting/mockCraftingDraft";
import { CoreFourSelectionPanel } from "@/app/onboarding/ui/CoreFourSelectionPanel";
import {
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
import { scoringTextClass } from "@/lib/scoringPalette";
import {
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
} from "@/lib/storyboardDraft";
import type { Experience, RoleProfile } from "@/lib/proofdiveTypes";
import { writeJson } from "@/lib/storage";
import {
  SUCCESS_DRIVER_ORDER,
  SUCCESS_DRIVERS,
  type SuccessDriverId,
} from "@/lib/successDrivers";
import { cn } from "@/lib/utils";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { useStoryboardDiveStore } from "@/lib/useStoryboardDiveStore";

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

const ABOUT_YOU_PROMPT = `Is there anything you have missed, or do you want to add?

We want to know you better, tell us more about yourself: what are your passions, achievements, or something that makes you YOU.`;

const ABOUT_YOU_PREFILL =
  "I'm energized by turning messy operational problems into clear systems people actually use. Outside work I coach a weekend robotics club, and I'm proudest of a catalog migration that cut stockouts while giving teams one shared source of truth.";

const CAR_FIELDS: CarField[] = ["context", "action", "result"];

const CAR_PROMPTS: Record<CarField, { prompt: string; helper: string; prefill: string }> = {
  context: {
    prompt: "Context — what was the situation, challenge, goal, or constraint?",
    helper: "Give just enough background for someone to understand why the situation mattered.",
    prefill:
      "Inventory tracking was inconsistent across teams — no single source of truth for SKUs, and stockouts were rising.",
  },
  action: {
    prompt: "Action — what did you personally do?",
    helper: "Focus on what you personally did. Avoid saying only what the team did.",
    prefill:
      "I mapped how each team tracked inventory, defined a shared SKU standard, redesigned the intake flow, and ran adoption reviews until teams switched over.",
  },
  result: {
    prompt: "Result — what changed because of your actions?",
    helper:
      "Share measurable outcomes where possible. If no metric exists, describe observable change or impact.",
    prefill:
      "Inventory mismatch errors dropped ~40% in six weeks, and ops adopted the shared catalog as the default.",
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
  const divesLeft = role && diveHydrated ? remainingDives(diveStore, role) : MAX_DIVES_PER_ROLE;
  const latestDive = savedDives[0] ?? null;

  useEffect(() => {
    try {
      setIntakeMode(sessionStorage.getItem(StorageKeys.preferStoryboardIntake) === "1");
    } catch {
      setIntakeMode(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const wantNew = (searchParams.get("new") ?? "").trim();
    if (wantNew === "1" || wantNew.toLowerCase() === "true") {
      setSelectedId(null);
      setStatusLine(null);
      setCraftUi("idle");
      setGreetAcknowledged(false);
      setAddCompetencyOpen(false);
      setIntakeMode(true);
      setRoleProfile((prev) =>
        prev?.aboutYouAnswer ? { ...prev, aboutYouAnswer: undefined } : prev,
      );
      router.replace("/storyboard");
    }
  }, [searchParams, router, setRoleProfile]);

  useEffect(() => {
    const wantAdd = (searchParams.get("addCompetency") ?? "").trim();
    if (wantAdd !== "1" && wantAdd.toLowerCase() !== "true") return;
    if (!role || !diveHydrated) return;
    if (divesLeft <= 0 || !canStartNewDive(diveStore, role)) {
      router.replace("/storyboard");
      return;
    }
    setAddCompetencySelected(lockedCompetencyIds);
    setAddCompetencyError(null);
    setAddCompetencyOpen(true);
    router.replace("/storyboard");
  }, [
    searchParams,
    router,
    role,
    diveHydrated,
    diveStore,
    divesLeft,
    lockedCompetencyIds,
  ]);

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
    if (!canStartNewDive(diveStore, role)) return;
    const nextNum = (latestDive.diveNumber + 1) as 1 | 2 | 3;
    if (nextNum > 3) return;
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
      setRoleProfile((prev) =>
        prev
          ? {
              ...prev,
              storyboardFocusCompetencies: queue,
              aboutYouAnswer: undefined,
            }
          : prev,
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
    setDiveConfirmAction(action);
    setDiveUnlock(unlock);
    setPendingFocusIds(focusIds ?? null);
    setDiveConfirmOpen(true);
  }

  function openAddCompetencyPicker() {
    if (!role || divesLeft <= 0) return;
    if (!canStartNewDive(diveStore, role)) return;
    setAddCompetencySelected(lockedCompetencyIds);
    setAddCompetencyError(null);
    setAddCompetencyOpen(true);
  }

  function startAddCompetency() {
    if (postCraftHome) {
      openAddCompetencyPicker();
      return;
    }
    setSelectedId(null);
    setStatusLine(null);
    setCraftUi("idle");
    setGreetAcknowledged(false);
    setRoleProfile((prev) =>
      prev?.aboutYouAnswer ? { ...prev, aboutYouAnswer: undefined } : prev,
    );
    router.push("/storyboard?new=1");
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

  const pillarScores = useMemo(
    () =>
      SUCCESS_DRIVER_ORDER.map((id) => ({
        id,
        score: latestDive?.pillarScores?.[id] ?? 0,
      })),
    [latestDive],
  );

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
    if (selectedId) {
      return roleExperiences.find((e) => e.id === selectedId) ?? null;
    }
    if (activeCompetencyId) {
      return experienceForCompetency(roleExperiences, activeCompetencyId) ?? null;
    }
    return null;
  }, [selectedId, roleExperiences, activeCompetencyId]);

  const activeDriver: SuccessDriverId | null = activeCompetencyId
    ? pillarForCompetency(activeCompetencyId)
    : null;

  const storyPrompt = useMemo(() => {
    if (phase.kind === "greet") {
      return `Hey ${firstName}, let's build interview-ready proof from real experience.`;
    }
    if (phase.kind === "title") {
      const spec = competencySpec(phase.competencyId);
      const driver = SUCCESS_DRIVERS[spec.pillar];
      return `Competency ${phase.index + 1} of ${focusQueue.length}: ${spec.title} (${driver.shortLabel}).

What should this experience be called? (short title, up to ~15 words)`;
    }
    if (phase.kind === "car") {
      const meta = CAR_PROMPTS[phase.field];
      return `${meta.prompt}\n\n${meta.helper}`;
    }
    if (phase.kind === "consultant") {
      return phase.question;
    }
    if (phase.kind === "aboutYou") {
      return ABOUT_YOU_PROMPT;
    }
    return `This is coming together really well.

What would you like to do next?`;
  }, [phase, firstName, focusQueue.length]);

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

  const exampleReplyPrefill = useMemo(() => {
    if (phase.kind === "greet") return "Let's start.";
    if (phase.kind === "title") {
      return phase.index === 0
        ? "Inventory single source of truth"
        : "Owned the inventory rollout end-to-end";
    }
    if (phase.kind === "car") return CAR_PROMPTS[phase.field].prefill;
    if (phase.kind === "consultant") {
      return phase.qIndex === 0
        ? "I personally owned the analysis and the rollout plan — I didn't wait for a mandate."
        : "We traded short-term dual systems for a cleaner long-term catalog; the risk was adoption, so I ran weekly reviews.";
    }
    if (phase.kind === "aboutYou") return ABOUT_YOU_PREFILL;
    return "";
  }, [phase]);

  const replyPrefillKey = storyPromptKey;

  const composerPlaceholder = useMemo(() => {
    if (phase.kind === "closing") return "Choose an option above";
    if (phase.kind === "greet") return "Reply to start…";
    if (phase.kind === "title") return "Experience title…";
    if (phase.kind === "car") {
      return `${phase.field[0]!.toUpperCase()}${phase.field.slice(1)} (type or voice)…`;
    }
    if (phase.kind === "aboutYou") return "Passions, achievements, what makes you you…";
    return "Your answer (type or voice)…";
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
    const diveNumber = (existingEditing?.diveNumber ??
      ((latestSavedDive(diveStore, role)?.diveNumber ?? 0) + 1)) as 1 | 2 | 3;
    const safeNumber = Math.min(3, Math.max(1, diveNumber)) as 1 | 2 | 3;

    const base =
      existingEditing ??
      buildEmptyCraftingDive(role, safeNumber);
    const seeded = seedDiveFromDemoExperiences(
      base,
      roleExperiences,
      focusQueue,
      roleProfile?.aboutYouAnswer,
    );
    const nextStore = upsertEditingDive(diveStore, seeded);
    writeJson(StorageKeys.storyboardDives, nextStore);
    setDiveStore(nextStore);

    router.push("/storyboard/crafting");
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
        title: "One more thing",
        body: "Share passions, achievements, or what makes you you — this feeds your opening story, not a single competency.",
        suggestions: ["Aim for about 120–150 words — treat this like a consultant response."],
      };
    }

    if (!selected) {
      return {
        title: "Ready when you are",
        body: `We'll capture one experience for each of ${focusQueue.length} competencies, then craft your storyboard.`,
        suggestions: [
          <span key="start">
            Reply in chat to begin <span className="font-extrabold">Competency 1</span>.
          </span>,
        ],
      };
    }

    const car = selected.car;
    const bodyParts = [
      car?.context ? `Context: ${clampText(car.context, 160)}` : "",
      car?.action ? `Action: ${clampText(car.action, 200)}` : "",
      car?.result ? `Result: ${clampText(car.result, 140)}` : "",
    ].filter(Boolean);

    const suggestions: string[] = [];
    if (phase.kind === "car") {
      suggestions.push(CAR_PROMPTS[phase.field].helper);
    } else if (phase.kind === "consultant") {
      suggestions.push(
        "Be specific — personal ownership and trade-offs make the evidence defensible.",
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
        clampText(selected.raw, 340) ||
        "Add Context, Action, and Result to build this story.",
      suggestions: spec ? [`Anchored to ${spec.title}`, ...suggestions] : suggestions,
    };
  }, [selected, phase, focusQueue.length]);

  const activeSuggestion = useMemo(() => {
    const list = storyQuick.suggestions;
    if (!list.length) return null;
    return list[suggestionCursor % list.length] ?? null;
  }, [storyQuick.suggestions, suggestionCursor]);

  if (!role) {
    return (
      <AppShell>
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
      <div className="text-overline text-text-secondary">Competencies</div>

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
                      {idx + 1}/{focusQueue.length} · {SUCCESS_DRIVERS[driver].shortLabel}
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

      <div className="pt-2 text-overline text-text-secondary">Success Drivers</div>
      <Card className="gap-0 py-0">
        <CardContent className="space-y-2.5 p-4">
          {pillarScores.map(({ id, score }) => (
            <div key={id} className="flex items-center justify-between gap-2">
              <SuccessDriverMark
                driver={id}
                label="short"
                className="text-caption"
                iconClassName="size-3.5"
              />
              <span className="shrink-0 text-caption tabular-nums text-text-secondary">
                {score > 0 ? score.toFixed(1) : "—"}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="pt-2 text-overline text-text-secondary">Your story draft</div>
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

      <div className="pt-2 text-overline text-text-secondary">Suggestions</div>
      <Card className="gap-0 py-0">
        <CardContent className="space-y-3 p-5">
          {activeDriver ? (
            <SuccessDriverMark
              driver={activeDriver}
              label="short"
              className="text-overline"
              iconClassName="size-3.5"
            />
          ) : null}
          <div className="text-caption leading-6 text-text-primary">
            {typeof activeSuggestion === "string"
              ? emphasizeSuggestionText(activeSuggestion)
              : activeSuggestion}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  function renderDiveCard(dive: StoryboardDive, isCurrent: boolean) {
    const divePillars = SUCCESS_DRIVER_ORDER.map((id) => ({
      id,
      score: dive.pillarScores?.[id] ?? 0,
    }));
    const canAdd = divesLeft > 0 && (isCurrent || dive.diveNumber === 1);

    return (
      <Card
        key={dive.id}
        className="gap-0 py-0"
      >
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h3 className="text-h3 text-primary">Dive {dive.diveNumber}</h3>
              {isCurrent ? <Badge variant="secondary">Current</Badge> : null}
            </div>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="shrink-0 border-0 bg-card text-extended-cyan-green hover:bg-card hover:text-extended-cyan-green"
              aria-label={`Download Dive ${dive.diveNumber}`}
              title="Download"
              onClick={() =>
                router.push(`/storyboard/crafting?dive=${encodeURIComponent(dive.id)}&print=1`)
              }
            >
              <Download />
            </Button>
          </div>

          <CardNested className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="text-caption font-semibold text-text-primary">Overall story score</div>
            <div
              className={cn(
                "text-h5 tabular-nums",
                scoringTextClass(dive.overallScore > 0 ? dive.overallScore : null),
              )}
            >
              {dive.overallScore.toFixed(1)}
              <span className="pl-1 text-body text-text-secondary">/ 5</span>
            </div>
          </CardNested>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {divePillars.map(({ id, score }) => (
              <div
                key={id}
                className="flex flex-col gap-1.5 rounded-lg border border-border bg-surface px-3 py-2.5"
              >
                <SuccessDriverMark
                  driver={id}
                  label="short"
                  className="text-overline text-text-primary"
                  iconClassName="size-3.5"
                />
                <span
                  className={cn(
                    "text-body-sm font-medium tabular-nums",
                    scoringTextClass(score > 0 ? score : null),
                  )}
                >
                  {score > 0 ? score.toFixed(1) : "—"}
                  <span className="text-caption font-normal text-text-secondary"> / 5</span>
                </span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() =>
                router.push(`/storyboard/crafting?dive=${encodeURIComponent(dive.id)}`)
              }
            >
              <BookOpen />
              View story
            </Button>
            {canAdd ? (
              <Button
                type="button"
                className="border-0 bg-extended-light-cyan text-text-primary hover:bg-extended-light-cyan/80 hover:text-text-primary"
                onClick={startAddCompetency}
              >
                <Plus />
                Add Competency
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
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
    >
      <CoachFloatingNav />
      <div className="mx-auto w-[800px] max-w-full">
        {addCompetencyOpen ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <h2 className="text-h4 text-left text-text-primary">Add competencies</h2>
              <p className="text-body leading-6 text-text-secondary">
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
              onResetToSuggested={() => {
                setAddCompetencySelected(lockedCompetencyIds);
                setAddCompetencyError(null);
              }}
              onCancel={() => {
                setAddCompetencyOpen(false);
                setAddCompetencyError(null);
              }}
              error={addCompetencyError}
              hideSuggestionReasoning
              hideReset
              confirmLabel="Confirm selection"
              helperText="When you're happy with your selection, confirm to start the next Dive."
              selectionMode="multi"
            />
          </div>
        ) : showDiveHome ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-h4 text-left text-text-primary">
                {savedDives.length > 1
                  ? `Hey ${firstName}, we’ve enriched the story.`
                  : `Hey ${firstName}, we’ve crafted a story.`}
              </h2>
              <p className="text-left text-body-lg font-semibold text-text-secondary">
                For the role of <span className="text-text-primary">{role}</span>
              </p>
            </div>
            {divesLeft <= 0 ? (
              <div
                role="status"
                className="flex w-full items-start gap-3 rounded-lg border border-extended-light-cyan bg-extended-light-cyan/50 px-4 py-3"
              >
                <p className="min-w-0 flex-1 text-body-sm leading-6 text-extended-green-blue">
                  You&apos;ve used all {MAX_DIVES_PER_ROLE} Dives for this role. Earlier Dives stay
                  viewable and read-only.
                </p>
              </div>
            ) : null}
            <div className="space-y-4">
              {savedDives.map((dive, idx) => renderDiveCard(dive, idx === 0))}
            </div>
          </div>
        ) : (
          <>
            {showCaptureChrome ? (
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-extended-cyan-green/10 py-1.5 pl-1.5 pr-3">
                  <SuccessDriverIcon
                    driver={pillarForCompetency(activeCompetencyId)}
                    className="size-4"
                  />
                  <span className="text-overline font-medium text-text-primary">
                    {SUCCESS_DRIVERS[pillarForCompetency(activeCompetencyId)].shortLabel}
                    {" · "}
                    {competencySpec(activeCompetencyId).title}
                  </span>
                </div>
              </div>
            ) : null}

            <AgentPrompt
              promptKey={storyPromptKey}
              prompt={storyPrompt}
              ariaLabel="Storyboard prompt"
              headingClassName="text-agent-heading text-heading-teal"
              subtextClassName="mt-4 text-agent-question text-text-primary"
            />

            {phase.kind === "greet" ? (
              <p className="mt-8 text-agent-question text-text-primary">
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
              <div className="mt-8 space-y-3">
                <Button
                  className="w-full"
                  type="button"
                  onClick={startCrafting}
                  disabled={craftUi === "crafting"}
                >
                  {craftUi === "crafting" ? <Sparkles /> : <WandSparkles />}
                  Craft my story
                </Button>
              </div>
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
              This will start a new Dive, a deeper version of your storyboard built on everything
              you&apos;ve captured so far. You have {divesLeft} of {MAX_DIVES_PER_ROLE} remaining.
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

      <CoachBottomChatBar
        placeholder={
          addCompetencyOpen
            ? "Select competencies above to continue…"
            : showDiveHome
              ? "Storyboard ready — open View story to continue…"
              : phase.kind === "greet"
                ? "Use Let’s Start above…"
              : composerPlaceholder
        }
        onSend={handleText}
        freeTextMode="host"
        disabled={
          addCompetencyOpen ||
          showDiveHome ||
          phase.kind === "greet" ||
          phase.kind === "closing" ||
          craftUi === "crafting"
        }
        prefill={showDiveHome || addCompetencyOpen ? "" : exampleReplyPrefill}
        prefillKey={
          addCompetencyOpen ? "add-competency" : showDiveHome ? "post-craft" : replyPrefillKey
        }
        showUploadButton={false}
        rightPanelMaxWidth={showDiveHome || addCompetencyOpen ? undefined : 400}
      />
    </AppShell>
  );
}
