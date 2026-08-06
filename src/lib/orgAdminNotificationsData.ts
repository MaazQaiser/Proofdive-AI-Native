import { ORG_ADMIN_POLICY_UPDATES } from "@/lib/orgAdminPolicyUpdates";

export type OrgAdminNotificationKind =
  | "user_onboarded"
  | "invoice_ready"
  | "addon_purchased"
  | "usage_limit"
  | "policy";

export type OrgAdminNotification = {
  id: string;
  kind: OrgAdminNotificationKind;
  message: string;
  timestamp: string;
  /** Policy notifications: update title. */
  title?: string;
  /** Policy notifications: short summary. */
  summary?: string;
  /** Policy notifications: effective date (YYYY-MM-DD). */
  effectiveDate?: string;
  /** Link to related resource or policy document. */
  href?: string;
  /** Present for policy notifications — acknowledgement id. */
  policyId?: string;
};

const [privacyUpdate, termsUpdate] = ORG_ADMIN_POLICY_UPDATES;

export const SEED_ORG_ADMIN_NOTIFICATIONS: OrgAdminNotification[] = [
  {
    id: "oan_1",
    kind: "user_onboarded",
    message: "New user successfully onboarded: Jordan Lee (jordan.lee@acmerobotics.com).",
    timestamp: "2026-07-30T16:10:00.000Z",
  },
  {
    id: "oan_2",
    kind: "usage_limit",
    message: "Subscription usage limit nearing: Mock Interviews at 90% of allocation.",
    timestamp: "2026-07-29T11:00:00.000Z",
  },
  {
    id: "oan_3",
    kind: "addon_purchased",
    message: "Additional credits/add-ons successfully purchased: +50 Mock Interviews.",
    timestamp: "2026-07-28T09:45:00.000Z",
  },
  {
    id: "oan_4",
    kind: "invoice_ready",
    message: "Invoice generated/ready: INV-2026-0042 for July 2026 billing cycle.",
    timestamp: "2026-07-27T08:00:00.000Z",
  },
  {
    id: "oan_5",
    kind: "usage_limit",
    message: "Subscription usage limit reached: Storyboard Crafts allocation exhausted.",
    timestamp: "2026-07-20T14:30:00.000Z",
  },
  {
    id: "oan_6",
    kind: "policy",
    message: privacyUpdate.title,
    title: privacyUpdate.title,
    summary: privacyUpdate.summary,
    effectiveDate: privacyUpdate.effectiveDate,
    timestamp: "2026-06-15T08:00:00.000Z",
    href: privacyUpdate.href,
    policyId: privacyUpdate.id,
  },
  {
    id: "oan_7",
    kind: "policy",
    message: termsUpdate.title,
    title: termsUpdate.title,
    summary: termsUpdate.summary,
    effectiveDate: termsUpdate.effectiveDate,
    timestamp: "2026-03-01T08:00:00.000Z",
    href: termsUpdate.href,
    policyId: termsUpdate.id,
  },
];
