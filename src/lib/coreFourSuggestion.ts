/**
 * Deterministic Core Four suggestion (no LLM/API call). Keyword-matches the target role
 * and job description text against each competency's keyword list, picking the best
 * match per Success Driver pillar. Always returns exactly 4 competencies (one per pillar),
 * falling back to the first spec of a pillar when no keyword signal is present.
 */

import {
  COMPETENCY_SPECS,
  PILLAR_LABEL,
  type CompetencyId,
  type PillarId,
} from "@/lib/storyboardDraft";

const PILLAR_ORDER: PillarId[] = ["thinking", "action", "people", "mastery"];

const COMPETENCY_KEYWORDS: Record<CompetencyId, string[]> = {
  "thinking-analytical": ["analy", "root cause", "data", "insight", "pattern", "diagnos"],
  "thinking-prioritization": ["priorit", "trade-off", "tradeoff", "sequenc", "urgent", "deadline"],
  "thinking-decision": ["decision", "decide", "judgment", "judgement", "choice", "uncertain"],
  "action-ownership": ["own", "accountab", "responsib", "deliver", "follow through", "follow-through"],
  "action-initiative": ["initiative", "proactive", "self-start", "independent", "drive"],
  "action-change": ["change", "adapt", "agile", "pivot", "transition", "flexib"],
  "people-influence": ["influence", "persuade", "present", "communicat", "stakeholder", "align"],
  "people-collaboration": ["collabor", "team", "cross-function", "partner", "inclusion", "together"],
  "people-capability": ["mentor", "coach", "learn", "grow", "develop", "feedback", "train"],
  "mastery-functional": ["knowledge", "concept", "tool", "domain", "framework", "standard"],
  "mastery-execution": ["execut", "implement", "build", "deliver", "quality", "process"],
  "mastery-innovation": ["innovat", "improve", "optimi", "efficien", "redesign", "creativ"],
};

function bestForPillar(pillar: PillarId, haystack: string): CompetencyId {
  const specs = COMPETENCY_SPECS.filter((s) => s.pillar === pillar);
  let best = specs[0]!;
  let bestScore = -1;
  for (const spec of specs) {
    const score = COMPETENCY_KEYWORDS[spec.id].filter((kw) => haystack.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      best = spec;
    }
  }
  return best.id;
}

/** Always returns exactly 4 ids, one per pillar, in pillar order (thinking/action/people/mastery). */
export function suggestCoreFour(input: { targetRole: string; jobDescription: string }): CompetencyId[] {
  const haystack = `${input.targetRole} ${input.jobDescription}`.toLowerCase();
  return PILLAR_ORDER.map((pillar) => bestForPillar(pillar, haystack));
}

/** Short rationale shown under the Core Four heading (deterministic, no LLM). */
export function buildCoreFourReason(input: {
  targetRole: string;
  selected: CompetencyId[];
}): string {
  const titles = input.selected
    .map((id) => COMPETENCY_SPECS.find((spec) => spec.id === id)?.title)
    .filter((title): title is string => Boolean(title));
  const role = input.targetRole.trim() || "This role";
  if (titles.length === 0) {
    return `${role} needs a balanced Core Four across Thinking, Action, People, and Mastery.`;
  }
  const focus =
    titles.length === 1
      ? titles[0]
      : `${titles.slice(0, -1).join(", ")}, and ${titles[titles.length - 1]}`;
  return `This role needs someone who can demonstrate ${focus} in day-to-day work.`;
}

/** Returns a user-facing error string if the selection is invalid, otherwise null.
 * Rule: at least 4 total selected, and every pillar must have at least one selection
 * (extra picks beyond 4, or more than one per pillar, are fine). */
export function coreFourValidationError(selected: CompetencyId[]): string | null {
  if (selected.length < 4) {
    return `Select at least 4 competencies (${selected.length} selected).`;
  }
  const missing = PILLAR_ORDER.filter(
    (pillar) => !selected.some((id) => COMPETENCY_SPECS.find((s) => s.id === id)?.pillar === pillar),
  );
  if (missing.length) {
    return `Pick at least one from: ${missing.map((p) => PILLAR_LABEL[p]).join(", ")}.`;
  }
  return null;
}
