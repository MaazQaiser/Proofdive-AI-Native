import type {
  InterviewReport,
  InterviewReportDriver,
  InterviewReportQuestion,
} from "@/lib/proofdiveTypes";
import { scoringBandForScore, type ScoringBand } from "@/lib/scoringPalette";

/**
 * Everything the redesigned report DERIVES from the stored report, in one
 * place, so the screen components only render.
 *
 * The rule for what lives here: a number or label that is computed from the
 * data rather than read off it. The strongest / weakest driver, the best and
 * weakest answer, and the "potential" projection are all arithmetic over
 * `report.drivers` and `report.questions` — so they stay honest for any
 * report, mock or real, and never drift from the scores shown beside them
 * (the stored `highlightChips` on the mock do drift: "Q3 · 3.8/5" while Q3 is
 * scored 2.2).
 */

export type ReportInsights = {
  strongestDriver: InterviewReportDriver;
  weakestDriver: InterviewReportDriver;
  bestQuestion: InterviewReportQuestion;
  weakestQuestion: InterviewReportQuestion;
  /**
   * What the overall would be if the weakest driver merely matched the mean
   * of the other three. Null when the lift is under 0.2 — a projection that
   * small is noise, and printing "2.4 → 2.5" would read as a promise the
   * data does not support.
   */
  potentialOverall: number | null;
};

export function deriveInsights(report: InterviewReport): ReportInsights | null {
  if (!report.drivers.length || !report.questions.length) return null;

  const byScoreDesc = [...report.drivers].sort((a, b) => b.score - a.score);
  const strongestDriver = byScoreDesc[0]!;
  const weakestDriver = byScoreDesc[byScoreDesc.length - 1]!;

  const qDesc = [...report.questions].sort((a, b) => b.score - a.score);
  const bestQuestion = qDesc[0]!;
  const weakestQuestion = qDesc[qDesc.length - 1]!;

  let potentialOverall: number | null = null;
  if (report.drivers.length > 1) {
    const others = report.drivers.filter((d) => d.id !== weakestDriver.id);
    const othersMean = others.reduce((a, d) => a + d.score, 0) / others.length;
    const projected =
      (others.reduce((a, d) => a + d.score, 0) + othersMean) / report.drivers.length;
    if (projected - report.overallScore >= 0.2) {
      potentialOverall = Math.round(projected * 10) / 10;
    }
  }

  return { strongestDriver, weakestDriver, bestQuestion, weakestQuestion, potentialOverall };
}

/** Section anchors, in reading order. The nav, the scroll-spy and the
 *  "jump to" links all read from this one list. */
export const REPORT_SECTIONS = [
  { id: "verdict", label: "Verdict" },
  { id: "drivers", label: "Success Drivers" },
  { id: "coach", label: "Coach summary" },
  { id: "rewrite", label: "Weakest answer" },
  { id: "answers", label: "Your answers" },
  { id: "transcript", label: "Transcript" },
  { id: "next", label: "Next steps" },
] as const;

export type ReportSectionId = (typeof REPORT_SECTIONS)[number]["id"];

/** The four bands the badges use, with the thresholds `scoringBandForScore`
 *  actually applies — shown to the user so a badge is never a mystery. */
export function bandFor(score: number): ScoringBand {
  return scoringBandForScore(score);
}

/** "Sep 07, 2026" */
export function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Unknown date";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "2-digit" });
}

/** "30 min" for whole minutes, "2m 14s" otherwise. */
export function fmtDuration(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  if (ss === 0) return `${mm} min`;
  return `${mm}m ${String(ss).padStart(2, "0")}s`;
}

/** "0:08" — the transcript clock. */
export function fmtClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/** "3–4 min" from an ideal range in seconds. */
export function fmtIdealRange(range: [number, number]): string {
  return `${Math.round(range[0] / 60)}–${Math.round(range[1] / 60)} min`;
}

export type AnswerLength = "short" | "in-range" | "long" | null;

/** Where an answer's length sits against its ideal window — the one piece of
 *  question metadata the user can act on directly. */
export function answerLength(q: InterviewReportQuestion): AnswerLength {
  if (!q.idealRangeSeconds) return null;
  const [lo, hi] = q.idealRangeSeconds;
  if (q.timeSeconds < lo) return "short";
  if (q.timeSeconds > hi) return "long";
  return "in-range";
}

/** The session-type label. The stored `interviewName` is "Mock interview";
 *  the report page says what KIND, the way the client's reference does. */
export function sessionTypeLabel(report: InterviewReport): string {
  const name = report.meta.interviewName?.trim();
  if (name && name.toLowerCase() !== "mock interview") return name;
  return "Role-based mock";
}
