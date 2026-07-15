/** Rounds a max value up to a visually clean axis ceiling (1/2/5 × 10^n). */
export function niceCeiling(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const normalized = value / magnitude;
  let niceNormalized: number;
  if (normalized <= 1) niceNormalized = 1;
  else if (normalized <= 2) niceNormalized = 2;
  else if (normalized <= 5) niceNormalized = 5;
  else niceNormalized = 10;
  return niceNormalized * magnitude;
}

/** Thins x-axis labels so at most `maxLabels` are shown, evenly spaced. */
export function shouldShowLabel(index: number, total: number, maxLabels = 8): boolean {
  if (total <= maxLabels) return true;
  const step = Math.ceil(total / maxLabels);
  return index % step === 0 || index === total - 1;
}
