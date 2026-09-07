import type { CompetencyId } from "@/lib/storyboardDraft";

/** Persisted in `interviewSessionPrefs` when the user starts a session from /interview. */
export type InterviewSessionKind =
  | "first_time"
  | "full_competency"
  | "selective_pillar";

export type ReportDriverId = "thinking" | "action" | "people" | "mastery";

export type ScoreBand = "needs_work" | "developing" | "strong";

export type ReadinessLabel = "Not ready" | "Borderline" | "Ready" | "Pass" | "Star";

/** Drives hero copy on /report/[id]. Omitted on older stored reports → treated as improving. */
export type ReportHeroVariant = "first_start" | "improving";

export type InterviewReportMeta = {
  versionLabel: string; // e.g. "V1.2"
  id: string; // e.g. "rep_..."
  roleTitle: string;
  interviewName: string;
  createdAt: string; // ISO string
  durationSeconds: number;
  questionCount: number;
  hasVideo?: boolean;
  hasAudio?: boolean;
  pillarChips: string[]; // e.g. ["Thinking", "Action", "People", "Mastery"]
  heroVariant?: ReportHeroVariant;
};

export type InterviewReportDriver = {
  id: ReportDriverId;
  shortTitle: string; // Thinking/Action/People/Mastery
  fullTitle: string; // Power of ...
  score: number; // 1-5
  pct: number; // 0-100
  accent: "teal" | "amber" | "emerald" | "violet";
  icon: "brain" | "bolt" | "users" | "target";
  status: ReadinessLabel;
  subSkills: { name: string; score: number }[]; // len 3
};

export type InterviewReportQuestion = {
  id: string; // e.g. "q1"
  index: number; // 1-based display
  text: string;
  driver: ReportDriverId;
  facet: string; // one of 12 sub-skill names
  score: number; // 1-5
  status: ReadinessLabel;
  timeSeconds: number;
  idealRangeSeconds?: [number, number];
  answer: string;
  improvements: { title: string; detail: string }[];
};

export type InterviewTranscriptLine = {
  speaker: "Interviewer" | "Candidate";
  timeSeconds: number;
  text: string;
  flag?: string;
};

export type InterviewCoachingSpotlight = {
  questionId: string;
  title: string; // e.g. "Spotlight · highest-priority gap"
  yourAnswer: string;
  coachRewrite: string;
  whyStronger: string[];
  delivery: {
    bodyLanguage: string[];
    grammarPhrasing: string[];
    gesturesPresence: string[];
    fillerPacing: { summary: string; onCameraPresence: string };
  };
};

export type InterviewTrainingRecommendation = {
  id: string;
  pillar: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  durationMinutes: number;
  title: string;
  description: string;
  href: string;
  thumbnailUrl?: string;
};

export type InterviewReport = {
  meta: InterviewReportMeta;
  overallScore: number; // 1-5
  overallStatus: ReadinessLabel;
  overallBand: ScoreBand;
  headline: string;
  summary: string;
  drivers: InterviewReportDriver[]; // len 4
  narrative: { title: string; subtitle: string; paragraph: string };
  highlightChips: { strongest: string; biggestGap: string };
  questions: InterviewReportQuestion[];
  transcript: InterviewTranscriptLine[];
  spotlight: InterviewCoachingSpotlight;
  trainings: { featured: InterviewTrainingRecommendation; more: InterviewTrainingRecommendation[] };
};

/** Set when the user saves from /storyboard/crafting; storyboard home reads this to show the “crafted” state. */
export type StoryboardFromCraft = { v: 1; role: string; at: string };

/** In-progress craft edit session — resume `/storyboard/crafting` until Save clears it. */
export type StoryboardCraftEditing = { v: 1; role: string; at: string };

export type RoleProfile = {
  name?: string;
  /** Account-level, not role-specific — kept in sync across every entry in `savedRoles`. */
  email?: string;
  targetRole: string;
  backgroundType?: "fresh_grad" | "under_grad" | "diploma_holder" | "experienced";
  experienceLevel?: "1-5" | "5-10" | "10+";
  education?: string;
  /** Last employer, captured only for backgroundType === "experienced" (replaces education for that path). */
  lastWorkedAt?: string;
  background?: string;
  /** Hobbies / personal interests, captured on the no-resume path. Kept apart
   *  from `background` (a derived one-line summary) because this is the user's
   *  own words and is the only signal on that path that is not about work. */
  interests?: string;
  jobDescription?: string;
  /** Whether `jobDescription` was typed by the user or accepted as-is from the mock generator. */
  jobDescriptionSource?: "user" | "generated";
  resume?: string;
  industryVertical?: string;
  /** Core Four competency selection captured at onboarding — one per Success Driver minimum. */
  coreFourCompetencies?: CompetencyId[];
  /**
   * Competencies actively in the storyboard capture queue for this role.
   * Starts as the demo focus pair; expands when the user adds competencies for a later Dive.
   */
  storyboardFocusCompetencies?: CompetencyId[];
  /**
   * One-time, flow-level answer after all focus experiences are enriched.
   * Feeds TMAY / Core Introduction (Opening position + evidence themes), not CAR examples.
   */
  aboutYouAnswer?: string;
  createdAt: string;
};

export type ExperienceCar = {
  context: string;
  action: string;
  result: string;
};

export type ExperienceConsultantAnswer = {
  id: string;
  question: string;
  answer: string;
};

export type Experience = {
  id: string;
  role: string;
  title: string;
  raw: string;
  createdAt: string;
  /** Competency this experience anchors (Core Four / demo focus). */
  competencyId?: CompetencyId;
  /** Baseline Context / Action / Result capture. */
  car?: ExperienceCar;
  /** Consultant enrichment answers (demo: up to 2; model allows up to 5). */
  consultantAnswers?: ExperienceConsultantAnswer[];
  /** Legacy enrichment keys — kept for older localStorage rows. */
  enrichment?: {
    goalObjective?: string;
    breakdownTools?: string;
    prioritization?: string;
    execution?: string;
    people?: string;
    outcome?: string;
    updatedAt?: string;
  };
};

export type CarSnapshot = {
  challenge: string;
  action: string;
  result: string;
};

export type TrainingLesson = {
  id: string;
  title: string;
  summary: string;
};

export type TrainingModule = {
  id: string;
  role: string;
  title: string;
  description: string;
  lessons: TrainingLesson[];
  createdAt: string;
};

export type TrainingProgress = {
  role: string;
  completedLessonIds: string[];
  updatedAt: string;
};

/** Chapter flow on /training (lesson-style progress; stored under StorageKeys.trainingProgress). */
export type TrainingJourneyPhase =
  | "video_intro"
  | "video"
  | "post_video"
  | "quiz"
  | "after_quiz"
  | "case"
  | "after_case"
  | "assessment"
  | "complete";

export type TrainingJourneyProgress = {
  courseId: string;
  courseTitle: string;
  percentComplete: number;
  phase: TrainingJourneyPhase;
  updatedAt: string;
  /** Training progress is for this `RoleProfile.targetRole`; mismatch after role change / reset ⇒ ignore. */
  roleKey?: string;
};

