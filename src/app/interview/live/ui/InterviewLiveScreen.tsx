"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/Button";
import { cn } from "@/components/cn";
import { Logo } from "@/components/ui/logo";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { PILLAR_LABEL, type PillarId } from "@/lib/storyboardDraft";
import type {
  InterviewReport,
  InterviewReportDriver,
  InterviewSessionKind,
  InterviewTranscriptLine,
  RoleProfile,
} from "@/lib/proofdiveTypes";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

type InterviewSessionPrefs = {
  cancelRecording?: boolean;
  turnOffCamera?: boolean;
  cameraEnabled?: boolean;
  sessionKind?: InterviewSessionKind;
  /** When `sessionKind` is `selective_pillar`, pillars chosen on /interview (short session). */
  selectivePillars?: ("thinking" | "action" | "people" | "mastery")[];
};

function readInterviewSessionOnClient(): { duration: number; prefs: InterviewSessionPrefs } {
  const defaultDuration = 10 * 60;
  if (typeof window === "undefined") {
    return { duration: defaultDuration, prefs: {} };
  }
  try {
    const raw = window.localStorage.getItem(StorageKeys.interviewSessionPrefs);
    if (!raw) return { duration: defaultDuration, prefs: {} };
    const prefs = JSON.parse(raw) as InterviewSessionPrefs;
    const duration = prefs.sessionKind === "full_competency" ? 30 * 60 : 10 * 60;
    return { duration, prefs };
  } catch {
    return { duration: defaultDuration, prefs: {} };
  }
}

function safeParseJson<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function generateReportId(): string {
  // Deep link friendly, unique enough for local-only storage.
  return `rep_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 1;
  return Math.min(5, Math.max(1, score));
}

/** Three sub-skill scores whose average equals `mean` (before clamp, means in ~[1.2, 4.8] stay exact). */
function subSkillsForMean(mean: number, names: readonly [string, string, string]) {
  const m = clampScore(mean);
  return [
    { name: names[0], score: clampScore(m - 0.1) },
    { name: names[1], score: clampScore(m) },
    { name: names[2], score: clampScore(m + 0.1) },
  ] as const;
}

/** Pillar-level means for first mock; must average to the same number as `FIRST_START_OVERALL`. */
const FIRST_START_OVERALL = 2.4;
const FIRST_START_PILLAR_MEANS = [2.2, 2.35, 2.45, 2.6] as const;

function buildFirstStartDriversBase(): Array<
  Pick<InterviewReportDriver, "id" | "shortTitle" | "fullTitle" | "accent" | "icon" | "subSkills">
> {
  const targets = FIRST_START_PILLAR_MEANS;
  return [
    {
      id: "thinking",
      shortTitle: "Thinking",
      fullTitle: "Power of Thinking",
      accent: "teal",
      icon: "brain",
      subSkills: [...subSkillsForMean(targets[0]!, ["Analytical Thinking", "Prioritization", "Decision-Making Agility"])],
    },
    {
      id: "action",
      shortTitle: "Action",
      fullTitle: "Power of Action",
      accent: "amber",
      icon: "bolt",
      subSkills: [...subSkillsForMean(targets[1]!, ["Ownership", "Initiative & Follow-through", "Embraces Change"])],
    },
    {
      id: "people",
      shortTitle: "People",
      fullTitle: "Power of People",
      accent: "emerald",
      icon: "users",
      subSkills: [...subSkillsForMean(targets[2]!, ["Influence", "Collaboration & Inclusion", "Grows Capability"])],
    },
    {
      id: "mastery",
      shortTitle: "Mastery",
      fullTitle: "Power of Mastery",
      accent: "violet",
      icon: "target",
      subSkills: [...subSkillsForMean(targets[3]!, ["Functional Knowledge", "Execution", "Innovation"])],
    },
  ];
}

function readinessForScore(score: number): "Not ready" | "Borderline" | "Ready" {
  if (score >= 3.5) return "Ready";
  if (score >= 2.5) return "Borderline";
  return "Not ready";
}

function bandForScore(score: number): "needs_work" | "developing" | "strong" {
  if (score >= 3.5) return "strong";
  if (score >= 2.5) return "developing";
  return "needs_work";
}

function buildMockReport(args: {
  id: string;
  roleTitle: string;
  interviewName: string;
  durationSeconds: number;
  questionCount: number;
  heroVariant: "first_start" | "improving";
}): InterviewReport {
  const firstStart = args.heroVariant === "first_start";

  const driversBase: Array<
    Pick<InterviewReportDriver, "id" | "shortTitle" | "fullTitle" | "accent" | "icon" | "subSkills">
  > = firstStart
    ? buildFirstStartDriversBase()
    : [
        {
          id: "thinking",
          shortTitle: "Thinking",
          fullTitle: "Power of Thinking",
          accent: "teal",
          icon: "brain",
          subSkills: [
            { name: "Analytical Thinking", score: 3.4 },
            { name: "Prioritization", score: 2.9 },
            { name: "Decision-Making Agility", score: 3.1 },
          ],
        },
        {
          id: "action",
          shortTitle: "Action",
          fullTitle: "Power of Action",
          accent: "amber",
          icon: "bolt",
          subSkills: [
            { name: "Ownership", score: 2.6 },
            { name: "Initiative & Follow-through", score: 2.4 },
            { name: "Embraces Change", score: 2.8 },
          ],
        },
        {
          id: "people",
          shortTitle: "People",
          fullTitle: "Power of People",
          accent: "emerald",
          icon: "users",
          subSkills: [
            { name: "Influence", score: 3.8 },
            { name: "Collaboration & Inclusion", score: 3.6 },
            { name: "Grows Capability", score: 3.2 },
          ],
        },
        {
          id: "mastery",
          shortTitle: "Mastery",
          fullTitle: "Power of Mastery",
          accent: "violet",
          icon: "target",
          subSkills: [
            { name: "Functional Knowledge", score: 2.7 },
            { name: "Execution", score: 2.9 },
            { name: "Innovation", score: 2.5 },
          ],
        },
      ];

  const drivers = driversBase.map((d) => {
    const avg = clampScore(
      d.subSkills.reduce((acc, s) => acc + clampScore(s.score), 0) / d.subSkills.length,
    );
    const pct = Math.round(((avg - 1) / 4) * 100);
    return {
      ...d,
      score: avg,
      pct,
      status: readinessForScore(avg),
    };
  });

  const overallScore = clampScore(
    drivers.reduce((acc, d) => acc + clampScore(d.score), 0) / drivers.length,
  );

  const strongest = [...drivers].sort((a, b) => b.score - a.score)[0];
  const weakest = [...drivers].sort((a, b) => a.score - b.score)[0];

  const facets = driversBase.flatMap((d) => d.subSkills.map((s) => ({ driver: d.id, name: s.name })));

  const questions = Array.from({ length: args.questionCount }).map((_, idx) => {
    const facet = facets[idx % facets.length]!;
    const qScore = firstStart
      ? (() => {
          const pillar = driversBase.find((d) => d.id === facet.driver);
          const pillarAvg = pillar
            ? pillar.subSkills.reduce((a, s) => a + clampScore(s.score), 0) / pillar.subSkills.length
            : FIRST_START_OVERALL;
          return clampScore(pillarAvg + ((idx % 5) - 2) * 0.05);
        })()
      : clampScore(
          facet.driver === "people"
            ? 3.6 - (idx % 3) * 0.2
            : facet.driver === "action"
              ? 2.6 - (idx % 3) * 0.15
              : 3.0 - (idx % 4) * 0.15,
        );
    const timeSeconds = 90 + (idx % 4) * 22;
    return {
      id: `q${idx + 1}`,
      index: idx + 1,
      text:
        idx % 2 === 0
          ? "Tell me about a time you influenced a stakeholder without authority."
          : "Walk me through a difficult trade-off you made under time pressure.",
      driver: facet.driver,
      facet: facet.name,
      score: qScore,
      status: readinessForScore(qScore),
      timeSeconds,
      idealRangeSeconds: [180, 240] as [number, number],
      answer:
        "I started by clarifying the goal and constraints, then aligned the team on a plan. I communicated progress and adjusted based on feedback. In the end, we delivered and learned from the outcome.",
      improvements: [
        { title: "Quantify the outcome", detail: "Add one metric (time saved, revenue, cost, adoption)." },
        { title: "Use more “I” language", detail: "Call out your specific decisions and trade-offs." },
        { title: "Tighten structure", detail: "Use CAR: Context → Action → Result, 2–3 sentences each." },
      ],
    };
  });

  const spotlight = questions.reduce((min, q) => (q.score < min.score ? q : min), questions[0]!);

  const transcript: InterviewTranscriptLine[] = [
    {
      speaker: "Interviewer",
      timeSeconds: 0,
      text: "Welcome. Let’s start with a stakeholder influence example.",
    },
    {
      speaker: "Candidate",
      timeSeconds: 8,
      text: "Sure. The context was a cross-team dependency where we didn’t have direct authority…",
      flag: "Result too vague",
    },
    {
      speaker: "Interviewer",
      timeSeconds: 62,
      text: "What trade-off did you make and why?",
    },
    {
      speaker: "Candidate",
      timeSeconds: 72,
      text: "I prioritized speed over scope, but I should have been clearer on the metric impact…",
    },
  ];

  return {
    meta: {
      versionLabel: "V1.2",
      id: args.id,
      roleTitle: args.roleTitle,
      interviewName: args.interviewName,
      createdAt: new Date().toISOString(),
      durationSeconds: args.durationSeconds,
      questionCount: args.questionCount,
      hasAudio: true,
      hasVideo: true,
      pillarChips: ["Thinking", "Action", "People", "Mastery"],
      heroVariant: args.heroVariant,
    },
    overallScore,
    overallStatus: readinessForScore(overallScore),
    overallBand: bandForScore(overallScore),
    headline: firstStart
      ? `Baseline set across pillars (${overallScore.toFixed(1)}/5). Biggest lift: sharper outcomes and CAR structure.`
      : `Strongest: ${strongest.shortTitle}. Biggest opportunity: ${weakest.shortTitle}.`,
    summary: firstStart
      ? "Finishing your first mock is the hardest step. You now have a baseline to build from. Scores sit around 2.4, which is normal early on: focus next on one clear metric per story and a tight Context → Action → Result flow."
      : "Your strongest moments were when you aligned people quickly and communicated trade-offs clearly. The main gap is turning actions into measurable outcomes and using tighter CAR structure to keep answers crisp. With a few targeted rewrites, your delivery can feel more decisive and metric-driven.",
    drivers,
    narrative: {
      title: "What AI Coach saw in your session",
      subtitle: firstStart ? "First session baseline" : "Strengths, gaps, and how you showed up",
      paragraph: firstStart
        ? "This first run establishes how you structure answers today. Expect scores to cluster until you add sharper metrics and more explicit trade-offs. Small reps on CAR and outcomes will move the needle fastest."
        : "You came across as collaborative and calm under pressure, which boosted your People score. Your Action and Mastery scores dipped when results weren’t quantified or when the “why” behind choices wasn’t explicit. The biggest lift will come from adding one concrete metric and leading with a clear decision statement.",
    },
    highlightChips: {
      strongest: "Q3 · Stakeholder alignment · 3.8/5",
      biggestGap: `Q${spotlight.index} · ${spotlight.facet} · ${spotlight.score.toFixed(1)}/5`,
    },
    questions,
    transcript,
    spotlight: {
      questionId: spotlight.id,
      title: "Spotlight · highest-priority gap",
      yourAnswer: spotlight.answer,
      coachRewrite:
        "Context: We had a critical dependency that could delay launch by two weeks.\nAction: I mapped stakeholders, aligned on a single success metric, and proposed a phased rollout that reduced risk while protecting the deadline.\nResult: We shipped on time and improved adoption by 18% within the first month.",
      whyStronger: [
        "Starts with a crisp context and the stakes (why it mattered).",
        "Shows a concrete decision and your specific actions.",
        "Ends with measurable outcomes and impact.",
      ],
      delivery: {
        bodyLanguage: [
          "Sit centered and keep shoulders open; avoid looking down when recalling details.",
          "Pause before the Result. It makes the metric land.",
        ],
        grammarPhrasing: [
          "Replace “we kind of” / “basically” with direct verbs (decided, aligned, shipped).",
          "Use one sentence per CAR step to stay concise.",
        ],
        gesturesPresence: [
          "Use small hand cues for CAR (three beats) to signal structure.",
          "Keep gestures within frame for a calmer presence.",
        ],
        fillerPacing: {
          summary:
            "You speak at a good pace, but filler words spike when you describe outcomes. Slow down 10% at the end and state the metric confidently.",
          onCameraPresence:
            "Use a front light and a clean background; keep the camera at eye level for stronger presence.",
        },
      },
    },
    trainings: {
      featured: {
        id: "t_featured",
        pillar: "Action",
        difficulty: "Intermediate",
        durationMinutes: 18,
        title: "Turn actions into metrics (CAR mastery)",
        description:
          "Practice converting vague outcomes into measurable results and delivering them confidently.",
        href: "/training",
        thumbnailUrl: undefined,
      },
      more: [
        {
          id: "t1",
          pillar: "Thinking",
          difficulty: "Beginner",
          durationMinutes: 12,
          title: "Decision clarity under constraints",
          description: "Learn frameworks to explain trade-offs fast and clearly.",
          href: "/training",
        },
        {
          id: "t2",
          pillar: "People",
          difficulty: "Intermediate",
          durationMinutes: 15,
          title: "Influence without authority",
          description: "Improve stakeholder framing and alignment language.",
          href: "/training",
        },
        {
          id: "t3",
          pillar: "Mastery",
          difficulty: "Beginner",
          durationMinutes: 10,
          title: "Outcome storytelling toolkit",
          description: "A checklist for crisp results, metrics, and impact statements.",
          href: "/training",
        },
      ],
    },
  };
}

function persistReport(report: InterviewReport) {
  try {
    const existingRaw = window.localStorage.getItem(StorageKeys.reports);
    const existing = safeParseJson<Record<string, InterviewReport>>(existingRaw) ?? {};
    existing[report.meta.id] = report;
    window.localStorage.setItem(StorageKeys.reports, JSON.stringify(existing));
  } catch {
    // ignore
  }
}

function formatTimer(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export function InterviewLiveScreen() {
  const router = useRouter();
  const [roleProfile] = useLocalStorageState<RoleProfile | null>(StorageKeys.roleProfile, null);
  const name = roleProfile?.name?.trim() || "You";
  const role = roleProfile?.targetRole?.trim() || "Mock Interview";

  const [session] = useState(() => readInterviewSessionOnClient());
  const totalSeconds = session.duration;
  const [secondsLeft, setSecondsLeft] = useState(session.duration);
  const [micOn, setMicOn] = useState(!session.prefs.cancelRecording);
  const [camOn, setCamOn] = useState(
    !session.prefs.cancelRecording &&
      !session.prefs.turnOffCamera &&
      session.prefs.cameraEnabled !== false,
  );
  const [isEnding, setIsEnding] = useState(false);
  const [reportStepIdx, setReportStepIdx] = useState(0);

  const startedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (startedAtRef.current === null) startedAtRef.current = Date.now();
    const t = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - (startedAtRef.current ?? Date.now())) / 1000);
      setSecondsLeft(totalSeconds - elapsed);
    }, 250);
    return () => window.clearInterval(t);
  }, [totalSeconds]);

  const reportSteps = [
    "Parsing answers",
    "Mapping competencies",
    "Scoring strengths & gaps",
    "Generating next actions",
    "Finalizing report",
  ] as const;

  const competencies = [
    "Structured thinking",
    "Communication",
    "Ownership",
    "Problem solving",
    "Stakeholder management",
    "Execution",
    "Impact",
    "Collaboration",
  ] as const;

  useEffect(() => {
    if (!isEnding) return;

    const timers: number[] = [];
    const reportId = generateReportId();

    for (let i = 1; i <= reportSteps.length; i += 1) {
      timers.push(
        window.setTimeout(() => {
          setReportStepIdx(i);
        }, i * 900),
      );
    }

    timers.push(
      window.setTimeout(() => {
        let priorReportCount = 0;
        try {
          const existingRaw = window.localStorage.getItem(StorageKeys.reports);
          const existing = safeParseJson<Record<string, InterviewReport>>(existingRaw) ?? {};
          priorReportCount = Object.keys(existing).length;
        } catch {
          priorReportCount = 0;
        }
        /** `first_time` is only written from the first-landing “Start mock interview” CTA (see InterviewScreen). */
        const fromFirstTimeStartCta = session.prefs.sessionKind === "first_time";
        const heroVariant =
          fromFirstTimeStartCta || priorReportCount === 0 ? "first_start" : "improving";
        const report = buildMockReport({
          id: reportId,
          roleTitle: role,
          interviewName: "Mock interview",
          durationSeconds: totalSeconds,
          questionCount: 8,
          heroVariant,
        });
        persistReport(report);
        router.push(`/report/${reportId}`);
      }, reportSteps.length * 900 + 900),
    );

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [isEnding, reportSteps.length, role, router, session.prefs.sessionKind, totalSeconds]);

  return (
    <div className="min-h-screen w-full bg-[var(--app-bg)] text-[var(--app-fg)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-6 pb-28">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="truncate text-h5">
              {role} • Live interview
            </div>
            <div className="mt-1 text-body-sm text-[var(--app-muted)]">Proofdive interview room</div>
            {session.prefs.sessionKind === "selective_pillar" &&
            session.prefs.selectivePillars &&
            session.prefs.selectivePillars.length > 0 ? (
              <div className="mt-1 text-caption font-semibold leading-snug text-black/75">
                Focus:{" "}
                {session.prefs.selectivePillars
                  .map((id) => PILLAR_LABEL[id as PillarId] ?? id)
                  .join(" · ")}
              </div>
            ) : null}
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-2 text-overline text-gray-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>{formatTimer(secondsLeft)}</span>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative aspect-video w-full overflow-hidden rounded-[24px] bg-white shadow-[0_26px_80px_rgba(0,0,0,0.10)]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-caption font-semibold text-gray-800">
                    AI Interviewer
                  </div>
                  <div className="mt-2 text-overline text-[var(--app-muted)]">Video feed placeholder</div>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-overline text-white">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Speaking</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="relative aspect-video w-full overflow-hidden rounded-[24px] bg-white shadow-[0_26px_80px_rgba(0,0,0,0.10)]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-caption font-semibold text-gray-800">
                    {name}
                  </div>
                  <div className="mt-2 text-overline text-[var(--app-muted)]">Camera preview placeholder</div>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-overline text-white">
                <span className={cn("h-2 w-2 rounded-full", micOn ? "bg-emerald-400" : "bg-rose-400")} />
                <span>{micOn ? "Mic on" : "Mic off"}</span>
              </div>
            </div>

            <div className="rounded-[24px] border border-white/50 bg-white p-4 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
              <div className="text-overline text-gray-500">
                NOTES
              </div>
              <div className="mt-2 text-caption text-[var(--app-muted)]">
                Answer naturally. Use STAR/CARE structure where possible. Stay concise.
              </div>
            </div>
          </div>
        </div>

        <div className="fixed bottom-4 left-0 right-0 z-50 px-6">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-[999px] border border-white/50 bg-white/80 px-3 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.08)] backdrop-blur">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMicOn((v) => !v)}
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-full transition",
                  micOn ? "bg-white/60 hover:bg-white/80" : "bg-rose-500/90 hover:bg-rose-500",
                )}
                disabled={isEnding}
                aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
                title={micOn ? "Mute" : "Unmute"}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                  <path
                    d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19 11a7 7 0 0 1-14 0"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => setCamOn((v) => !v)}
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-full transition",
                  camOn ? "bg-white/60 hover:bg-white/80" : "bg-rose-500/90 hover:bg-rose-500",
                )}
                disabled={isEnding}
                aria-label={camOn ? "Turn camera off" : "Turn camera on"}
                title={camOn ? "Camera off" : "Camera on"}
              >
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
                  <path
                    d="M23 7 16 12l7 5V7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            <div className="hidden text-overline text-gray-500 sm:block">
              {formatTimer(secondsLeft)} remaining
            </div>

            <Button
              onClick={() => {
                setReportStepIdx(0);
                setIsEnding(true);
              }}
              disabled={isEnding}
              className="rounded-full bg-rose-500 px-6 text-white hover:bg-rose-500/90 active:bg-rose-500/80"
            >
              {isEnding ? "Ending…" : "End"}
            </Button>
          </div>
        </div>
      </div>

      {isEnding ? (
        <div className="fixed inset-0 z-[60] bg-[var(--app-bg)] text-[var(--app-fg)]">
          <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-6 py-10">
            <div className="flex items-center gap-2">
              <Logo size="xxs" />
              <span className="text-overline text-gray-500">
                REPORT
              </span>
            </div>

            <div className="mt-8">
              <div className="text-h4">
                Generating your report…
              </div>
              <div className="mt-3 max-w-2xl text-caption leading-6 text-[var(--app-muted)]">
                Mapping each answer to competencies and extracting the strongest proof points.
              </div>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-2">
              <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
                <div className="text-overline text-gray-500">
                  PROGRESS
                </div>
                <div className="mt-4 space-y-3">
                  {reportSteps.map((label, idx) => {
                    const done = reportStepIdx > idx;
                    const active = reportStepIdx === idx;
                    return (
                      <div key={label} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div
                            className={cn(
                              "truncate text-caption font-semibold",
                              done ? "text-black" : active ? "text-black" : "text-gray-500",
                            )}
                          >
                            {label}
                          </div>
                        </div>
                        <div
                          className={cn(
                            "h-2 w-2 rounded-full",
                            done
                              ? "bg-emerald-500"
                              : active
                                ? "bg-black animate-pulse"
                                : "bg-black/30",
                          )}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-[24px] border border-white/50 bg-white p-5 shadow-[0_14px_40px_rgba(0,0,0,0.06)]">
                <div className="text-overline text-gray-500">
                  COMPETENCY MAPPING
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {competencies.map((c, idx) => {
                    const filled = idx < Math.max(0, reportStepIdx - 1);
                    return (
                      <div
                        key={c}
                        className={cn(
                          "rounded-[14px] border px-3 py-3 text-overline transition",
                          filled
                            ? "border-emerald-500/30 bg-emerald-500/10 text-black"
                            : "border-white/50 bg-white/40 text-gray-600",
                        )}
                      >
                        {c}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-auto pt-10 text-overline text-gray-500">
              You’ll be redirected to home automatically.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

