"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IconButton } from "@/components/ui/icon-button";
import { LogoMark } from "@/components/ui/logo";
import { ReportGeneratingOverlay } from "@/components/interview/ReportGeneratingOverlay";
import { cn } from "@/components/cn";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { COMPETENCY_SPECS, PILLAR_LABEL, type CompetencyId, type PillarId } from "@/lib/storyboardDraft";
import type {
  InterviewReport,
  InterviewReportDriver,
  InterviewSessionKind,
  InterviewTranscriptLine,
  RoleProfile,
} from "@/lib/proofdiveTypes";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import {
  SOFTWARE_ENGINEER_DIVE4_ROLE,
  softwareEngineerDive4Stories,
} from "@/app/storyboard/crafting/softwareEngineerDive4Fixture";

type InterviewSessionPrefs = {
  cancelRecording?: boolean;
  turnOffCamera?: boolean;
  cameraEnabled?: boolean;
  sessionKind?: InterviewSessionKind;
  /** When `sessionKind` is `selective_pillar`, pillars chosen on /interview (short session). */
  selectivePillars?: ("thinking" | "action" | "people" | "mastery")[];
  /** Otherwise: which group of four the candidate chose on the competency step. */
  competencyGroup?: "core_four" | "next_relevant";
  /** The four ids that group resolved to — one per Success Driver. */
  competencyIds?: CompetencyId[];
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
  const isSoftwareEngineer = args.roleTitle.trim() === SOFTWARE_ENGINEER_DIVE4_ROLE;

  // For Software Engineer, use actual Dive 4 pillar scores from the PDF instead of placeholder data.
  const se4Stories = isSoftwareEngineer ? softwareEngineerDive4Stories() : [];
  const se4ByPillar: Record<string, number[]> = {};
  for (const s of se4Stories) {
    const pillar = s.competencyId.split("-")[0] ?? "thinking";
    if (!se4ByPillar[pillar]) se4ByPillar[pillar] = [];
    se4ByPillar[pillar].push(Number(s.assessment.score));
  }
  function pillarAvg(pillar: string, fallback: number): number {
    const scores = se4ByPillar[pillar];
    if (!scores?.length) return fallback;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }

  const driversBase: Array<
    Pick<InterviewReportDriver, "id" | "shortTitle" | "fullTitle" | "accent" | "icon" | "subSkills">
  > = firstStart
    ? buildFirstStartDriversBase()
    : isSoftwareEngineer
    ? [
        {
          id: "thinking",
          shortTitle: "Thinking",
          fullTitle: "Power of Thinking",
          accent: "teal",
          icon: "brain",
          subSkills: [
            { name: "Analytical Thinking", score: 4.0 },
            { name: "Prioritization", score: 4.5 },
            { name: "Decision-Making Agility", score: 4.0 },
          ],
        },
        {
          id: "action",
          shortTitle: "Action",
          fullTitle: "Power of Action",
          accent: "amber",
          icon: "bolt",
          subSkills: [
            { name: "Ownership & Drive", score: 4.0 },
            { name: "Initiative & Follow-through", score: clampScore(pillarAvg("action", 3.5)) },
            { name: "Embraces Change", score: clampScore(pillarAvg("action", 3.5)) },
          ],
        },
        {
          id: "people",
          shortTitle: "People",
          fullTitle: "Power of People",
          accent: "emerald",
          icon: "users",
          subSkills: [
            { name: "Communicates with Impact", score: 3.5 },
            { name: "Collaboration & Inclusion", score: clampScore(pillarAvg("people", 3.5)) },
            { name: "Grows Capability", score: clampScore(pillarAvg("people", 3.5)) },
          ],
        },
        {
          id: "mastery",
          shortTitle: "Mastery",
          fullTitle: "Power of Mastery",
          accent: "violet",
          icon: "target",
          subSkills: [
            { name: "Functional Knowledge", score: 4.0 },
            { name: "Technical Application", score: 3.5 },
            { name: "Innovation", score: clampScore(pillarAvg("mastery", 3.8)) },
          ],
        },
      ]
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

  // For Software Engineer, pull question text + answers directly from PDF stories.
  const seStories = isSoftwareEngineer && !firstStart ? softwareEngineerDive4Stories() : [];

  const questions = Array.from({ length: args.questionCount }).map((_, idx) => {
    const facet = facets[idx % facets.length]!;
    const story = seStories[idx % (seStories.length || 1)];
    const qScore = firstStart
      ? (() => {
          const pillar = driversBase.find((d) => d.id === facet.driver);
          const pillarAvg = pillar
            ? pillar.subSkills.reduce((a, s) => a + clampScore(s.score), 0) / pillar.subSkills.length
            : FIRST_START_OVERALL;
          return clampScore(pillarAvg + ((idx % 5) - 2) * 0.05);
        })()
      : isSoftwareEngineer && story
      ? clampScore(Number(story.assessment.score))
      : clampScore(
          facet.driver === "people"
            ? 3.6 - (idx % 3) * 0.2
            : facet.driver === "action"
              ? 2.6 - (idx % 3) * 0.15
              : 3.0 - (idx % 4) * 0.15,
        );
    const timeSeconds = 90 + (idx % 4) * 22;
    const questionText =
      isSoftwareEngineer && story
        ? story.interviewQuestion
        : idx % 2 === 0
          ? "Tell me about a time you influenced a stakeholder without authority."
          : "Walk me through a difficult trade-off you made under time pressure.";
    const answerText =
      isSoftwareEngineer && story
        ? [story.car.context, story.car.action, story.car.result].join(" ")
        : "I started by clarifying the goal and constraints, then aligned the team on a plan. I communicated progress and adjusted based on feedback. In the end, we delivered and learned from the outcome.";
    return {
      id: `q${idx + 1}`,
      index: idx + 1,
      text: questionText,
      driver: facet.driver,
      facet: facet.name,
      score: qScore,
      status: readinessForScore(qScore),
      timeSeconds,
      idealRangeSeconds: [180, 240] as [number, number],
      answer: answerText,
      improvements:
        isSoftwareEngineer && story
          ? [
              { title: "Missing strengths", detail: story.assessment.missingStrengths.slice(0, 160) },
              { title: "Development tip", detail: story.assessment.development.slice(0, 160) },
              { title: "Tighten structure", detail: "Use CAR: Context \u2192 Action \u2192 Result, 2\u20133 sentences each." },
            ]
          : [
              { title: "Quantify the outcome", detail: "Add one metric (time saved, revenue, cost, adoption)." },
              { title: "Use more \u201cI\u201d language", detail: "Call out your specific decisions and trade-offs." },
              { title: "Tighten structure", detail: "Use CAR: Context \u2192 Action \u2192 Result, 2\u20133 sentences each." },
            ],
    };
  });

  const spotlight = questions.reduce((min, q) => (q.score < min.score ? q : min), questions[0]!);

  const transcript: InterviewTranscriptLine[] =
    isSoftwareEngineer && seStories[0]
      ? [
          {
            speaker: "Interviewer",
            timeSeconds: 0,
            text: seStories[0].interviewQuestion,
          },
          {
            speaker: "Candidate",
            timeSeconds: 8,
            text: seStories[0].car.context.slice(0, 160) + "…",
          },
          {
            speaker: "Interviewer",
            timeSeconds: 62,
            text: "What trade-off did you make and why?",
          },
          {
            speaker: "Candidate",
            timeSeconds: 72,
            text: seStories[0].car.action.slice(0, 160) + "…",
          },
        ]
      : [
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
      ? `Baseline set at ${overallScore.toFixed(1)} — ${weakest.shortTitle} is your clearest area to strengthen.`
      : `Strong in ${strongest.shortTitle} — ${weakest.shortTitle} is your clearest area to strengthen.`,
    summary: firstStart
      ? `Your answers were easy to follow but stopped short of a result: you described what happened, not what you specifically decided and what it changed. Where you're losing points is ${weakest.shortTitle}. Add one metric per answer and lead with the decision — that is where the next half-point is.`
      : `Your ${strongest.shortTitle} answers showed real evidence, with clear alignment and trade-offs stated out loud. Where you're losing points is ${weakest.shortTitle} — your answers described what happened but not what you specifically decided and why. Fix that and your score moves up a band.`,
    drivers,
    narrative: {
      title: "What the Consultant saw in your session",
      subtitle: "Summary of strengths, gaps, and how you showed up.",
      paragraph: firstStart
        ? "You structure answers clearly enough to follow, but they stop before the result: outcomes are described rather than measured, and decisions are attributed to the team rather than to you. Expect scores to cluster until every answer carries one metric and one explicit trade-off."
        : `You came across as collaborative and calm under pressure, which is why ${strongest.shortTitle} scored highest. ${weakest.shortTitle} dipped wherever a result wasn’t quantified or the reasoning behind a choice wasn’t stated. The biggest lift is one concrete metric and a clear decision statement in every answer.`,
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

/* ------------------------------------------------------------------------
   THE TURN CLOCK

   A real interview has two clocks and only one of them is the session: the
   other is "how long have I been on this answer", and it is the one a
   candidate actually feels. The room runs it explicitly — the interviewer
   asks, you get five minutes, and if you are still going at five you get one
   more minute of grace before the next question rather than being cut off
   mid-sentence. The grace minute is deliberately visible and red: an
   unannounced overrun is what makes practice feel unfair.
   ------------------------------------------------------------------------ */

/** Time the interviewer spends asking before your clock starts. */
const ASK_SECONDS = 5;
/** The answer window a candidate is told they have. */
const ANSWER_SECONDS = 5 * 60;
/** One extra minute after it, flagged, before the next question. */
const GRACE_SECONDS = 60;
/** The answer clock turns amber for its last minute. */
const WARN_AT_SECONDS = 60;

/* The room's palette, as scoped variable overrides. Declared once and worn by
   both the room and its dialog: the dialog renders through a portal at body
   level, so it cannot inherit the room's scope and would otherwise arrive in
   the app's ambient theme — a white card over a dark call. */
const ROOM_PALETTE =
  "[--background:#0A1013] [--card:#121C21] [--popover:#16232A] [--surface:#18252B] " +
  "[--muted:#1C2C33] [--border:#273B43] [--divider-soft:#22333A] " +
  "[--foreground:#E8EFF1] [--text-primary:#E8EFF1] [--card-foreground:#E8EFF1] " +
  "[--popover-foreground:#E8EFF1] " +
  "[--text-secondary:#94A6AC] [--muted-foreground:#94A6AC] " +
  "[--primary:#22B2CC] [--primary-foreground:#03171C] [--ring:#22B2CC] " +
  "[--destructive:#F0736A] [--destructive-foreground:#2A0B08] " +
  "[--scoring-green:#34C76A] [--scoring-yellow:#E9A13B] [--scoring-red:#F0736A] " +
  "[--logo-ink:#CFE3E8]";

type Turn = "asking" | "answering" | "grace" | "done";

function turnSpan(turn: Turn): number {
  if (turn === "asking") return ASK_SECONDS;
  if (turn === "answering") return ANSWER_SECONDS;
  return GRACE_SECONDS;
}

/** One question per competency — the same twelve the framework defines. */
const QUESTION_BY_COMPETENCY: Record<CompetencyId, string> = {
  "thinking-analytical":
    "Tell me about a time you were handed a messy problem. How did you work out what was actually causing it?",
  "thinking-prioritization":
    "Describe a time everything was urgent. How did you decide what to do first, and what did you let slip?",
  "thinking-decision":
    "Tell me about a decision you had to make without enough information. What did you weigh, and what happened?",
  "action-ownership":
    "Tell me about something you owned end to end. What went wrong along the way, and what did you do about it?",
  "action-initiative":
    "Describe something you started that nobody asked you to start. What made you act, and what came of it?",
  "action-change":
    "Tell me about a time priorities changed underneath you. How did you adjust, and what did it cost?",
  "people-influence":
    "Describe a time you had to bring someone round to a different view. How did you make the case?",
  "people-collaboration":
    "Tell me about working with a team that was not pulling in the same direction. What did you change?",
  "people-capability":
    "Describe a time you helped someone get better at their work. What did you do differently for them?",
  "mastery-functional":
    "Tell me about a time your depth in the subject changed the outcome. What did you know that others did not?",
  "mastery-execution":
    "Describe a piece of work you are proud of the craft in. What made the execution good rather than adequate?",
  "mastery-innovation":
    "Tell me about something you made meaningfully better. What was wrong with it before, and how do you know it improved?",
};

/** The four competencies this attempt covers, in Success Driver order. */
function questionsForSession(prefs: InterviewSessionPrefs): {
  competencyId: CompetencyId;
  title: string;
  pillar: PillarId;
  question: string;
}[] {
  let ids: CompetencyId[] = [];

  if (prefs.competencyIds?.length) {
    ids = prefs.competencyIds.filter((id) => QUESTION_BY_COMPETENCY[id]);
  } else if (prefs.selectivePillars?.length) {
    // A short session chose pillars, not competencies: take each pillar's first.
    ids = prefs.selectivePillars
      .map((pillar) => COMPETENCY_SPECS.find((spec) => spec.pillar === pillar)?.id)
      .filter((id): id is CompetencyId => Boolean(id));
  }

  if (ids.length === 0) {
    ids = (["thinking", "action", "people", "mastery"] as PillarId[])
      .map((pillar) => COMPETENCY_SPECS.find((spec) => spec.pillar === pillar)?.id)
      .filter((id): id is CompetencyId => Boolean(id));
  }

  return ids.map((id) => {
    const spec = COMPETENCY_SPECS.find((s) => s.id === id);
    return {
      competencyId: id,
      title: spec?.title ?? id,
      pillar: spec?.pillar ?? "thinking",
      question: QUESTION_BY_COMPETENCY[id],
    };
  });
}

export function InterviewLiveScreen() {
  const router = useRouter();
  const [roleProfile] = useLocalStorageState<RoleProfile | null>(StorageKeys.roleProfile, null);
  const name = roleProfile?.name?.trim() || "You";
  const role = roleProfile?.targetRole?.trim() || "Mock Interview";

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
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
  const [confirmEndOpen, setConfirmEndOpen] = useState(false);
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

  /* ---- the turn clock ------------------------------------------------- */

  const questions = useMemo(() => questionsForSession(session.prefs), [session.prefs]);
  const [qIndex, setQIndex] = useState(0);
  const [turn, setTurn] = useState<Turn>("asking");
  /* The turn and its deadline are set together, in the callback that ends the
     previous turn — never in an effect. `now` is the only thing that ticks,
     and the remaining seconds are derived from the two at render. */
  const [turnEndsAt, setTurnEndsAt] = useState(() => Date.now() + ASK_SECONDS * 1000);
  const [now, setNow] = useState(0);

  const current = questions[Math.min(qIndex, questions.length - 1)]!;
  const isLastQuestion = qIndex >= questions.length - 1;

  const startTurn = useCallback((next: Turn) => {
    setTurn(next);
    setTurnEndsAt(Date.now() + turnSpan(next) * 1000);
  }, []);

  const nextQuestion = useCallback(() => {
    if (qIndex >= questions.length - 1) {
      setTurn("done");
      return;
    }
    setQIndex(qIndex + 1);
    startTurn("asking");
  }, [qIndex, questions.length, startTurn]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(t);
  }, []);

  /* One timeout per turn: it is armed off the deadline the previous turn set,
     so the hand-off happens exactly once and cannot drift from the display. */
  useEffect(() => {
    if (isEnding || turn === "done") return;

    const advance = window.setTimeout(
      () => {
        if (turn === "asking") startTurn("answering");
        else if (turn === "answering") startTurn("grace");
        else nextQuestion();
      },
      Math.max(0, turnEndsAt - Date.now()),
    );

    return () => window.clearTimeout(advance);
  }, [turn, turnEndsAt, isEnding, startTurn, nextQuestion]);

  /* Before the first tick the full span is the honest answer, and it is what
     the server renders too — no clock in the markup that hydration can fight. */
  const turnLeft =
    now > 0 ? Math.max(0, Math.ceil((turnEndsAt - now) / 1000)) : turnSpan(turn);

  /* Answering state, as the ring and the number read it. `grace` is its own
     level rather than "answering, but negative": the candidate was promised
     five minutes and is now visibly into borrowed time. */
  const clockLevel: "calm" | "warn" | "grace" =
    turn === "grace" ? "grace" : turn === "answering" && turnLeft <= WARN_AT_SECONDS ? "warn" : "calm";

  const answerPct =
    turn === "answering"
      ? (turnLeft / ANSWER_SECONDS) * 100
      : turn === "grace"
        ? (turnLeft / GRACE_SECONDS) * 100
        : 100;

  /* Named the way the onboarding waits name their steps — a sentence about
     the work, not a label — because the overlay now renders them in the same
     AiProgressStatus list. Each one is a stage of building the report. */
  const reportSteps = [
    "Reading your answers",
    "Mapping answers to competencies",
    "Scoring strengths and gaps",
    "Writing your next actions",
    "Assembling the report",
  ] as const;
  /** Demo pacing — full progress sequence lasts at least 15s. */
  const REPORT_STEP_MS = 3_000;

  useEffect(() => {
    if (!isEnding) return;

    const timers: number[] = [];
    const reportId = generateReportId();

    for (let i = 1; i <= reportSteps.length; i += 1) {
      timers.push(
        window.setTimeout(() => {
          setReportStepIdx(i);
        }, i * REPORT_STEP_MS),
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
      }, reportSteps.length * REPORT_STEP_MS),
    );

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [isEnding, reportSteps.length, role, router, session.prefs.sessionKind, totalSeconds]);

  const micLabel = micOn ? "Mic on" : "Mic off";

  /* Everything in this room comes from localStorage — the session prefs, the
     chosen competencies, the candidate's name — so the server has no honest
     version of it to render. `useSyncExternalStore` gives a false server
     snapshot and a true client one with no effect and no setState, which is
     the same trick `lib/theme.ts` uses; the alternative was a screenful of
     text that differs between the two renders. */
  if (!mounted) {
    return <div className="min-h-dvh w-full bg-[#0A1013]" aria-busy="true" />;
  }

  return (
    /* THE PLATE DECIDES. A call room is its own world — Meet, Zoom and every
       other one is dark whatever the OS is doing, because a dark room is what
       makes a lit face and a lit stage read. So this screen pins the product's
       DARK palette in both themes rather than following the toggle: the tokens
       below are the same values `.dark` defines, so Button, IconButton and the
       type need no knowledge of where they are. */
    <div
      className={cn("flex h-dvh w-full flex-col overflow-hidden bg-background text-foreground", ROOM_PALETTE)}
    >
      {/* ---- room header -------------------------------------------------- */}
      <header className="flex shrink-0 items-start justify-between gap-4 px-5 py-3.5">
        <div className="min-w-0">
          <p className="truncate text-body-sm font-semibold text-text-primary">
            {role} <span className="text-text-secondary">·</span> Live interview
          </p>
          {session.prefs.sessionKind === "selective_pillar" &&
          session.prefs.selectivePillars?.length ? (
            <p className="mt-0.5 truncate text-caption text-text-secondary">
              Focus:{" "}
              {session.prefs.selectivePillars
                .map((id) => PILLAR_LABEL[id as PillarId] ?? id)
                .join(" · ")}
            </p>
          ) : (
            <p className="mt-0.5 truncate text-caption text-text-secondary">
              {session.prefs.competencyGroup === "next_relevant"
                ? "Next most relevant"
                : "Your Core Four"}
              : {questions.map((q) => q.title).join(" · ")}
            </p>
          )}
        </div>

        {/* The session clock, deliberately the quieter of the two: it is the
            room's clock, not the one you are answering against. */}
        <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1.5 text-overline tabular-nums text-text-secondary">
          <span className="size-1.5 rounded-full bg-scoring-green" aria-hidden />
          <span>{formatTimer(secondsLeft)} left</span>
        </div>
      </header>

      {/* ---- stage --------------------------------------------------------- */}
      <main className="relative min-h-0 flex-1 px-5">
        <div className="relative h-full w-full overflow-hidden rounded-[20px] border border-border bg-[radial-gradient(120%_90%_at_50%_0%,#16262E_0%,#0D171C_55%,#0A1013_100%)]">
          {/* The interviewer. No photoreal avatar and no orb: the brand mark
              on a lit plate, with the glow breathing only while it speaks, so
              "who is talking" is legible at a glance and nothing is pretending
              to be a face. */}
          {/* Bottom padding on small screens so the self view cannot land on
              top of the interviewer's name — at 375px the picture-in-picture
              is a third of the stage. */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 pb-24 sm:pb-0">
            <div className="relative grid place-items-center">
              <span
                aria-hidden
                className={cn(
                  "absolute size-[260px] rounded-full blur-[56px] transition-opacity duration-700",
                  turn === "asking"
                    ? "bg-primary/40 motion-safe:animate-pulse"
                    : "bg-primary/12",
                )}
              />
              <span className="relative grid size-[176px] place-items-center rounded-full border border-white/10 bg-white/[0.05] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] backdrop-blur-sm">
                <LogoMark className="size-[76px] text-primary" />
              </span>
            </div>

            <div className="text-center">
              <p className="text-body-sm font-semibold text-text-primary">
                ProofDive Interviewer
              </p>
              {/* Not a second copy of the speaker chip — this line says what
                  is expected of the candidate right now. */}
              <p className="mt-1 text-caption text-text-secondary">
                {turn === "asking"
                  ? "Asking your question…"
                  : turn === "grace"
                    ? "Bring your answer to a close"
                    : turn === "done"
                      ? "That was the last question"
                      : "Your turn — answer when you are ready"}
              </p>
            </div>
          </div>

          {/* State chip, bottom-left, the way a call names the active speaker. */}
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-overline text-white backdrop-blur">
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full",
                turn === "asking" ? "bg-scoring-green motion-safe:animate-pulse" : "bg-white/40",
              )}
            />
            <span>{turn === "asking" ? "Speaking" : "Listening"}</span>
          </div>

          {/* Self view, picture-in-picture, where every call puts it. */}
          <div className="absolute bottom-3 right-3 w-[128px] overflow-hidden rounded-xl border border-white/10 bg-[#0E1A20] shadow-[0_10px_30px_-12px_rgba(0,0,0,0.9)] sm:w-[216px]">
            <div className="relative flex aspect-video items-center justify-center">
              {camOn ? (
                <p className="px-3 text-center text-overline text-text-secondary">
                  Camera preview
                </p>
              ) : (
                <span className="grid size-9 place-items-center rounded-full bg-white/[0.06] text-caption font-semibold text-text-primary sm:size-11 sm:text-body-sm">
                  {name.trim().charAt(0).toUpperCase() || "Y"}
                </span>
              )}
              <div className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-0.5 text-[10px] leading-4 text-white">
                <span
                  aria-hidden
                  className={cn(
                    "size-1.5 rounded-full",
                    micOn ? "bg-scoring-green" : "bg-scoring-red",
                  )}
                />
                <span className="max-w-[86px] truncate">{name}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ---- the question, and the clock you are answering against --------- */}
      <section
        className="shrink-0 px-5 pt-4"
        aria-live="polite"
        aria-atomic="true"
      >
        <div
          className={cn(
            "flex items-center gap-4 rounded-[18px] border bg-card/80 px-4 py-3.5 transition-colors duration-500",
            clockLevel === "grace"
              ? "border-scoring-red/60 bg-scoring-red/[0.08]"
              : clockLevel === "warn"
                ? "border-scoring-yellow/50"
                : "border-border",
          )}
        >
          {/* A depleting ring rather than a bare number: the shape says how
              much is left before the digits have been read. */}
          <div
            className={cn(
              "relative grid size-[58px] shrink-0 place-items-center rounded-full",
              clockLevel === "grace" && "motion-safe:animate-pulse",
            )}
            style={{
              background: `conic-gradient(var(--clock) ${answerPct}%, color-mix(in srgb, var(--clock) 16%, transparent) 0)`,
              ["--clock" as string]:
                clockLevel === "grace"
                  ? "var(--scoring-red)"
                  : clockLevel === "warn"
                    ? "var(--scoring-yellow)"
                    : "var(--primary)",
            }}
            role="timer"
            aria-label={
              turn === "asking"
                ? "The interviewer is asking the question"
                : turn === "done"
                  ? "All questions asked"
                  : `${formatTimer(turnLeft)} ${turn === "grace" ? "of extra time" : "left to answer"}`
            }
          >
            <span className="grid size-[48px] place-items-center rounded-full bg-card">
              {turn === "asking" ? (
                <span className="size-2 rounded-full bg-primary motion-safe:animate-pulse" aria-hidden />
              ) : turn === "done" ? (
                <span className="text-caption font-semibold text-text-secondary">—</span>
              ) : (
                <span
                  className={cn(
                    "font-gilroy text-[15px] font-semibold tabular-nums",
                    clockLevel === "grace"
                      ? "text-scoring-red"
                      : clockLevel === "warn"
                        ? "text-scoring-yellow"
                        : "text-text-primary",
                  )}
                >
                  {formatTimer(turnLeft)}
                </span>
              )}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-overline text-text-secondary">
                Question {Math.min(qIndex + 1, questions.length)} of {questions.length}
              </span>
              <span className="text-overline text-text-secondary/50" aria-hidden>
                ·
              </span>
              <span className="text-overline text-primary">{current.title}</span>
              {turn === "grace" ? (
                <span className="rounded-full bg-scoring-red/20 px-2 py-0.5 text-overline font-medium text-scoring-red">
                  Extra time — next question in {formatTimer(turnLeft)}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-body-sm leading-6 text-text-primary">
              {turn === "done"
                ? "That is every question for this attempt. End the session when you are ready and your report will be generated."
                : current.question}
            </p>
          </div>
        </div>

        {/* The promise, stated once, so the clock never reads as a punishment. */}
        <p className="mt-2 px-1 text-overline text-text-secondary">
          {turn === "done"
            ? "Nothing more is being timed."
            : `You get ${ANSWER_SECONDS / 60} minutes per answer, then one extra minute before the next question.`}
        </p>
      </section>

      {/* ---- controls ------------------------------------------------------ */}
      <footer className="shrink-0 px-5 py-4">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 rounded-full border border-border bg-card/80 px-3 py-2.5 backdrop-blur">
          <div className="flex items-center gap-2">
            <IconButton
              variant="ghost"
              size="xl"
              onClick={() => setMicOn((v) => !v)}
              className={cn(
                micOn
                  ? "bg-white/[0.06] text-text-primary hover:bg-white/[0.12] hover:text-text-primary"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground",
              )}
              disabled={isEnding}
              aria-label={micOn ? "Mute microphone" : "Unmute microphone"}
              title={micLabel}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
                <path
                  d="M12 19v3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </IconButton>

            <IconButton
              variant="ghost"
              size="xl"
              onClick={() => setCamOn((v) => !v)}
              className={cn(
                camOn
                  ? "bg-white/[0.06] text-text-primary hover:bg-white/[0.12] hover:text-text-primary"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:text-destructive-foreground",
              )}
              disabled={isEnding}
              aria-label={camOn ? "Turn camera off" : "Turn camera on"}
              title={camOn ? "Camera off" : "Camera on"}
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
            </IconButton>
          </div>

          {/* Nobody should have to sit out five minutes they do not need. The
              clock is a ceiling, not a quota. */}
          {turn === "answering" || turn === "grace" ? (
            <Button
              type="button"
              variant="outline"
              onClick={nextQuestion}
              disabled={isEnding}
              className="rounded-full border-border bg-transparent px-5 text-text-primary hover:bg-white/[0.06] hover:text-text-primary"
            >
              {isLastQuestion ? "Finish answering" : "Next question"}
            </Button>
          ) : (
            <span className="hidden text-overline tabular-nums text-text-secondary sm:block">
              {formatTimer(secondsLeft)} remaining
            </span>
          )}

          <Button
            variant="destructive"
            onClick={() => setConfirmEndOpen(true)}
            disabled={isEnding}
            className="rounded-full px-6"
          >
            {isEnding ? "Ending…" : "End"}
          </Button>
        </div>
      </footer>

      {/* One click on "End" used to close a 30-minute session and start the
          report with no way back. Ending is the one irreversible action on
          this screen, so it asks — and says what happens next and how long it
          takes. */}
      <Dialog open={confirmEndOpen} onOpenChange={setConfirmEndOpen}>
        {/* `text-foreground` is load-bearing here: the title and the outline
            button set no colour of their own, so without it they inherit a
            colour already computed on <body> in the app's ambient theme and
            arrive as near-black text on the room's dark card. Naming it here
            makes the colour resolve inside the pinned scope. */}
        <DialogContent
          className={cn("border-border bg-card text-foreground sm:max-w-md", ROOM_PALETTE)}
        >
          <DialogHeader>
            <DialogTitle>End the session?</DialogTitle>
            <DialogDescription>
              You have {formatTimer(secondsLeft)} left. Ending now closes the interview and generates
              your report — that takes about{" "}
              {Math.round((reportSteps.length * REPORT_STEP_MS) / 1000)} seconds.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmEndOpen(false)}>
              Keep going
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setConfirmEndOpen(false);
                setReportStepIdx(0);
                setIsEnding(true);
              }}
            >
              End &amp; generate report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {isEnding ? (
        <ReportGeneratingOverlay
          stepIdx={reportStepIdx}
          steps={reportSteps}
          stepMs={REPORT_STEP_MS}
          roleTitle={role}
        />
      ) : null}
    </div>
  );
}

