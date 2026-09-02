/**
 * Demo focus: the app only intakes experience against 2 competencies, then
 * crafts a storyboard and mock report for those two. Full 12-spec catalog
 * remains in storage for compatibility; UI/scoring filter to this set.
 */

import {
  COMPETENCY_SPECS,
  type CompetencyId,
  type PillarId,
  type StoryboardDive,
  emptyCompetencySection,
  recomputeDiveScores,
  strengthScore,
} from "@/lib/storyboardDraft";
import type { Experience, RoleProfile } from "@/lib/proofdiveTypes";
import { clampToWordCap, INTRO_WORD_HARD_CAP } from "@/lib/storyboardGuardrails";

/** Default demo pair when the profile has no Core selection yet. */
export const DEMO_FOCUS_COMPETENCY_IDS: readonly CompetencyId[] = [
  "thinking-analytical",
  "action-ownership",
] as const;

export const DEMO_FOCUS_COUNT = DEMO_FOCUS_COMPETENCY_IDS.length;

/** Consultant questions asked per competency in the demo (short of the framework's 5). */
export const DEMO_CONSULTANT_QUESTION_COUNT = 2;

/** Resolve the 2 competencies this demo run should use. */
export function resolveFocusCompetencies(
  selected?: readonly CompetencyId[] | null,
): CompetencyId[] {
  const cleaned = (selected ?? []).filter((id) =>
    COMPETENCY_SPECS.some((s) => s.id === id),
  );
  if (cleaned.length >= DEMO_FOCUS_COUNT) {
    return cleaned.slice(0, DEMO_FOCUS_COUNT);
  }
  const out = [...cleaned];
  for (const id of DEMO_FOCUS_COMPETENCY_IDS) {
    if (out.length >= DEMO_FOCUS_COUNT) break;
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

export function demoCompetencyQueue(profile: RoleProfile | null | undefined): CompetencyId[] {
  const expanded = (profile?.storyboardFocusCompetencies ?? []).filter((id) =>
    COMPETENCY_SPECS.some((s) => s.id === id),
  );
  if (expanded.length >= DEMO_FOCUS_COUNT) {
    return expanded;
  }
  return resolveFocusCompetencies(profile?.coreFourCompetencies);
}

/** Competencies that already have a completed experience for this role. */
export function completedCompetencyIds(
  roleExperiences: readonly Experience[],
): CompetencyId[] {
  const out: CompetencyId[] = [];
  for (const exp of roleExperiences) {
    if (!exp.competencyId || !isDemoExperienceComplete(exp)) continue;
    if (!out.includes(exp.competencyId)) out.push(exp.competencyId);
  }
  return out;
}

export function focusCompetencySpecs(ids: readonly CompetencyId[]) {
  const set = new Set(ids);
  return COMPETENCY_SPECS.filter((s) => set.has(s.id));
}

export function focusCompetencyIndexes(ids: readonly CompetencyId[]): number[] {
  const set = new Set(ids);
  return COMPETENCY_SPECS.map((s, i) => (set.has(s.id) ? i : -1)).filter(
    (i) => i >= 0,
  );
}

export function competencySpec(id: CompetencyId) {
  return COMPETENCY_SPECS.find((s) => s.id === id) ?? COMPETENCY_SPECS[0]!;
}

export function pillarForCompetency(id: CompetencyId): PillarId {
  return competencySpec(id).pillar;
}

/** Mean strength across the focus competencies only (intro excluded). */
export function overallFocusCompetencyStrength(
  d: StoryboardDive,
  ids: readonly CompetencyId[],
) {
  const idxs = focusCompetencyIndexes(ids);
  if (!idxs.length) return 0;
  const scores = idxs.map((i) =>
    Number(d.competencies[i]?.score ?? strengthScore(d.competencies[i]?.car ?? { context: "", action: "", result: "" })),
  );
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(avg * 10) / 10;
}

export function pillarFocusStrength(
  d: StoryboardDive,
  pillar: PillarId,
  ids: readonly CompetencyId[],
) {
  const idxs = focusCompetencyIndexes(ids).filter(
    (i) => COMPETENCY_SPECS[i]?.pillar === pillar,
  );
  if (!idxs.length) return 0;
  const scores = idxs.map((i) =>
    Number(d.competencies[i]?.score ?? strengthScore(d.competencies[i]?.car ?? { context: "", action: "", result: "" })),
  );
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(avg * 10) / 10;
}

export function isCarComplete(exp: Experience | null | undefined): boolean {
  if (!exp?.car) return false;
  return Boolean(
    exp.car.context?.trim() && exp.car.action?.trim() && exp.car.result?.trim(),
  );
}

export function isDemoExperienceComplete(exp: Experience | null | undefined): boolean {
  if (!exp?.competencyId || !exp.title?.trim() || !isCarComplete(exp)) return false;
  return (exp.consultantAnswers?.length ?? 0) >= DEMO_CONSULTANT_QUESTION_COUNT;
}

/** Next focus competency that still needs a completed experience for this role. */
export function nextOpenDemoCompetency(
  queue: readonly CompetencyId[],
  roleExperiences: readonly Experience[],
): CompetencyId | null {
  for (const id of queue) {
    const existing = roleExperiences.find((e) => e.competencyId === id);
    if (!existing || !isDemoExperienceComplete(existing)) return id;
  }
  return null;
}

export function experienceForCompetency(
  roleExperiences: readonly Experience[],
  competencyId: CompetencyId,
): Experience | undefined {
  return roleExperiences.find((e) => e.competencyId === competencyId);
}

/**
 * Why each competency matters to an interviewer, and what a strong answer
 * tends to contain — one line each, in plain words. Shown beneath the
 * questions so the candidate always knows WHY they are being asked and what
 * good looks like (the client's core requirement for the Storyboard). These
 * are the same signals the Strength score is later judged against, so the
 * candidate is never scored on criteria they were not shown.
 */
export const COMPETENCY_GUIDANCE: Record<CompetencyId, { why: string; good: string }> = {
  "thinking-analytical": {
    why: "Interviewers look for how you break a messy problem down and reason to a cause.",
    good: "Name the steps or criteria you used, not just the conclusion you reached.",
  },
  "thinking-prioritization": {
    why: "Interviewers look for how you decide what matters most when everything is urgent.",
    good: "Say what you chose to delay or drop, and the reason it was safe to.",
  },
  "thinking-decision": {
    why: "Interviewers look for how you decide with incomplete information and stand behind it.",
    good: "Name the options you weighed and what made the call right at the time.",
  },
  "action-ownership": {
    why: "Interviewers look for what you drove yourself, without waiting to be asked.",
    good: "Use “I”. Name the obstacle you pushed through and how you knew it was done.",
  },
  "action-initiative": {
    why: "Interviewers look for what you started that nobody had asked for, and whether you finished it.",
    good: "Say what you began, why it mattered, and how you kept it moving.",
  },
  "action-change": {
    why: "Interviewers look for how you handle change — diagnosing it, testing it, bringing people along.",
    good: "Name what you changed, how you checked it worked, and who you had to convince.",
  },
  "people-influence": {
    why: "Interviewers look for how you land a message with people who don’t report to you.",
    good: "Say who you needed to move, how you adapted, and what shifted their view.",
  },
  "people-collaboration": {
    why: "Interviewers look for how you get to a better outcome with others, including disagreement.",
    good: "Name whose input changed the result and how you handled friction.",
  },
  "people-capability": {
    why: "Interviewers look for how you make the people around you better.",
    good: "Say who you grew, how, and what they did differently afterwards.",
  },
  "mastery-functional": {
    why: "Interviewers look for the depth of knowledge your work actually rests on.",
    good: "Name the concept, method or standard involved and how you knew you applied it soundly.",
  },
  "mastery-execution": {
    why: "Interviewers look for how you apply your craft under real constraints, and check quality.",
    good: "Name the method or tool, how you verified the result, and what you’d tighten next time.",
  },
  "mastery-innovation": {
    why: "Interviewers look for improvements that outlast the one problem you fixed.",
    good: "Say how you diagnosed the gap, validated the change, and made it repeatable.",
  },
};

/** What each CAR field is for, in the candidate's terms. Shown as the question's subtext. */
export const CAR_FIELD_GUIDANCE = {
  context: {
    question: "What was the situation?",
    why: "Enough background that an interviewer understands why it mattered — the goal, the constraint, or what was at stake.",
    shape: "Two or three sentences: the setting, the challenge, the constraint.",
  },
  action: {
    question: "What did you personally do?",
    why: "This is what the competency is scored on. Focus on your own decisions and moves, not the team’s.",
    shape: "Your decisions and the steps you took, in the order you took them.",
  },
  result: {
    question: "What changed because of what you did?",
    why: "Outcomes make the story credible. A number is best; an observable change is fine — never invent a metric.",
    shape: "Before → after, a number if you have one, or the change people could see.",
  },
} as const;

/** One line the first time the consultant step appears, so the follow-ups read as finite and purposeful. */
export const CONSULTANT_INTRO =
  "Two short follow-ups to make this defensible — your answers are quoted back as evidence.";

/** Consultant question copy keyed by competency (framework-inspired, demo-short). */
export function consultantQuestionsFor(competencyId: CompetencyId): string[] {
  const byId: Partial<Record<CompetencyId, string[]>> = {
    "thinking-analytical": [
      "What steps, criteria, or reasoning did you use to analyze the situation?",
      "What trade-offs or risks did you weigh before settling on your approach?",
    ],
    "thinking-prioritization": [
      "What did you decide to delay, reduce, or deprioritize — and why?",
      "How did you know those priorities were right for the goal and constraints?",
    ],
    "thinking-decision": [
      "What options did you consider before deciding, and what made the final call right?",
      "What would have gone wrong if you had waited or chosen differently?",
    ],
    "action-ownership": [
      "What did you personally own without being asked, and what obstacle did you push through?",
      "How did you know the outcome was good enough to ship or hand off?",
    ],
    "action-initiative": [
      "What did you start that others weren’t already doing, and why did it matter?",
      "How did you keep follow-through going when momentum dipped?",
    ],
    "action-change": [
      "How did you diagnose what needed to change, and how did you test whether it worked?",
      "Who resisted the change, and how did you bring them along?",
    ],
    "people-influence": [
      "How did you adapt your message for the people you needed to influence?",
      "What resistance did you face, and what shifted their position?",
    ],
    "people-collaboration": [
      "Whose perspective changed the outcome, and how did you make sure it was included?",
      "How did you handle disagreement without losing the goal?",
    ],
    "people-capability": [
      "Who did you grow or enable through this work, and how?",
      "What did they do differently afterward because of your support?",
    ],
    "mastery-functional": [
      "Which concept, tool, method, or standard did this experience depend on — and why?",
      "How did you know your application of that knowledge was sound?",
    ],
    "mastery-execution": [
      "What method, tool, or process did you use, and how did you check quality?",
      "What would you tighten if you ran this again under stricter constraints?",
    ],
    "mastery-innovation": [
      "How did you diagnose what needed to improve, and how did you validate the change?",
      "What made this improvement repeatable beyond a one-off fix?",
    ],
  };
  const fallback = [
    "What part of this experience was personally owned by you, and why does it matter for your target role?",
    "What trade-offs, constraints, or competing needs did you consider?",
  ];
  return (byId[competencyId] ?? fallback).slice(0, DEMO_CONSULTANT_QUESTION_COUNT);
}

/**
 * Apply experience CAR onto competency sections, and seed Introduction text
 * from the flow-level about-you answer (TMAY). Does not invent non-evidence CARs.
 * Does not merge consultant answers into CAR examples.
 */
export function seedDiveFromDemoExperiences(
  dive: StoryboardDive,
  roleExperiences: readonly Experience[],
  focusIds: readonly CompetencyId[],
  aboutYouAnswer?: string | null,
): StoryboardDive {
  const next: StoryboardDive = {
    ...dive,
    intro: { ...dive.intro },
    competencies: dive.competencies.map((s) => ({
      ...s,
      car: { ...s.car },
      matchedSignals: [...s.matchedSignals],
      missingNextLevelSignals: [...s.missingNextLevelSignals],
      secondaryCompetencies: [...(s.secondaryCompetencies ?? [])],
    })),
  };

  for (let i = 0; i < COMPETENCY_SPECS.length; i++) {
    const spec = COMPETENCY_SPECS[i]!;
    if (!focusIds.includes(spec.id)) {
      // Guardrail: do not invent filler for competencies without user evidence.
      next.competencies[i] = emptyCompetencySection();
      continue;
    }
    const exp = experienceForCompetency(roleExperiences, spec.id);
    if (!exp?.car) {
      next.competencies[i] = emptyCompetencySection();
      continue;
    }
    next.competencies[i] = {
      ...next.competencies[i]!,
      car: {
        context: exp.car.context,
        action: exp.car.action,
        result: exp.car.result,
      },
      // The candidate's follow-up answers ride along as quotable evidence.
      // They are NOT folded into the CAR — that would be stitching.
      consultantNotes: (exp.consultantAnswers ?? [])
        .map((a) => a.answer.trim())
        .filter(Boolean),
    };
  }

  const about = aboutYouAnswer?.trim();
  if (about) {
    next.intro = {
      ...next.intro,
      text: clampToWordCap(about, INTRO_WORD_HARD_CAP),
    };
  }

  return recomputeDiveScores(next);
}

/** @deprecated Use seedDiveFromDemoExperiences */
export const seedDraftFromDemoExperiences = seedDiveFromDemoExperiences;
