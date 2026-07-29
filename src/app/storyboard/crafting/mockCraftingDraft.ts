import {
  createEmptyDive,
  normalizeDive,
  recomputeDiveScores,
  type StoryboardDive,
} from "@/lib/storyboardDraft";

/** True when intro and all competencies have no content. */
export function isPristineDive(raw: StoryboardDive): boolean {
  const d = normalizeDive(raw);
  if (d.intro.text.trim()) return false;
  return d.competencies.every(
    (s) => !s.car.context.trim() && !s.car.action.trim() && !s.car.result.trim(),
  );
}

/**
 * Evidence-grounded starter Dive: empty competencies + empty intro.
 * Callers must seed from user experiences via seedDiveFromDemoExperiences.
 * Does not invent metrics, employers, or outcomes.
 */
export function buildEmptyCraftingDive(
  targetRole: string,
  diveNumber: 1 | 2 | 3 = 1,
): StoryboardDive {
  return recomputeDiveScores(createEmptyDive(targetRole, diveNumber, "editing"));
}

/** @deprecated Use buildEmptyCraftingDive */
export function buildMockCraftingDraft(targetRole: string): StoryboardDive {
  return buildEmptyCraftingDive(targetRole, 1);
}

/** @deprecated Use isPristineDive */
export function isPristineStoryboardDocument(raw: StoryboardDive): boolean {
  return isPristineDive(raw);
}
