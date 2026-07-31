export type SuperAdminNotificationKind =
  | "org_onboarded"
  | "employer_onboarded"
  | "partner_onboarded"
  | "support_request"
  | "subscription_request"
  | "deletion_request"
  | "subscription_expiring"
  | "subscription_expired";

export type SuperAdminNotification = {
  id: string;
  kind: SuperAdminNotificationKind;
  message: string;
  timestamp: string;
  href?: string;
};

export const SEED_SUPER_ADMIN_NOTIFICATIONS: SuperAdminNotification[] = [
  {
    id: "san_1",
    kind: "support_request",
    message: "New support request submitted: Referral code not applying at signup.",
    timestamp: "2026-07-30T14:22:00.000Z",
    href: "/superadmin/support",
  },
  {
    id: "san_2",
    kind: "partner_onboarded",
    message: "New Partner onboarded: Aisha Rahman (AISHA55).",
    timestamp: "2026-07-29T12:00:00.000Z",
    href: "/superadmin/partners",
  },
  {
    id: "san_3",
    kind: "subscription_request",
    message: "Subscription / Add-on request submitted by admin@acmerobotics.com.",
    timestamp: "2026-07-29T09:10:00.000Z",
    href: "/superadmin/support",
  },
  {
    id: "san_4",
    kind: "org_onboarded",
    message: "New Organization onboarded: Stanford University. Admin invitation sent.",
    timestamp: "2026-07-28T08:15:00.000Z",
    href: "/superadmin/organizations",
  },
  {
    id: "san_5",
    kind: "deletion_request",
    message: "Revoke Consent / User Deletion request submitted by admin@acmerobotics.com.",
    timestamp: "2026-07-27T11:05:00.000Z",
    href: "/superadmin/support",
  },
  {
    id: "san_6",
    kind: "subscription_expiring",
    message: "Subscription expiring soon for Acme Robotics (expires 2026-08-10).",
    timestamp: "2026-07-26T07:00:00.000Z",
    href: "/superadmin/organizations",
  },
  {
    id: "san_7",
    kind: "employer_onboarded",
    message: "New Employer onboarded: Northwind Logistics.",
    timestamp: "2026-07-22T15:40:00.000Z",
    href: "/superadmin/employers",
  },
  {
    id: "san_8",
    kind: "subscription_expired",
    message: "Organization subscription expired: Maple Leaf Career Center.",
    timestamp: "2026-07-15T06:00:00.000Z",
    href: "/superadmin/organizations",
  },
];
