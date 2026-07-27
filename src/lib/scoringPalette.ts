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
  if (score == null || !Number.isFinite(score)) return "text-extended-dark-cyan/35";
  const band = scoringBandForScore(score);
  if (band === "cyan") return "text-scoring-cyan-fg";
  if (band === "green") return "text-scoring-green-fg";
  if (band === "yellow") return "text-scoring-yellow-fg";
  return "text-scoring-red-fg";
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
 * Soft pill for readiness / status badges.
 * Tint uses the bright brand fill; label text uses the readable `-fg` token.
 */
export function scoringBadgeClass(scoreOrLabel: number | string): string {
  const band =
    typeof scoreOrLabel === "number"
      ? scoringBandForScore(scoreOrLabel)
      : labelToBand(scoreOrLabel);

  if (band === "cyan") {
    return "border-scoring-cyan/25 bg-scoring-cyan/15 text-scoring-cyan-fg";
  }
  if (band === "green") {
    return "border-scoring-green/25 bg-scoring-green/15 text-scoring-green-fg";
  }
  if (band === "yellow") {
    return "border-scoring-yellow/30 bg-scoring-yellow/20 text-scoring-yellow-fg";
  }
  return "border-scoring-red/25 bg-scoring-red/15 text-scoring-red-fg";
}

function labelToBand(label: string): ScoringBand {
  const n = label.trim().toLowerCase();
  if (n === "star") return "cyan";
  if (n === "pass" || n === "ready") return "green";
  if (n === "borderline") return "yellow";
  return "red";
}
