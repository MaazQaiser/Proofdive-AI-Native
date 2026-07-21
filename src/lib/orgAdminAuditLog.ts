export type AuditLogActivityType = "user_management" | "billing" | "profile" | "security";

export const AUDIT_LOG_ACTIVITY_LABEL: Record<AuditLogActivityType, string> = {
  user_management: "User Management",
  billing: "Billing",
  profile: "Profile",
  security: "Security",
};

export type AuditLogEntry = {
  id: string;
  description: string;
  performedBy: string;
  /** ISO timestamp. */
  timestamp: string;
  activityType: AuditLogActivityType;
};

/** Seeded example entries, matching the doc's examples verbatim (with `[User]` replaced by the admin's name). */
export function buildSeedAuditLog(performedBy: string): AuditLogEntry[] {
  return [
    {
      id: "log_1",
      description: `${performedBy} invited 120 users to the organization.`,
      performedBy,
      timestamp: "2026-07-18T09:14:00.000Z",
      activityType: "user_management",
    },
    {
      id: "log_2",
      description: `${performedBy} uploaded a CSV file containing 250 candidate emails.`,
      performedBy,
      timestamp: "2026-07-15T11:02:00.000Z",
      activityType: "user_management",
    },
    {
      id: "log_3",
      description: `${performedBy} deactivated user john.doe@example.com.`,
      performedBy,
      timestamp: "2026-07-10T16:40:00.000Z",
      activityType: "user_management",
    },
    {
      id: "log_4",
      description: `${performedBy} purchased 500 additional Mock Interview credits.`,
      performedBy,
      timestamp: "2026-07-05T13:20:00.000Z",
      activityType: "billing",
    },
    {
      id: "log_5",
      description: `${performedBy} updated organization profile details.`,
      performedBy,
      timestamp: "2026-07-01T10:05:00.000Z",
      activityType: "profile",
    },
  ];
}
