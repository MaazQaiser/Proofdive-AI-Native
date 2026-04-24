import type { TrainingJourneyPhase, TrainingJourneyProgress } from "@/lib/proofdiveTypes";

const PHASES: readonly TrainingJourneyPhase[] = [
  "video_intro",
  "video",
  "post_video",
  "quiz",
  "after_quiz",
  "case",
  "after_case",
  "assessment",
  "complete",
] as const;

const PERCENT: Record<TrainingJourneyPhase, number> = {
  video_intro: 5,
  video: 12,
  post_video: 22,
  quiz: 38,
  after_quiz: 48,
  case: 58,
  after_case: 72,
  assessment: 88,
  complete: 100,
};

export function isTrainingJourneyPhase(s: string): s is TrainingJourneyPhase {
  return (PHASES as readonly string[]).includes(s);
}

export function parseTrainingJourneyPhase(
  s: string | undefined | null,
): TrainingJourneyPhase {
  if (s && isTrainingJourneyPhase(s)) return s;
  return "video_intro";
}

export function percentForTrainingPhase(phase: TrainingJourneyPhase): number {
  return PERCENT[phase];
}

export function buildTrainingJourneyProgress(args: {
  courseId: string;
  courseTitle: string;
  phase: TrainingJourneyPhase;
  /** Current target role; stored so coach/training can ignore stale progress after role change. */
  roleKey: string;
}): TrainingJourneyProgress {
  return {
    courseId: args.courseId,
    courseTitle: args.courseTitle,
    phase: args.phase,
    percentComplete: percentForTrainingPhase(args.phase),
    updatedAt: new Date().toISOString(),
    roleKey: args.roleKey.trim(),
  };
}
