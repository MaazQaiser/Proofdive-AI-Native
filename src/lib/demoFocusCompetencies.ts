/**
 * Demo focus: the app only intakes experience against 2 competencies, then
 * crafts a storyboard and mock report for those two. Full 12-spec catalog
 * remains in storage for compatibility; UI/scoring filter to this set.
 */

import {
  COMPETENCY_SPECS,
  type CompetencyId,
  type PillarId,
  type StoryboardDraftDocument,
  strengthScore,
} from "@/lib/storyboardDraft";
import type { Experience, RoleProfile } from "@/lib/proofdiveTypes";

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
  return resolveFocusCompetencies(profile?.coreFourCompetencies);
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
  d: StoryboardDraftDocument,
  ids: readonly CompetencyId[],
) {
  const idxs = focusCompetencyIndexes(ids);
  if (!idxs.length) return 0;
  const scores = idxs.map((i) =>
    Number(strengthScore(d.competencies[i]?.car ?? { context: "", action: "", result: "" })),
  );
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  return Math.round(avg * 10) / 10;
}

export function pillarFocusStrength(
  d: StoryboardDraftDocument,
  pillar: PillarId,
  ids: readonly CompetencyId[],
) {
  const idxs = focusCompetencyIndexes(ids).filter(
    (i) => COMPETENCY_SPECS[i]?.pillar === pillar,
  );
  if (!idxs.length) return 0;
  const scores = idxs.map((i) =>
    Number(strengthScore(d.competencies[i]?.car ?? { context: "", action: "", result: "" })),
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

/** Apply experience CAR blocks onto the matching draft competency sections. */
export function seedDraftFromDemoExperiences(
  d: StoryboardDraftDocument,
  roleExperiences: readonly Experience[],
  focusIds: readonly CompetencyId[],
): StoryboardDraftDocument {
  const next = {
    ...d,
    competencies: d.competencies.map((s) => ({
      ...s,
      car: { ...s.car },
    })),
  };
  for (const id of focusIds) {
    const exp = experienceForCompetency(roleExperiences, id);
    const idx = COMPETENCY_SPECS.findIndex((s) => s.id === id);
    if (idx < 0 || !exp?.car) continue;
    next.competencies[idx] = {
      ...next.competencies[idx]!,
      car: {
        context: exp.car.context,
        action: exp.car.action,
        result: exp.car.result,
      },
    };
  }
  return next;
}
