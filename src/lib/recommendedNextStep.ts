import { BookOpen, GraduationCap, UserCheck, type LucideIcon } from "lucide-react";

import { hasCompletedAnyTrainingForRole } from "@/lib/trainingJourneyProgress";
import type { StoryboardFromCraft, TrainingJourneyProgress } from "@/lib/proofdiveTypes";

export type JourneySignals = {
  hasCraftedStoryboard: boolean;
  hasCreatedStoryboard: boolean;
};

/**
 * Storyboard-progress signals shared between the Dashboard's 3-step Journey card and the
 * FAQ Assistant's "What's next in my roadmap?" answer — kept as one function so both stay
 * in sync rather than recomputing the same formula twice.
 */
export function deriveJourneySignals(ctx: {
  role: string;
  fromCraft: StoryboardFromCraft | null;
  roleExperienceCount: number;
  storyOverallScore: number;
}): JourneySignals {
  if (!ctx.role) return { hasCraftedStoryboard: false, hasCreatedStoryboard: false };

  const hasCraftedStoryboard = Boolean(
    ctx.fromCraft && ctx.fromCraft.v === 1 && ctx.fromCraft.role === ctx.role,
  );
  const hasCreatedStoryboard =
    hasCraftedStoryboard || ctx.roleExperienceCount > 0 || ctx.storyOverallScore > 0;

  return { hasCraftedStoryboard, hasCreatedStoryboard };
}

export type RecommendedNextStep = {
  id: "training" | "storyboard" | "interview";
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  /** Matches the icon already used for this module in CoachFloatingNav. */
  ctaIcon: LucideIcon;
};

/**
 * Single "what should this candidate do next" pick, layered on top of the same signals
 * the Dashboard card already derives — not a separate recommendation engine.
 */
export function pickRecommendedNextStep(ctx: {
  role: string;
  trainingJourneyProgressMap: Record<string, TrainingJourneyProgress>;
  hasCraftedStoryboard: boolean;
  hasCreatedStoryboard: boolean;
}): RecommendedNextStep {
  if (!hasCompletedAnyTrainingForRole(ctx.trainingJourneyProgressMap, ctx.role)) {
    return {
      id: "training",
      title: "Train with essential interview guides",
      subtitle: "Learn the fundamentals with guided practice.",
      ctaLabel: "Start learning",
      ctaHref: "/training",
      ctaIcon: GraduationCap,
    };
  }
  if (!ctx.hasCraftedStoryboard) {
    return {
      id: "storyboard",
      title: "Craft your story",
      subtitle: "Turn your experience into clear, structured answers.",
      ctaLabel: ctx.hasCreatedStoryboard ? "Add another experience" : "Start crafting",
      ctaHref: ctx.hasCreatedStoryboard ? "/storyboard?new=1" : "/storyboard",
      ctaIcon: BookOpen,
    };
  }
  return {
    id: "interview",
    title: "Take a mock interview",
    subtitle: "Practice with a 30-minute, real-world interview.",
    ctaLabel: "Start interview",
    ctaHref: "/interview?welcomeBack=1",
    ctaIcon: UserCheck,
  };
}
