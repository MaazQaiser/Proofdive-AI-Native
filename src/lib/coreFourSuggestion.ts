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

/** Role-aware AI reasoning for why a competency was suggested for the Core Four. */
const COMPETENCY_REASONING: Record<CompetencyId, (role: string) => string> = {
  "thinking-analytical": (role) =>
    `This ${role} needs someone who can break down complex problems, debug production issues, and figure out what is causing unexpected model or pipeline behavior.`,
  "thinking-prioritization": (role) =>
    `This ${role} needs someone who can weigh urgency against impact, sequence competing work, and keep focus on the highest-value outcomes under pressure.`,
  "thinking-decision": (role) =>
    `This ${role} needs someone who can make sound calls with incomplete information, explain trade-offs clearly, and keep work moving when certainty is limited.`,
  "action-ownership": (role) =>
    `This ${role} needs someone who takes responsibility for outcomes, drives work without waiting to be prompted, and persists until meaningful progress is made.`,
  "action-initiative": (role) =>
    `This ${role} needs someone who anticipates stakeholder needs, balances competing interests, and creates value beyond the minimum ask.`,
  "action-change": (role) =>
    `This ${role} needs someone who stays effective when priorities shift, adapts quickly, and treats change as a chance to improve outcomes.`,
  "people-influence": (role) =>
    `This ${role} needs someone who can explain complex ideas clearly, adapt to different audiences, and build alignment that moves decisions forward.`,
  "people-collaboration": (role) =>
    `This ${role} needs someone who works well across teams, invites diverse perspectives, and strengthens shared ownership of outcomes.`,
  "people-capability": (role) =>
    `This ${role} needs someone who seeks feedback, learns from experience, and helps others grow through shared learning.`,
  "mastery-functional": (role) =>
    `This ${role} needs strong functional knowledge of the concepts, tools, and standards that matter day to day in the work.`,
  "mastery-execution": (role) =>
    `This ${role} needs someone who can turn knowledge into well-structured delivery — choosing the right methods and producing sound outcomes.`,
  "mastery-innovation": (role) =>
    `This ${role} needs someone who spots improvement opportunities, tests better approaches, and raises quality or efficiency over time.`,
};

/** Plain-language explanation of why a competency was suggested for this role. */
export function suggestionReasoningFor(
  competencyId: CompetencyId,
  input: { targetRole: string },
): string {
  const role = input.targetRole.trim() || "role";
  return COMPETENCY_REASONING[competencyId](role);
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
