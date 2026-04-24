/**
 * 13-section storyboard draft (1 intro + 12 fixed competencies) with CAR per section.
 * Client-only; persisted via StorageKeys.storyboardDraft.
 */

export type CarBlock = {
  context: string;
  action: string;
  result: string;
};

export type PillarId = "thinking" | "action" | "people" | "mastery";

export type CompetencyId =
  | "thinking-analytical"
  | "thinking-prioritization"
  | "thinking-decision"
  | "action-ownership"
  | "action-initiative"
  | "action-change"
  | "people-influence"
  | "people-collaboration"
  | "people-capability"
  | "mastery-functional"
  | "mastery-execution"
  | "mastery-innovation";

export const PILLAR_LABEL: Record<PillarId, string> = {
  thinking: "Power of Thinking",
  action: "Power of Action",
  people: "Power of People",
  mastery: "Power of Mastery",
};

export const INTRO_PILLAR_LABEL = "Introduction";

export const COMPETENCY_SPECS: { id: CompetencyId; pillar: PillarId; title: string }[] = [
  { id: "thinking-analytical", pillar: "thinking", title: "Analytical Thinking" },
  { id: "thinking-prioritization", pillar: "thinking", title: "Prioritization" },
  { id: "thinking-decision", pillar: "thinking", title: "Decision-Making Agility" },
  { id: "action-ownership", pillar: "action", title: "Ownership" },
  { id: "action-initiative", pillar: "action", title: "Initiative & Follow-through" },
  { id: "action-change", pillar: "action", title: "Embraces Change" },
  { id: "people-influence", pillar: "people", title: "Influence" },
  { id: "people-collaboration", pillar: "people", title: "Collaboration & Inclusion" },
  { id: "people-capability", pillar: "people", title: "Grows Capability" },
  { id: "mastery-functional", pillar: "mastery", title: "Functional Knowledge" },
  { id: "mastery-execution", pillar: "mastery", title: "Execution" },
  { id: "mastery-innovation", pillar: "mastery", title: "Innovation" },
];

export type SectionState = {
  locked: boolean;
  car: CarBlock;
};

export type StoryboardDraftDocument = {
  version: 1;
  targetRole: string;
  intro: SectionState;
  /** Fixed length 12; order matches `COMPETENCY_SPECS`. */
  competencies: SectionState[];
};

export type StoryboardDraftStore = {
  version: 1;
  /** Draft keyed by target role string. */
  byRole: Record<string, StoryboardDraftDocument>;
};

const EMPTY: CarBlock = { context: "", action: "", result: "" };

export function emptySection(): SectionState {
  return { locked: false, car: { ...EMPTY } };
}

export function createStoryboardDraft(targetRole: string): StoryboardDraftDocument {
  return {
    version: 1,
    targetRole,
    intro: emptySection(),
    competencies: COMPETENCY_SPECS.map(() => emptySection()),
  };
}

/** Ensure exactly 12 competency rows in spec order. */
export function normalizeStoryboardDocument(d: StoryboardDraftDocument): StoryboardDraftDocument {
  const comp = [...(d.competencies ?? [])];
  while (comp.length < 12) comp.push(emptySection());
  const fixed = comp.slice(0, 12).map((s) => ({
    locked: Boolean(s?.locked),
    car: s?.car
      ? {
          context: s.car.context ?? "",
          action: s.car.action ?? "",
          result: s.car.result ?? "",
        }
      : { context: "", action: "", result: "" },
  }));
  return {
    version: 1,
    targetRole: d.targetRole,
    intro: d.intro
      ? {
          locked: Boolean(d.intro.locked),
          car: {
            context: d.intro.car?.context ?? "",
            action: d.intro.car?.action ?? "",
            result: d.intro.car?.result ?? "",
          },
        }
      : emptySection(),
    competencies: fixed,
  };
}

/** 0–5 story strength (placeholder: CAR depth). */
export function strengthScore(car: CarBlock): 0 | 1 | 2 | 3 | 4 | 5 {
  const lens = [car.context, car.action, car.result].map((s) => s.trim().length);
  const strong = (n: number) => n >= 30;
  const nStrong = [lens[0]!, lens[1]!, lens[2]!].filter(strong).length;
  if (nStrong === 0) {
    if (lens[0]! + lens[1]! + lens[2]! === 0) return 0;
    return 1;
  }
  if (nStrong === 1) return 2;
  if (nStrong === 2) return 3;
  const total = lens[0]! + lens[1]! + lens[2]!;
  if (nStrong === 3 && total >= 400) return 5;
  return 4;
}

function mean(nums: number[]) {
  if (!nums.length) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

/** Mean of 12 competency scores; intro excluded. */
export function overallCompetencyStrength(d: StoryboardDraftDocument) {
  return mean(d.competencies.map((s) => strengthScore(s.car)));
}

export function pillarStrength(
  d: StoryboardDraftDocument,
  pillar: PillarId,
) {
  const idxs = COMPETENCY_SPECS.map((s, i) => (s.pillar === pillar ? i : -1)).filter(
    (i) => i >= 0,
  ) as number[];
  return mean(idxs.map((i) => strengthScore(d.competencies[i]!.car)));
}
