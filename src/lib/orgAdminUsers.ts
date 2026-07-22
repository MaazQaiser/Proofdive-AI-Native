export type OrgAdminUserStatus = "invited" | "active" | "inactive";

export type OrgAdminUser = {
  id: string;
  name: string;
  email: string;
  status: OrgAdminUserStatus;
  /** ISO date. */
  invitedDate: string;
  /** ISO date, null until the user is first activated. */
  joinedDate: string | null;
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
    status: "inactive",
    invitedDate: "2026-05-02",
    joinedDate: "2026-05-04",
  },
  {
    id: "orguser_002",
    name: "Priya Sharma",
    email: "priya.sharma@acmerobotics.com",
    status: "active",
    invitedDate: "2026-05-10",
    joinedDate: "2026-05-11",
  },
  {
    id: "orguser_003",
    name: "Miguel Santos",
    email: "miguel.santos@acmerobotics.com",
    status: "invited",
    invitedDate: "2026-07-15",
    joinedDate: null,
  },
  {
    id: "orguser_004",
    name: "Amara Okafor",
    email: "amara.okafor@acmerobotics.com",
    status: "active",
    invitedDate: "2026-04-20",
    joinedDate: "2026-04-22",
  },
  {
    id: "orguser_005",
    name: "Wei Chen",
    email: "wei.chen@acmerobotics.com",
    status: "invited",
    invitedDate: "2026-07-18",
    joinedDate: null,
  },
  {
    id: "orguser_006",
    name: "Sara Ahmed",
    email: "sara.ahmed@acmerobotics.com",
    status: "active",
    invitedDate: "2026-03-01",
    joinedDate: "2026-03-02",
  },
  {
    id: "orguser_007",
    name: "David Kim",
    email: "david.kim@acmerobotics.com",
    status: "inactive",
    invitedDate: "2026-02-14",
    joinedDate: "2026-02-16",
  },
];
