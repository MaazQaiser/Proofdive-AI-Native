/**
 * MyStoryBoard generation guardrails (contract for mock + future LLM).
 *
 * MUST NOT:
 * - Invent facts, metrics, employers, dates, stakeholders, actions, decisions, or outcomes
 *   the user did not provide.
 * - Merge unrelated experiences into a composite story that did not happen.
 * - Create generic content disconnected from user evidence.
 * - Inflate scores for polish/seniority or impressive outcomes without clear personal action.
 * - Treat CV/resume claims as proven unless validated through experience evidence.
 * - Hide missing evidence from the user.
 * - Accept large pasted documents inside response fields.
 * - Rewrite, regenerate, or alter a saved read-only Dive.
 *
 * MUST:
 * - Ground every claim in profile, baseline CAR, consultant answers, closing about-you,
 *   and user edits.
 * - Anchor each CAR story in exactly one real primary experience.
 * - Build Introduction only from profile, target role, about-you, and themes already present
 *   across captured experiences — never introduce new facts.
 * - Improve structure/clarity/language, never facts.
 * - Preserve uncertainty; prefer observable change over invented metrics.
 * - Produce lower truthful scores when evidence is shallow and surface what is missing.
 * - Use only locked Success Drivers / Competency Framework levels and HalfStepScore values.
 * - Enforce word caps below.
 *
 * Dive-specific:
 * - Re-derive scores from the full updated evidence set; never carry unsupported scores.
 * - Scores may go down; never raise a score purely because the Dive is later.
 * - Carried-over text must remain evidence-traceable.
 * - Manual edits are user-supplied evidence — do not pad around them.
 */

export const HALF_STEP_SCORES = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5] as const;
export type HalfStepScore = (typeof HALF_STEP_SCORES)[number];
/** Empty / unscored section. */
export type SectionScore = 0 | HalfStepScore;

export const MAX_DIVES_PER_ROLE = 3;

export const INTRO_WORD_TARGET_MIN = 180;
export const INTRO_WORD_TARGET_MAX = 220;
export const INTRO_WORD_HARD_CAP = 240;

export const CAR_WORD_TARGET_MIN = 240;
export const CAR_WORD_TARGET_MAX = 260;
export const CAR_WORD_HARD_CAP = 280;

/** Reject / warn when paste far exceeds hard caps (characters). */
export const LARGE_PASTE_CHAR_THRESHOLD = 4000;

export function countWords(text: string): number {
  const t = text.trim();
  if (!t) return 0;
  return t.split(/\s+/).filter(Boolean).length;
}

/** Truncate to at most `maxWords` words (preserves leading content). */
export function clampToWordCap(text: string, maxWords: number): string {
  const parts = text.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= maxWords) return text.trim();
  return parts.slice(0, maxWords).join(" ");
}

export function isAllowedHalfStep(n: number): n is HalfStepScore {
  return (HALF_STEP_SCORES as readonly number[]).includes(n);
}

/** Snap any finite number to the nearest allowed half-step in 1–5 (or 0 if ≤0). */
export function snapToHalfStep(n: number): SectionScore {
  if (!Number.isFinite(n) || n <= 0) return 0;
  let best: HalfStepScore = 1;
  let bestDist = Math.abs(n - 1);
  for (const s of HALF_STEP_SCORES) {
    const d = Math.abs(n - s);
    if (d < bestDist) {
      best = s;
      bestDist = d;
    }
  }
  return best;
}

export function isLargePaste(text: string): boolean {
  return text.length > LARGE_PASTE_CHAR_THRESHOLD;
}

export function carTotalWords(car: { context: string; action: string; result: string }): number {
  return countWords(`${car.context} ${car.action} ${car.result}`);
}
