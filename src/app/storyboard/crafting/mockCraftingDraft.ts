import {
  COMPETENCY_SPECS,
  normalizeStoryboardDocument,
  type CarBlock,
  type StoryboardDraftDocument,
  type SectionState,
} from "@/lib/storyboardDraft";

function section(car: CarBlock, locked = false): SectionState {
  return { locked, car };
}

export function isPristineStoryboardDocument(raw: StoryboardDraftDocument): boolean {
  const d = normalizeStoryboardDocument(raw);
  const empty = (c: CarBlock) => !c.context.trim() && !c.action.trim() && !c.result.trim();
  return empty(d.intro.car) && d.competencies.every((s) => empty(s.car));
}

/** `strengthScore` counts “strong” fields as length ≥ 30 after trim. */
function minLen(s: string, min: number): string {
  const t = s.trim();
  if (t.length >= min) return t;
  const glue = " More detail for reviewers.";
  let out = t;
  while (out.length < min) out += glue;
  return out;
}

/** Target 2 ⇒ one strong field; target 3 ⇒ two strong fields (<30 on third avoids 4/5). */
function carForStrength(target: 2 | 3, title: string): CarBlock {
  if (target === 2) {
    return {
      context: minLen(`Context (${title}): priorities conflicted before milestone; scope unclear.`, 32),
      action: "Short follow-up only.",
      result: "Outcome tracked later.",
    };
  }
  return {
    context: minLen(`Context (${title}): leaders needed a bet; teams blocked on dependencies.`, 32),
    action: minLen(`Action: workshops, written log, sequencing to cut risk week by week.`, 32),
    result: "Clearer reviews next.",
  };
}

/**
 * Mock draft tuned to ~2.9 / 5 overall (mean of 12 competencies): one section at strength 2,
 * eleven at strength 3 → sum 35 → 35/12 rounds to 2.9.
 */
export function buildMockCraftingDraft(targetRole: string): StoryboardDraftDocument {
  return {
    version: 1,
    targetRole,
    intro: section({
      context: minLen(`Targeting ${targetRole}: ownership, trade-offs, and measurable outcomes.`, 32),
      action: minLen(`Rituals: weekly review, decision log, crisp async updates for alignment.`, 32),
      result: "Each card below expands one competency.",
    }),
    competencies: COMPETENCY_SPECS.map((spec, i) =>
      section(carForStrength(i === 0 ? 2 : 3, spec.title)),
    ),
  };
}
