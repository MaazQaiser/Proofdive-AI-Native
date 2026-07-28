"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState, type ReactElement } from "react";
import {
  BookOpen,
  Download,
  FileText,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { AgentPrompt } from "@/components/agents/AgentPrompt";
import { CoachBottomChatBar } from "@/components/CoachBottomChatBar";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardNested,
} from "@/components/ui/card";
import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import { SuccessDriverMark } from "@/components/ui/success-driver-card";
import { buildMockCraftingDraft } from "@/app/storyboard/crafting/mockCraftingDraft";
import {
  DEMO_CONSULTANT_QUESTION_COUNT,
  DEMO_FOCUS_COUNT,
  competencySpec,
  consultantQuestionsFor,
  demoCompetencyQueue,
  experienceForCompetency,
  isDemoExperienceComplete,
  nextOpenDemoCompetency,
  pillarForCompetency,
  seedDraftFromDemoExperiences,
} from "@/lib/demoFocusCompetencies";
import { makeId } from "@/lib/id";
import {
  latestReportOverallForRole,
  pickLatestReport,
  safeParseReportsMap,
} from "@/lib/interviewReports";
import { normalizeWhitespace } from "@/lib/proofdiveLogic";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { scoringTextClass } from "@/lib/scoringPalette";
import {
  createStoryboardDraft,
  normalizeStoryboardDocument,
  overallCompetencyStrength,
  pillarStrength,
  type CompetencyId,
  type StoryboardDraftDocument,
  type StoryboardDraftStore,
} from "@/lib/storyboardDraft";
import type { Experience, RoleProfile, StoryboardFromCraft } from "@/lib/proofdiveTypes";
import {
  SUCCESS_DRIVER_ORDER,
  SUCCESS_DRIVERS,
  type SuccessDriverId,
} from "@/lib/successDrivers";
import { cn } from "@/lib/utils";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

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
  | { kind: "closing" };

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

function deriveCapturePhase(
  queue: readonly CompetencyId[],
  roleExperiences: readonly Experience[],
): CapturePhase {
  const openId = nextOpenDemoCompetency(queue, roleExperiences);
  if (!openId) return { kind: "closing" };

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

  return { kind: "closing" };
}

function latestReportIdForRole(roleTitle: string): string | null {
  if (typeof window === "undefined" || !roleTitle.trim()) return null;
  const map = safeParseReportsMap(window.localStorage.getItem(StorageKeys.reports));
  const list = Object.values(map).filter(
    (r) => (r.meta?.roleTitle ?? "").trim() === roleTitle.trim(),
  );
  if (!list.length) return pickLatestReport(map)?.meta.id ?? null;
  return (
    [...list].sort(
      (a, b) => new Date(b.meta.createdAt).getTime() - new Date(a.meta.createdAt).getTime(),
    )[0]?.meta.id ?? null
  );
}

export function StoryboardAgent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [roleProfile] = useLocalStorageState<RoleProfile | null>(
    StorageKeys.roleProfile,
    null,
  );
  const [experiences, setExperiences] = useLocalStorageState<Experience[]>(
    StorageKeys.experiences,
    [],
  );
  const [fromCraft, setFromCraft] = useLocalStorageState<StoryboardFromCraft | null>(
    StorageKeys.storyboardFromCraft,
    null,
  );
  const [draftStore, setDraftStore] = useLocalStorageState<StoryboardDraftStore>(
    StorageKeys.storyboardDraft,
    { version: 1, byRole: {} },
  );

  const role = roleProfile?.targetRole?.trim() ?? "";
  const firstName = useMemo(
    () => roleProfile?.name?.trim().split(/\s+/)[0] || "there",
    [roleProfile?.name],
  );

  const focusQueue = useMemo(() => demoCompetencyQueue(roleProfile), [roleProfile]);

  const roleExperiences = useMemo(
    () =>
      experiences.filter(
        (e) => e.role === role && e.competencyId && focusQueue.includes(e.competencyId),
      ),
    [experiences, role, focusQueue],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusLine, setStatusLine] = useState<string | null>(null);
  const [craftUi, setCraftUi] = useState<"idle" | "crafting" | "ready">("idle");
  const [isDraftUpdating, setIsDraftUpdating] = useState(false);
  const [suggestionCursor, setSuggestionCursor] = useState(0);
  const [greetAcknowledged, setGreetAcknowledged] = useState(false);

  useEffect(() => {
    const wantNew = (searchParams.get("new") ?? "").trim();
    if (wantNew === "1" || wantNew.toLowerCase() === "true") {
      setSelectedId(null);
      setStatusLine(null);
      setCraftUi("idle");
      setGreetAcknowledged(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const postCraftHome = Boolean(
    fromCraft && fromCraft.v === 1 && fromCraft.role === role,
  );

  const storyDraftDocument = useMemo<StoryboardDraftDocument>(() => {
    if (!role) return createStoryboardDraft("");
    const raw = draftStore.byRole[role] ?? createStoryboardDraft(role);
    return normalizeStoryboardDocument(raw);
  }, [draftStore, role]);

  const storyOverallScore = useMemo(
    () => overallCompetencyStrength(storyDraftDocument),
    [storyDraftDocument],
  );

  const storyScoreForCard = useMemo(() => {
    if (storyOverallScore > 0) return storyOverallScore;
    const fromReport = latestReportOverallForRole(role);
    if (fromReport != null && Number.isFinite(fromReport)) return fromReport;
    return storyOverallScore;
  }, [storyOverallScore, role]);

  const phase = useMemo(() => {
    const base = deriveCapturePhase(focusQueue, roleExperiences);
    if (base.kind === "greet" && greetAcknowledged) {
      return {
        kind: "title" as const,
        competencyId: focusQueue[0]!,
        index: 0,
      };
    }
    return base;
  }, [focusQueue, roleExperiences, greetAcknowledged]);

  const activeCompetencyId = useMemo(() => {
    if (phase.kind === "greet" || phase.kind === "closing") {
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

  const progressIndex =
    phase.kind === "greet"
      ? 0
      : phase.kind === "closing"
        ? DEMO_FOCUS_COUNT
        : phase.index + 1;

  const storyPrompt = useMemo(() => {
    if (phase.kind === "greet") {
      return `Hey ${firstName}, let's build interview-ready proof from real experience.

Reply to start with the first competency.`;
    }
    if (phase.kind === "title") {
      const spec = competencySpec(phase.competencyId);
      const driver = SUCCESS_DRIVERS[spec.pillar];
      return `Competency ${phase.index + 1} of ${DEMO_FOCUS_COUNT}: ${spec.title} (${driver.shortLabel}).

What should this experience be called? (short title, up to ~15 words)`;
    }
    if (phase.kind === "car") {
      const meta = CAR_PROMPTS[phase.field];
      return `${meta.prompt}\n\n${meta.helper}`;
    }
    if (phase.kind === "consultant") {
      return phase.question;
    }
    return `This is coming together really well.

What would you like to do next?`;
  }, [phase, firstName]);

  const storyPromptKey = `${phase.kind}-${activeCompetencyId ?? "none"}-${
    phase.kind === "car"
      ? phase.field
      : phase.kind === "consultant"
        ? phase.qIndex
        : phase.kind === "title"
          ? phase.index
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
    setStatusLine("It will take a moment. I'm crafting your story…");
    setCraftUi("crafting");

    // Generate a full 12-competency storyboard, then overlay the real CAR
    // evidence captured for the focus competencies during intake.
    const fullDraft = buildMockCraftingDraft(role);
    const seeded = seedDraftFromDemoExperiences(fullDraft, roleExperiences, focusQueue);
    setDraftStore((prev) => ({
      ...prev,
      byRole: { ...prev.byRole, [role]: seeded },
    }));

    window.setTimeout(() => {
      setCraftUi("ready");
      setStatusLine(null);
      setFromCraft({ v: 1, role, at: new Date().toISOString() });
    }, 900);
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
    if (!selected) {
      return {
        title: "Ready when you are",
        body: `We'll capture one experience for each of ${DEMO_FOCUS_COUNT} competencies, then craft your storyboard.`,
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
  }, [selected, phase]);

  const activeSuggestion = useMemo(() => {
    const list = storyQuick.suggestions;
    if (!list.length) return null;
    return list[suggestionCursor % list.length] ?? null;
  }, [storyQuick.suggestions, suggestionCursor]);

  const pillarScores = useMemo(
    () =>
      SUCCESS_DRIVER_ORDER.map((id) => ({
        id,
        score: pillarStrength(storyDraftDocument, id),
      })),
    [storyDraftDocument],
  );

  const reportHref = useMemo(() => {
    const id = latestReportIdForRole(role);
    return id ? `/report/${id}` : "/interview";
  }, [role, craftUi, fromCraft]);

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
      <div className="text-overline text-text-secondary">Experience bank</div>

      <div className="space-y-2">
        {focusQueue.map((compId, idx) => {
          const exp = experienceForCompetency(roleExperiences, compId);
          const spec = competencySpec(compId);
          const driver = pillarForCompetency(compId);
          const isActive = activeCompetencyId === compId && phase.kind !== "closing";
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
                      {idx + 1}/{DEMO_FOCUS_COUNT} · {SUCCESS_DRIVERS[driver].shortLabel}
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

  function renderStoryReadyCard(title: string, subtitle: string) {
    return (
      <Card className="gap-0 py-0">
        <CardContent className="space-y-4 p-6">
          <div className="text-overline text-text-secondary">{title}</div>
          <div className="text-h6 text-text-primary">{subtitle}</div>
          <CardNested className="flex flex-wrap items-end justify-between gap-3 px-4 py-3">
            <div>
              <div className="text-caption font-semibold text-text-primary">Overall story score</div>
              <div className="text-overline text-text-secondary">
                Mean of 12 competencies (0–5)
              </div>
            </div>
            <div
              className={cn(
                "text-h5",
                scoringTextClass(storyScoreForCard > 0 ? storyScoreForCard : null),
              )}
            >
              {storyScoreForCard.toFixed(1)}
              <span className="pl-1 text-body text-text-secondary">/ 5</span>
            </div>
          </CardNested>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {pillarScores.map(({ id, score }) => (
              <div
                key={id}
                className="flex flex-col items-start gap-1 rounded-lg border border-extended-cyan-green/20 bg-extended-cyan-green/10 px-2.5 py-2"
              >
                <SuccessDriverIcon driver={id} className="size-4 text-extended-cyan-green" />
                <span
                  className={cn(
                    "text-overline tabular-nums",
                    scoringTextClass(score > 0 ? score : null),
                  )}
                >
                  {score > 0 ? score.toFixed(1) : "—"}
                </span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => router.push("/storyboard/crafting")}>
              <BookOpen />
              View story
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push(reportHref)}>
              <FileText />
              View report
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/storyboard/crafting?print=1")}
            >
              <Download />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const showCaptureChrome =
    !postCraftHome && phase.kind !== "greet" && phase.kind !== "closing" && activeCompetencyId;

  return (
    <AppShell rightPanel={storyboardRightPanel} rightPanelMaxWidth={400}>
      <CoachFloatingNav />
      <div className="mx-auto w-[800px] max-w-full">
        {postCraftHome ? (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-h4 text-left text-text-primary">
                Hey {firstName}, we’ve crafted a story.
              </h2>
              <p className="text-left text-body-lg font-semibold text-text-secondary">
                For the role of <span className="text-text-primary">{role}</span>
              </p>
              <p className="text-left text-caption leading-6 text-text-secondary">
                Review your storyboard or jump to your report.
              </p>
            </div>
            {renderStoryReadyCard(
              "Your storyboard",
              `Your storyboard for ${role} is ready to review.`,
            )}
          </div>
        ) : (
          <>
            {showCaptureChrome ? (
              <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-extended-cyan-green/25 bg-extended-cyan-green/10 px-3 py-1.5">
                  <SuccessDriverIcon
                    driver={pillarForCompetency(activeCompetencyId)}
                    className="size-4"
                  />
                  <span className="text-overline font-medium text-text-primary">
                    {SUCCESS_DRIVERS[pillarForCompetency(activeCompetencyId)].shortLabel}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="text-overline text-text-secondary">
                    Competency {progressIndex} of {DEMO_FOCUS_COUNT}
                  </div>
                  <div className="text-body-sm font-semibold text-text-primary">
                    {competencySpec(activeCompetencyId).title}
                  </div>
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

            {phase.kind === "closing" && craftUi !== "ready" ? (
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
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(reportHref)}
                >
                  <FileText />
                  Skip to report
                </Button>
              </div>
            ) : null}

            {phase.kind === "closing" && craftUi === "ready" ? (
              <div className="mt-8 space-y-6">
                {renderStoryReadyCard(
                  "Your storyboard",
                  `Your storyboard for ${role} is here.`,
                )}
              </div>
            ) : null}

            {statusLine ? (
              <p className="mt-6 text-caption leading-6 text-text-secondary">{statusLine}</p>
            ) : null}
          </>
        )}
      </div>
      <CoachBottomChatBar
        placeholder={
          postCraftHome ? "Storyboard ready — open View story or View report…" : composerPlaceholder
        }
        onSend={handleText}
        disabled={postCraftHome || phase.kind === "closing" || craftUi === "crafting"}
        prefill={postCraftHome ? "" : exampleReplyPrefill}
        prefillKey={postCraftHome ? "post-craft" : replyPrefillKey}
        showUploadButton={false}
        rightPanelMaxWidth={400}
      />
    </AppShell>
  );
}
