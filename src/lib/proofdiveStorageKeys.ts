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
  /** Every role the candidate has onboarded for, keyed implicitly by `targetRole`; `roleProfile` holds whichever one is currently active. */
  savedRoles: "proofdive.savedRoles.v1",
  /** Whether practice-reminder / score-update notifications are enabled for the candidate. */
  candidateNotificationsEnabled: "proofdive.candidateNotificationsEnabled.v1",
  /** Data URL of the candidate's uploaded profile photo, if any. */
  candidateAvatarImage: "proofdive.candidateAvatarImage.v1",
  /** Whether the user has accepted the Terms of Service and Privacy Policy at signup. */
  termsConsent: "proofdive.termsConsent.v1",
  /** Selected Daily/Weekly/Monthly granularity on the Super Admin dashboard. */
  superAdminDashboardDateRange: "proofdive.superAdmin.dashboardDateRange.v1",
  /** Selected Daily/Weekly/Monthly granularity on the Org Admin dashboard. */
  orgAdminDashboardDateRange: "proofdive.orgAdmin.dashboardDateRange.v1",
  /** Partial<Organization> patch overlaid on ORG_ADMIN_DEMO_ORG by the Profile Details section. */
  orgAdminProfileOverrides: "proofdive.orgAdmin.profileOverrides.v1",
  /** Whether the Org Admin has requested account deletion (Revoke Consent / Delete Account). */
  orgAdminAccountDeletionRequested: "proofdive.orgAdmin.accountDeletionRequested.v1",
  /** Messages submitted via the Contact Support section. */
  orgAdminSupportMessages: "proofdive.orgAdmin.supportMessages.v1",
  /** Audit log entries shown on the Audit Logs section (seeded, then user-editable via remove/clear). */
  orgAdminAuditLogEntries: "proofdive.orgAdmin.auditLogEntries.v1",
  /** IDs of policy-update notices the Org Admin has acknowledged. */
  orgAdminPolicyAcknowledgements: "proofdive.orgAdmin.policyAcknowledgements.v1",
  /** Saved mock payment methods (Billing & Subscription section). */
  orgAdminPaymentMethods: "proofdive.orgAdmin.paymentMethods.v1",
  /** Mock invoice/payment history (Billing & Subscription section). */
  orgAdminInvoices: "proofdive.orgAdmin.invoices.v1",
  /** Per-module additional allocation purchased via "Purchase Module Add-Ons", keyed by module key. */
  orgAdminBillingOverrides: "proofdive.orgAdmin.billingOverrides.v1",
  /** Whether the candidate has ever seen the FAQ Assistant's first-open greeting — shown once, ever. */
  faqAssistantGreetingSeen: "proofdive.faqAssistantGreetingSeen.v1",
} as const;

