export type OrgAdminUserRole = "admin" | "manager" | "learner";
export type OrgAdminUserStatus = "invited" | "active" | "inactive";

export type OrgAdminUser = {
  id: string;
  name: string;
  email: string;
  role: OrgAdminUserRole;
  status: OrgAdminUserStatus;
  phone: string;
  /** ISO date. */
  invitedDate: string;
  /** ISO date, null until the user is first activated. */
  joinedDate: string | null;
};

export const ORG_ADMIN_USER_ROLE_LABEL: Record<OrgAdminUserRole, string> = {
  admin: "Admin",
  manager: "Manager",
  learner: "Learner",
};

export const ORG_ADMIN_USER_STATUS_LABEL: Record<OrgAdminUserStatus, string> = {
  invited: "Invited",
  active: "Active",
  inactive: "Inactive",
};

/** Mock user directory for the fixed demo org (no backend yet — mutated in-memory per session). */
export const ORG_ADMIN_USERS: OrgAdminUser[] = [
  {
    id: "orguser_001",
    name: "John Doe",
    email: "john.doe@acmerobotics.com",
    role: "learner",
    status: "inactive",
    phone: "555-0101",
    invitedDate: "2026-05-02",
    joinedDate: "2026-05-04",
  },
  {
    id: "orguser_002",
    name: "Priya Sharma",
    email: "priya.sharma@acmerobotics.com",
    role: "learner",
    status: "active",
    phone: "555-0102",
    invitedDate: "2026-05-10",
    joinedDate: "2026-05-11",
  },
  {
    id: "orguser_003",
    name: "Miguel Santos",
    email: "miguel.santos@acmerobotics.com",
    role: "learner",
    status: "invited",
    phone: "555-0103",
    invitedDate: "2026-07-15",
    joinedDate: null,
  },
  {
    id: "orguser_004",
    name: "Amara Okafor",
    email: "amara.okafor@acmerobotics.com",
    role: "manager",
    status: "active",
    phone: "555-0104",
    invitedDate: "2026-04-20",
    joinedDate: "2026-04-22",
  },
  {
    id: "orguser_005",
    name: "Wei Chen",
    email: "wei.chen@acmerobotics.com",
    role: "manager",
    status: "invited",
    phone: "555-0105",
    invitedDate: "2026-07-18",
    joinedDate: null,
  },
  {
    id: "orguser_006",
    name: "Sara Ahmed",
    email: "sara.ahmed@acmerobotics.com",
    role: "admin",
    status: "active",
    phone: "555-0106",
    invitedDate: "2026-03-01",
    joinedDate: "2026-03-02",
  },
  {
    id: "orguser_007",
    name: "David Kim",
    email: "david.kim@acmerobotics.com",
    role: "admin",
    status: "inactive",
    phone: "555-0107",
    invitedDate: "2026-02-14",
    joinedDate: "2026-02-16",
  },
];

export type OrgAdminPasswordPolicy = {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumber: boolean;
  requireSpecialChar: boolean;
};

/** Standalone mock policy config — has no functional effect on the app's actual password-creation flows. */
export const DEFAULT_ORG_ADMIN_PASSWORD_POLICY: OrgAdminPasswordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};
