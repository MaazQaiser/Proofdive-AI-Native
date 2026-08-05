export type SuperAdminProfile = {
  fullName: string;
  email: string;
};

export const SUPER_ADMIN_DEMO_PROFILE: SuperAdminProfile = {
  fullName: "Alex Morgan",
  email: "alex.morgan@proofdive.com",
};

export type SuperAdminAuditActivityType =
  | "organizations"
  | "partners"
  | "content"
  | "competency"
  | "billing"
  | "profile"
  | "support";

export const SUPER_ADMIN_AUDIT_ACTIVITY_LABEL: Record<SuperAdminAuditActivityType, string> = {
  organizations: "Organizations",
  partners: "Partners",
  content: "Content",
  competency: "Competency",
  billing: "Billing",
  profile: "Profile",
  support: "Support",
};

export type SuperAdminAuditLogEntry = {
  id: string;
  description: string;
  performedBy: string;
  timestamp: string;
  activityType: SuperAdminAuditActivityType;
};

export function buildSeedSuperAdminAuditLog(performedBy: string): SuperAdminAuditLogEntry[] {
  return [
    {
      id: "sa_log_1",
      description: `${performedBy} onboarded ABC University and sent organization admin invitation.`,
      performedBy,
      timestamp: "2026-07-28T09:14:00.000Z",
      activityType: "organizations",
    },
    {
      id: "sa_log_2",
      description: `${performedBy} created competency framework version 1.3 from the default competency model.`,
      performedBy,
      timestamp: "2026-07-25T11:02:00.000Z",
      activityType: "competency",
    },
    {
      id: "sa_log_3",
      description: `${performedBy} published the course ‘Interview Storytelling Fundamentals’.`,
      performedBy,
      timestamp: "2026-07-22T16:40:00.000Z",
      activityType: "content",
    },
    {
      id: "sa_log_4",
      description: `${performedBy} deactivated Partner ‘John Smith’ and disabled associated referral code.`,
      performedBy,
      timestamp: "2026-07-18T13:20:00.000Z",
      activityType: "partners",
    },
    {
      id: "sa_log_5",
      description: `${performedBy} updated subscription allocation for XYZ Employer (500 Mock Interviews, 20 JDs).`,
      performedBy,
      timestamp: "2026-07-12T10:05:00.000Z",
      activityType: "billing",
    },
    {
      id: "sa_log_6",
      description: `${performedBy} marked support request sr_005 as resolved.`,
      performedBy,
      timestamp: "2026-07-10T14:30:00.000Z",
      activityType: "support",
    },
    {
      id: "sa_log_7",
      description: `${performedBy} updated profile full name.`,
      performedBy,
      timestamp: "2026-07-05T08:00:00.000Z",
      activityType: "profile",
    },
  ];
}
