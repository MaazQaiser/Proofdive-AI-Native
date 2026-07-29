/**
 * MyStoryBoard Dive model: Introduction (single narrative) + 12 CAR competencies.
 * Client-only; persisted via StorageKeys.storyboardDives.
 */

import { makeId } from "@/lib/id";
import {
  type HalfStepScore,
  type SectionScore,
  MAX_DIVES_PER_ROLE,
  clampToWordCap,
  countWords,
  INTRO_WORD_HARD_CAP,
  snapToHalfStep,
} from "@/lib/storyboardGuardrails";

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

export type IntroSection = {
  locked: boolean;
  /** How many quick-regenerations have been used on the intro in this Dive. */
  regenCount: number;
  text: string;
};

export type CompetencySection = {
  locked: boolean;
  car: CarBlock;
  /** How many quick-regenerations have been used on this competency in this Dive. */
  regenCount: number;
  score: SectionScore;
  /** Classification: signals the evidence currently supports (plain language). */
  matchedSignals: string[];
  /** Classification: short keyword phrases still needed for the next level. */
  missingNextLevelSignals: string[];
  /** Classification: other competencies this experience also evidences. */
  secondaryCompetencies: CompetencyId[];
  developmentRecommendation: string;
};

export type StoryboardDive = {
  schemaVersion: 2;
  id: string;
  diveNumber: 1 | 2 | 3;
  targetRole: string;
  status: "editing" | "saved";
  savedAt: string | null;
  intro: IntroSection;
  competencies: CompetencySection[];
  overallScore: number;
  pillarScores: Record<PillarId, number>;
};

export type RoleDiveBank = {
  dives: StoryboardDive[];
};

export type StoryboardDiveStore = {
  schemaVersion: 2;
  byRole: Record<string, RoleDiveBank>;
};

/** @deprecated Legacy v1 shape — used only for migration. */
export type SectionState = {
  locked: boolean;
  car: CarBlock;
};

/** @deprecated Legacy v1 document. */
export type StoryboardDraftDocument = {
  version: 1;
  targetRole: string;
  intro: SectionState;
  competencies: SectionState[];
};

/** @deprecated Legacy v1 store. */
export type StoryboardDraftStore = {
  version: 1;
  byRole: Record<string, StoryboardDraftDocument>;
};

const EMPTY_CAR: CarBlock = { context: "", action: "", result: "" };

export function emptyCar(): CarBlock {
  return { ...EMPTY_CAR };
}

export function emptyCompetencySection(): CompetencySection {
  return {
    locked: false,
    car: emptyCar(),
    regenCount: 0,
    score: 0,
    matchedSignals: [],
    missingNextLevelSignals: [],
    secondaryCompetencies: [],
    developmentRecommendation: "",
  };
}

export function emptyIntro(): IntroSection {
  return { locked: false, regenCount: 0, text: "" };
}

export function emptyPillarScores(): Record<PillarId, number> {
  return { thinking: 0, action: 0, people: 0, mastery: 0 };
}

export function createEmptyDive(
  targetRole: string,
  diveNumber: 1 | 2 | 3,
  status: "editing" | "saved" = "editing",
): StoryboardDive {
  return {
    schemaVersion: 2,
    id: makeId(),
    diveNumber,
    targetRole,
    status,
    savedAt: null,
    intro: emptyIntro(),
    competencies: COMPETENCY_SPECS.map(() => emptyCompetencySection()),
    overallScore: 0,
    pillarScores: emptyPillarScores(),
  };
}

export function createEmptyDiveStore(): StoryboardDiveStore {
  return { schemaVersion: 2, byRole: {} };
}

export function normalizeDive(d: StoryboardDive): StoryboardDive {
  const comp = [...(d.competencies ?? [])];
  while (comp.length < 12) comp.push(emptyCompetencySection());
  const fixed = comp.slice(0, 12).map((s) => ({
    locked: Boolean(s?.locked),
    car: {
      context: s?.car?.context ?? "",
      action: s?.car?.action ?? "",
      result: s?.car?.result ?? "",
    },
    regenCount: Math.max(0, Number(s?.regenCount) || 0),
    score: (s?.score ?? 0) as SectionScore,
    matchedSignals: Array.isArray(s?.matchedSignals) ? s.matchedSignals : [],
    missingNextLevelSignals: Array.isArray(s?.missingNextLevelSignals)
      ? s.missingNextLevelSignals
      : [],
    secondaryCompetencies: Array.isArray(s?.secondaryCompetencies)
      ? (s.secondaryCompetencies.filter((id) =>
          COMPETENCY_SPECS.some((spec) => spec.id === id),
        ) as CompetencyId[])
      : [],
    developmentRecommendation: s?.developmentRecommendation ?? "",
  }));
  const diveNumber = ([1, 2, 3].includes(d.diveNumber) ? d.diveNumber : 1) as 1 | 2 | 3;
  return {
    schemaVersion: 2,
    id: d.id || makeId(),
    diveNumber,
    targetRole: d.targetRole ?? "",
    status: d.status === "saved" ? "saved" : "editing",
    savedAt: d.savedAt ?? null,
    intro: {
      locked: Boolean(d.intro?.locked),
      regenCount: Math.max(0, Number(d.intro?.regenCount) || 0),
      text: d.intro?.text ?? "",
    },
    competencies: fixed,
    overallScore: Number(d.overallScore) || 0,
    pillarScores: {
      thinking: Number(d.pillarScores?.thinking) || 0,
      action: Number(d.pillarScores?.action) || 0,
      people: Number(d.pillarScores?.people) || 0,
      mastery: Number(d.pillarScores?.mastery) || 0,
    },
  };
}

function mean(nums: number[]) {
  if (!nums.length) return 0;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

/** Evidence-depth score for a CAR block; snaps to allowed half-steps (or 0). */
export function strengthScore(car: CarBlock): SectionScore {
  const words = countWords(`${car.context} ${car.action} ${car.result}`);
  const lens = [car.context, car.action, car.result].map((s) => s.trim().length);
  const strong = (n: number) => n >= 30;
  const nStrong = lens.filter(strong).length;
  if (words === 0) return 0;
  if (nStrong === 0) return 1;
  if (nStrong === 1) return words >= 80 ? 2.5 : 2;
  if (nStrong === 2) return words >= 160 ? 3.5 : 3;
  if (words >= 240) return 5;
  if (words >= 180) return 4.5;
  return 4;
}

export function introStrengthScore(text: string): SectionScore {
  const w = countWords(text);
  if (w === 0) return 0;
  if (w < 40) return 1;
  if (w < 80) return 2;
  if (w < 140) return 2.5;
  if (w < 180) return 3;
  if (w <= 220) return 4;
  if (w <= 240) return 4.5;
  return 5;
}

export function computePillarScores(dive: StoryboardDive): Record<PillarId, number> {
  const out = emptyPillarScores();
  for (const pillar of Object.keys(out) as PillarId[]) {
    const idxs = COMPETENCY_SPECS.map((s, i) => (s.pillar === pillar ? i : -1)).filter(
      (i) => i >= 0,
    );
    out[pillar] = mean(idxs.map((i) => Number(dive.competencies[i]?.score ?? 0)));
  }
  return out;
}

export function computeOverallScore(dive: StoryboardDive): number {
  return mean(dive.competencies.map((s) => Number(s.score ?? 0)));
}

/**
 * Mock classification: related competencies for demo cards when evidence exists.
 * Deterministic per primary competency so cards show sample related pills.
 */
const MOCK_SECONDARY_COMPETENCIES: Record<CompetencyId, CompetencyId[]> = {
  "thinking-analytical": ["thinking-decision", "mastery-execution"],
  "thinking-prioritization": ["thinking-decision", "action-ownership"],
  "thinking-decision": ["thinking-analytical", "people-influence"],
  "action-ownership": ["action-initiative", "people-collaboration"],
  "action-initiative": ["action-ownership", "mastery-innovation"],
  "action-change": ["action-initiative", "people-influence"],
  "people-influence": ["people-collaboration", "thinking-decision"],
  "people-collaboration": ["people-capability", "action-ownership"],
  "people-capability": ["people-collaboration", "mastery-functional"],
  "mastery-functional": ["mastery-execution", "thinking-analytical"],
  "mastery-execution": ["mastery-functional", "action-ownership"],
  "mastery-innovation": ["mastery-execution", "action-initiative"],
};

/**
 * Classification: other competencies this experience also evidences.
 * Demo mock returns fixed related ids when CAR content exists; otherwise empty.
 */
export function classifySecondaryCompetencies(
  primaryId: CompetencyId,
  car: CarBlock,
): CompetencyId[] {
  const hasContent =
    Boolean(car.context.trim()) || Boolean(car.action.trim()) || Boolean(car.result.trim());
  if (!hasContent) return [];
  return MOCK_SECONDARY_COMPETENCIES[primaryId].filter((id) => id !== primaryId);
}

/** Re-derive live scores + classification signals from current section content. */
export function recomputeDiveScores(dive: StoryboardDive): StoryboardDive {
  const competencies = dive.competencies.map((s, i) => {
    const title = COMPETENCY_SPECS[i]?.title ?? "This competency";
    const primaryId = COMPETENCY_SPECS[i]?.id;
    const score = strengthScore(s.car);
    const hasContent =
      s.car.context.trim() || s.car.action.trim() || s.car.result.trim();
    const matchedSignals: string[] = [];
    const missingNextLevelSignals: string[] = [];
    let developmentRecommendation = s.developmentRecommendation;

    if (hasContent) {
      if (s.car.context.trim()) matchedSignals.push("Context / situation described");
      if (s.car.action.trim()) matchedSignals.push("Personal action described");
      if (s.car.result.trim()) matchedSignals.push("Outcome or change described");
      // Keyword phrases for Missing Strengths (not full sentences).
      if (score < 3) missingNextLevelSignals.push("Personal ownership");
      if (score < 4) missingNextLevelSignals.push("Observable result");
      if (score < 5) missingNextLevelSignals.push("Constraints-to-impact link");
      if (!developmentRecommendation) {
        developmentRecommendation = hasContent
          ? `Strengthen ${title} with one concrete trade-off you owned and one observable outcome.`
          : `Capture a real experience for ${title} before scoring higher.`;
      }
    } else {
      missingNextLevelSignals.push("Baseline CAR");
      developmentRecommendation = `No evidence yet for ${title}. Add one primary experience before treating this as interview-ready.`;
    }

    const secondaryCompetencies = primaryId
      ? classifySecondaryCompetencies(primaryId, s.car)
      : [];

    return {
      ...s,
      score,
      matchedSignals,
      missingNextLevelSignals,
      secondaryCompetencies,
      developmentRecommendation,
    };
  });

  const next: StoryboardDive = {
    ...dive,
    competencies,
  };
  next.pillarScores = computePillarScores(next);
  next.overallScore = computeOverallScore(next);
  return next;
}

/** Freeze a dive as saved — immutable thereafter. */
export function freezeDiveForSave(dive: StoryboardDive): StoryboardDive {
  const scored = recomputeDiveScores(normalizeDive(dive));
  return {
    ...scored,
    intro: {
      ...scored.intro,
      text: clampToWordCap(scored.intro.text, INTRO_WORD_HARD_CAP),
      locked: true,
    },
    competencies: scored.competencies.map((s) => ({ ...s, locked: true })),
    status: "saved",
    savedAt: new Date().toISOString(),
  };
}

export type CloneDiveUnlock =
  | { kind: "all" }
  /** Unlock only Introduction — other sections stay locked for one-section editing. */
  | { kind: "intro" }
  /** Unlock only one competency index (0–11). */
  | { kind: "competency"; index: number };

/** Clone latest saved dive into a new editing dive (does not mutate the source). */
export function cloneDiveForNext(
  source: StoryboardDive,
  diveNumber: 1 | 2 | 3,
  unlock: CloneDiveUnlock = { kind: "all" },
): StoryboardDive {
  const base = normalizeDive(structuredClone(source));
  const unlockIntro = unlock.kind === "all" || unlock.kind === "intro";
  const unlockIndex = unlock.kind === "competency" ? unlock.index : -1;
  return recomputeDiveScores({
    ...base,
    id: makeId(),
    diveNumber,
    status: "editing",
    savedAt: null,
    intro: { ...base.intro, regenCount: 0, locked: !unlockIntro },
    competencies: base.competencies.map((s, i) => ({
      ...s,
      regenCount: 0,
      locked: unlock.kind === "all" ? false : i !== unlockIndex,
    })),
  });
}

export function savedDivesForRole(store: StoryboardDiveStore, role: string): StoryboardDive[] {
  const bank = store.byRole[role];
  if (!bank) return [];
  return bank.dives
    .filter((d) => d.status === "saved")
    .map(normalizeDive)
    .sort((a, b) => b.diveNumber - a.diveNumber);
}

export function editingDiveForRole(
  store: StoryboardDiveStore,
  role: string,
): StoryboardDive | null {
  const bank = store.byRole[role];
  if (!bank) return null;
  const d = bank.dives.find((x) => x.status === "editing");
  return d ? normalizeDive(d) : null;
}

export function diveById(
  store: StoryboardDiveStore,
  role: string,
  id: string,
): StoryboardDive | null {
  const bank = store.byRole[role];
  if (!bank) return null;
  const d = bank.dives.find((x) => x.id === id);
  return d ? normalizeDive(d) : null;
}

export function latestSavedDive(
  store: StoryboardDiveStore,
  role: string,
): StoryboardDive | null {
  const saved = savedDivesForRole(store, role);
  return saved[0] ?? null;
}

export function remainingDives(store: StoryboardDiveStore, role: string): number {
  const savedCount = savedDivesForRole(store, role).length;
  return Math.max(0, MAX_DIVES_PER_ROLE - savedCount);
}

export function canStartNewDive(store: StoryboardDiveStore, role: string): boolean {
  return remainingDives(store, role) > 0 && !editingDiveForRole(store, role);
}

/**
 * Upsert an editing dive. Refuses to overwrite any saved dive body.
 */
export function upsertEditingDive(
  store: StoryboardDiveStore,
  dive: StoryboardDive,
): StoryboardDiveStore {
  const role = dive.targetRole;
  const bank = store.byRole[role] ?? { dives: [] };
  const normalized = normalizeDive(dive);
  if (normalized.status === "saved") {
    // Append-only: only add if id is new; never mutate existing saved.
    if (bank.dives.some((d) => d.id === normalized.id && d.status === "saved")) {
      return store;
    }
    return {
      ...store,
      byRole: {
        ...store.byRole,
        [role]: { dives: [...bank.dives.filter((d) => d.id !== normalized.id), normalized] },
      },
    };
  }

  const withoutOtherEditing = bank.dives.filter(
    (d) => !(d.status === "editing" && d.id !== normalized.id),
  );
  const idx = withoutOtherEditing.findIndex((d) => d.id === normalized.id);
  const nextDives =
    idx >= 0
      ? withoutOtherEditing.map((d, i) => (i === idx ? normalized : d))
      : [...withoutOtherEditing, normalized];

  return {
    ...store,
    byRole: { ...store.byRole, [role]: { dives: nextDives } },
  };
}

/** Replace editing dive with frozen saved dive (append-only for that id). */
export function commitSavedDive(
  store: StoryboardDiveStore,
  editing: StoryboardDive,
): StoryboardDiveStore {
  const frozen = freezeDiveForSave(editing);
  const role = frozen.targetRole;
  const bank = store.byRole[role] ?? { dives: [] };
  // Drop any editing copy of this id; never mutate prior saved dives.
  const nextDives = [
    ...bank.dives.filter((d) => d.status === "saved" || d.id !== frozen.id),
    frozen,
  ];
  return {
    ...store,
    byRole: { ...store.byRole, [role]: { dives: nextDives } },
  };
}

/** Migrate legacy v1 draft store (+ optional fromCraft bookmark) into Dive store. */
export function migrateLegacyDraftStore(
  legacy: StoryboardDraftStore | null | undefined,
  fromCraftRole?: string | null,
): StoryboardDiveStore {
  const out = createEmptyDiveStore();
  if (!legacy?.byRole) return out;

  for (const [role, doc] of Object.entries(legacy.byRole)) {
    const introText =
      doc.intro?.car?.context?.trim() ||
      [doc.intro?.car?.context, doc.intro?.car?.action, doc.intro?.car?.result]
        .filter((s) => s?.trim())
        .join("\n\n") ||
      "";
    let dive = createEmptyDive(role, 1, "editing");
    dive = {
      ...dive,
      intro: { locked: Boolean(doc.intro?.locked), regenCount: 0, text: introText },
      competencies: COMPETENCY_SPECS.map((_, i) => {
        const s = doc.competencies?.[i];
        return {
          locked: Boolean(s?.locked),
          car: {
            context: s?.car?.context ?? "",
            action: s?.car?.action ?? "",
            result: s?.car?.result ?? "",
          },
          regenCount: 0,
          score: 0 as SectionScore,
          matchedSignals: [],
          missingNextLevelSignals: [],
          secondaryCompetencies: [],
          developmentRecommendation: "",
        };
      }),
    };
    dive = recomputeDiveScores(dive);
    if (fromCraftRole && fromCraftRole === role) {
      dive = freezeDiveForSave(dive);
    }
    out.byRole[role] = { dives: [dive] };
  }
  return out;
}

export function isDiveStore(value: unknown): value is StoryboardDiveStore {
  return (
    !!value &&
    typeof value === "object" &&
    (value as StoryboardDiveStore).schemaVersion === 2 &&
    typeof (value as StoryboardDiveStore).byRole === "object"
  );
}

/** Compatibility: overall from a dive-like document. */
export function overallCompetencyStrength(d: StoryboardDive | StoryboardDraftDocument): number {
  if ("schemaVersion" in d && d.schemaVersion === 2) {
    return d.overallScore || computeOverallScore(d);
  }
  const legacy = d as StoryboardDraftDocument;
  return mean(
    (legacy.competencies ?? []).map((s) =>
      Number(strengthScore(s?.car ?? EMPTY_CAR)),
    ),
  );
}

export function pillarStrength(
  d: StoryboardDive | StoryboardDraftDocument,
  pillar: PillarId,
): number {
  if ("schemaVersion" in d && d.schemaVersion === 2) {
    return d.pillarScores?.[pillar] ?? 0;
  }
  const legacy = d as StoryboardDraftDocument;
  const idxs = COMPETENCY_SPECS.map((s, i) => (s.pillar === pillar ? i : -1)).filter(
    (i) => i >= 0,
  );
  return mean(
    idxs.map((i) => Number(strengthScore(legacy.competencies?.[i]?.car ?? EMPTY_CAR))),
  );
}

/** @deprecated Use createEmptyDive */
export function emptySection(): SectionState {
  return { locked: false, car: emptyCar() };
}

/** @deprecated Use createEmptyDive */
export function createStoryboardDraft(targetRole: string): StoryboardDraftDocument {
  return {
    version: 1,
    targetRole,
    intro: emptySection(),
    competencies: COMPETENCY_SPECS.map(() => emptySection()),
  };
}

/** @deprecated Legacy normalize */
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

export { snapToHalfStep, type HalfStepScore, type SectionScore, MAX_DIVES_PER_ROLE };
