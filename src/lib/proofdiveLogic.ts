import type { CarSnapshot, Experience } from "@/lib/proofdiveTypes";

export function buildCarSnapshot(exp: Experience): CarSnapshot | null {
  const e = exp.enrichment;
  if (!e) return null;
  const q1 = e.goalObjective?.trim();
  const q2 = e.breakdownTools?.trim();
  const q3 = e.prioritization?.trim();
  const q4 = e.execution?.trim();
  const q5 = e.people?.trim();
  const q6 = e.outcome?.trim();
  if (!(q1 && q2 && q3 && q4 && q5 && q6)) return null;

  return {
    challenge: `${q1}\n\n${q2}`,
    action: `${q3}\n\n${q4}\n\n${q5}`,
    result: q6,
  };
}

export function isEnriched(exp: Experience) {
  return buildCarSnapshot(exp) !== null;
}

export function countEnrichedForRole(experiences: Experience[], role: string) {
  return experiences.filter((e) => e.role === role).filter(isEnriched).length;
}

export function normalizeWhitespace(s: string) {
  return s.replace(/\r\n/g, "\n").trim();
}

