export const StorageKeys = {
  roleProfile: "proofdive.roleProfile.v1",
  experiences: "proofdive.experiences.v1",
  interviewSessionPrefs: "proofdive.interviewSessionPrefs.v1",
  /** Report records keyed by report id. */
  reports: "proofdive.reports.v1",
  trainingModules: "proofdive.trainingModules.v1",
  trainingProgress: "proofdive.trainingProgress.v1",
  storyboardDraft: "proofdive.storyboardDraft.v1",
  storyboardFromCraft: "proofdive.storyboardFromCraft.v1",
  /** `welcome` | `roadmap` (3 steps, empty readiness) | `journey` (3 steps, full readiness) | `final` (post-report home, pinned snapshot). */
  coachJourneyView: "proofdive.coachJourneyView.v1",
  /** When `coachJourneyView` is `final`, readiness uses this report id from `reports`. */
  coachFinalReadinessReportId: "proofdive.coachFinalReadinessReportId.v1",
  /** Whether the user consents to their interview recordings being used to improve AI. */
  aiTrainingConsent: "proofdive.aiTrainingConsent.v1",
  /** Whether the user has accepted the Terms of Service and Privacy Policy at signup. */
  termsConsent: "proofdive.termsConsent.v1",
  /** Selected Daily/Weekly/Monthly granularity on the Super Admin dashboard. */
  superAdminDashboardDateRange: "proofdive.superAdmin.dashboardDateRange.v1",
} as const;

