/**
 * Brand Scoring Palette (guidelines p.30).
 *
 * Bright `--scoring-*` tokens are for fills, bars, and chart series.
 * `--scoring-*-fg` tokens are contrast-safe for numbers and pill labels
 * on light surfaces (≥4.5:1 on `--card` / `--background`).
 *
 * | Range   | Label       | Fill            | Text fg              |
 * |---------|-------------|-----------------|----------------------|
 * | 1.0–2.4 | Not ready   | --scoring-red   | --scoring-red-fg     |
 * | 2.5–3.4 | Borderline  | --scoring-yellow| --scoring-yellow-fg  |
 * | 3.5–4.4 | Pass        | --scoring-green | --scoring-green-fg   |
 * | 4.5–5.0 | Star        | --scoring-cyan  | --scoring-cyan-fg    |
 */

export type ScoringBand = "red" | "yellow" | "green" | "cyan";

/** Brand status label for a 1–5 score. Legacy reports may still store `"Ready"`. */
export type ScoringLabel = "Not ready" | "Borderline" | "Pass" | "Star";

export const SCORING_PALETTE = [
  {
    band: "red" as const,
    label: "Not ready" as const,
    range: "1.0–2.4",
    meaning: "Answers stop before the result: what happened, not what you decided.",
    min: 1.0,
    maxInclusive: 2.4,
    hex: "#CB3A31",
    fgHex: "#CB3A31",
    cssVar: "--scoring-red",
    fgCssVar: "--scoring-red-fg",
    token: "scoring-red",
    fgToken: "scoring-red-fg",
  },
  {
    band: "yellow" as const,
    label: "Borderline" as const,
    range: "2.5–3.4",
    meaning: "The shape is there; most answers still need one measurable outcome.",
    min: 2.5,
    maxInclusive: 3.4,
    hex: "#E9A13B",
    fgHex: "#A16207",
    cssVar: "--scoring-yellow",
    fgCssVar: "--scoring-yellow-fg",
    token: "scoring-yellow",
    fgToken: "scoring-yellow-fg",
  },
  {
    band: "green" as const,
    label: "Pass" as const,
    range: "3.5–4.4",
    meaning: "Answers land: a clear decision and a result an interviewer can check.",
    min: 3.5,
    maxInclusive: 4.4,
    hex: "#16A34A",
    fgHex: "#15803D",
    cssVar: "--scoring-green",
    fgCssVar: "--scoring-green-fg",
    token: "scoring-green",
    fgToken: "scoring-green-fg",
  },
  {
    band: "cyan" as const,
    label: "Star" as const,
    range: "4.5–5.0",
    meaning: "Consistently sharp: decision, action and a measured outcome every time.",
    min: 4.5,
    maxInclusive: 5.0,
    hex: "#22D3EE",
    fgHex: "#0E7490",
    cssVar: "--scoring-cyan",
    fgCssVar: "--scoring-cyan-fg",
    token: "scoring-cyan",
    fgToken: "scoring-cyan-fg",
  },
] as const;

/** The band's entry in the table above — label, range and what it means. */
export function scoringBandEntry(scoreOrLabel: number | string) {
  const band =
    typeof scoreOrLabel === "number"
      ? scoringBandForScore(scoreOrLabel)
      : labelToBand(scoreOrLabel);
  return SCORING_PALETTE.find((b) => b.band === band) ?? SCORING_PALETTE[0];
}

/** Bands from worst to best, which is how the table above is written; the
 *  scale and the key both read best-first, so they reverse it themselves. */
export const SCORING_BANDS_ASC = SCORING_PALETTE;

export function scoringBandForScore(score: number): ScoringBand {
  if (score >= 4.5) return "cyan";
  if (score >= 3.5) return "green";
  if (score >= 2.5) return "yellow";
  return "red";
}

export function scoringLabelForScore(score: number): ScoringLabel {
  const band = scoringBandForScore(score);
  if (band === "cyan") return "Star";
  if (band === "green") return "Pass";
  if (band === "yellow") return "Borderline";
  return "Not ready";
}

/** Contrast-safe text color for score numbers on light/dark app surfaces. */
export function scoringTextClass(score: number | null | undefined): string {
  const type = "font-gilroy tabular-nums";
  if (score == null || !Number.isFinite(score)) return `${type} text-extended-dark-cyan/35`;
  const band = scoringBandForScore(score);
  if (band === "cyan") return `${type} text-scoring-cyan-fg`;
  if (band === "green") return `${type} text-scoring-green-fg`;
  if (band === "yellow") return `${type} text-scoring-yellow-fg`;
  return `${type} text-scoring-red-fg`;
}

/** Bright fill for bars / dots — keep brand chroma, not used for small text. */
export function scoringFillClass(score: number | null | undefined): string {
  if (score == null || !Number.isFinite(score)) return "bg-border";
  const band = scoringBandForScore(score);
  if (band === "cyan") return "bg-scoring-cyan";
  if (band === "green") return "bg-scoring-green";
  if (band === "yellow") return "bg-scoring-yellow";
  return "bg-scoring-red";
}

/**
 * Soft pill for readiness / status badges — the ONE chrome for a scoring
 * band, wherever it appears. Borderless by design: tags and badges across
 * the product carry no stroke, the tint is the whole chrome.
 *
 * One tint strength for all four bands (25%) and the readable `-fg` token
 * for the label. The strength is deliberate: the same band was previously
 * drawn at 15% in the report's key and 25% on the readiness card, and side
 * by side on Home the two read as different tags. 25% is the version that
 * survives — it is the one that still separates from the card in dark mode,
 * where a 15% wash of the bright fill all but disappears. Callers must not
 * re-tint; if a band needs different weight somewhere, it needs a different
 * component, not a different opacity.
 */
export function scoringBadgeClass(scoreOrLabel: number | string): string {
  const band =
    typeof scoreOrLabel === "number"
      ? scoringBandForScore(scoreOrLabel)
      : labelToBand(scoreOrLabel);

  if (band === "cyan") {
    return "bg-scoring-cyan/25 text-scoring-cyan-fg";
  }
  if (band === "green") {
    return "bg-scoring-green/25 text-scoring-green-fg";
  }
  if (band === "yellow") {
    return "bg-scoring-yellow/25 text-scoring-yellow-fg";
  }
  return "bg-scoring-red/25 text-scoring-red-fg";
}

function labelToBand(label: string): ScoringBand {
  const n = label.trim().toLowerCase();
  if (n === "star") return "cyan";
  if (n === "pass" || n === "ready") return "green";
  if (n === "borderline") return "yellow";
  return "red";
}
