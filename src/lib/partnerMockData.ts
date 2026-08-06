import type { PaymentMethod } from "@/lib/orgAdminBillingData";

export type PartnerDateRangeGranularity = "weekly" | "monthly" | "all_time";

export type ConversionStatusFilter = "all" | "converted" | "not_converted";

export type FunnelStage = {
  key: string;
  label: string;
  count: number;
};

export type PartnerDashboardDataset = {
  totalSignups: number;
  totalEarningsCents: number;
  totalReferrals: number;
  funnel: FunnelStage[];
};

export const PARTNER_DATE_RANGE_OPTIONS: { value: PartnerDateRangeGranularity; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "all_time", label: "Lifetime" },
];

export const PARTNER_DASHBOARD_DATA: Record<PartnerDateRangeGranularity, PartnerDashboardDataset> = {
  weekly: {
    totalSignups: 18,
    totalEarningsCents: 8400,
    totalReferrals: 52,
    funnel: [
      { key: "referral", label: "Referral Code Used", count: 52 },
      { key: "signup", label: "User Signed Up", count: 18 },
      { key: "onboarding", label: "Completed Onboarding", count: 12 },
      { key: "interview", label: "Completed Mock Interview", count: 7 },
      { key: "paid", label: "Converted to Paid", count: 3 },
    ],
  },
  monthly: {
    totalSignups: 64,
    totalEarningsCents: 42000,
    totalReferrals: 180,
    funnel: [
      { key: "referral", label: "Referral Code Used", count: 180 },
      { key: "signup", label: "User Signed Up", count: 64 },
      { key: "onboarding", label: "Completed Onboarding", count: 48 },
      { key: "interview", label: "Completed Mock Interview", count: 28 },
      { key: "paid", label: "Converted to Paid", count: 14 },
    ],
  },
  all_time: {
    totalSignups: 186,
    totalEarningsCents: 162000,
    totalReferrals: 420,
    funnel: [
      { key: "referral", label: "Referral Code Used", count: 420 },
      { key: "signup", label: "User Signed Up", count: 186 },
      { key: "onboarding", label: "Completed Onboarding", count: 142 },
      { key: "interview", label: "Completed Mock Interview", count: 88 },
      { key: "paid", label: "Converted to Paid", count: 54 },
    ],
  },
};

export type PartnerCommissionInvoice = {
  id: string;
  invoiceNumber: string;
  date: string;
  amountCents: number;
  period: string;
};

export const SEED_PARTNER_COMMISSION_INVOICES: PartnerCommissionInvoice[] = [
  { id: "pinv_1", invoiceNumber: "PINV-2026-0007", date: "2026-07-01", amountCents: 42000, period: "July 2026" },
  { id: "pinv_2", invoiceNumber: "PINV-2026-0006", date: "2026-06-01", amountCents: 38500, period: "June 2026" },
  { id: "pinv_3", invoiceNumber: "PINV-2026-0005", date: "2026-05-01", amountCents: 31200, period: "May 2026" },
  { id: "pinv_4", invoiceNumber: "PINV-2026-0004", date: "2026-04-01", amountCents: 27800, period: "April 2026" },
  { id: "pinv_5", invoiceNumber: "PINV-2026-0003", date: "2026-03-01", amountCents: 22500, period: "March 2026" },
];

export type PartnerWithdrawal = {
  id: string;
  requestDate: string;
  amountCents: number;
  paymentMethodLabel: string;
};

export const SEED_PARTNER_WITHDRAWALS: PartnerWithdrawal[] = [
  {
    id: "pwd_1",
    requestDate: "2026-06-15",
    amountCents: 50000,
    paymentMethodLabel: "Visa •••• 4242",
  },
  {
    id: "pwd_2",
    requestDate: "2026-04-20",
    amountCents: 35000,
    paymentMethodLabel: "Visa •••• 4242",
  },
];

/** Seed totals: earnings 162000, withdrawn 85000 → available 77000. */
export const SEED_PARTNER_TOTAL_EARNINGS_CENTS = 162000;
export const SEED_PARTNER_TOTAL_WITHDRAWN_CENTS = 85000;

export const SEED_PARTNER_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "ppm_1", brand: "Visa", last4: "4242", expMonth: 9, expYear: 2028, isDefault: true },
];

export type PartnerNotificationKind = "invoice" | "referral" | "policy";

export type PartnerNotification = {
  id: string;
  kind: PartnerNotificationKind;
  message: string;
  timestamp: string;
  /** Policy notifications: update title. */
  title?: string;
  /** Policy notifications: short summary. */
  summary?: string;
  /** Policy notifications: effective date (YYYY-MM-DD). */
  effectiveDate?: string;
  /** Present for policy notifications — links to policy page. */
  href?: string;
  policyId?: string;
};

export const SEED_PARTNER_NOTIFICATIONS: PartnerNotification[] = [
  {
    id: "pn_1",
    kind: "invoice",
    message: "Your July 2026 commission invoice (PINV-2026-0007) is ready to download.",
    timestamp: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "pn_2",
    kind: "referral",
    message: "A new user signed up using your referral code MAYACH42.",
    timestamp: "2026-07-28T14:22:00.000Z",
  },
  {
    id: "pn_3",
    kind: "referral",
    message: "A referred user completed onboarding through your referral link.",
    timestamp: "2026-07-25T11:05:00.000Z",
  },
  {
    id: "pn_4",
    kind: "policy",
    message: "Privacy Policy update",
    title: "Privacy Policy update",
    summary: "Clarified how partner referral and commission data is processed and retained.",
    effectiveDate: "2026-06-15",
    timestamp: "2026-06-15T08:00:00.000Z",
    href: "/privacy",
    policyId: "privacy-2026-06",
  },
  {
    id: "pn_5",
    kind: "policy",
    message: "Terms & Conditions update",
    title: "Terms & Conditions update",
    summary: "Updated affiliate terms covering commission payouts and referral attribution.",
    effectiveDate: "2026-03-01",
    timestamp: "2026-03-01T08:00:00.000Z",
    href: "/terms",
    policyId: "terms-2026-03",
  },
];

export type PartnerAuditLogEntry = {
  id: string;
  timestamp: string;
  activityType: "profile" | "login" | "withdrawal" | "support";
  description: string;
};

export function buildSeedPartnerAuditLog(partnerName: string): PartnerAuditLogEntry[] {
  return [
    {
      id: "paud_1",
      timestamp: "2026-07-28T10:15:00.000Z",
      activityType: "login",
      description: `${partnerName} signed in to the Partner portal.`,
    },
    {
      id: "paud_2",
      timestamp: "2026-06-15T16:40:00.000Z",
      activityType: "withdrawal",
      description: `${partnerName} withdrew $500.00 to Visa •••• 4242.`,
    },
    {
      id: "paud_3",
      timestamp: "2026-05-02T09:20:00.000Z",
      activityType: "profile",
      description: `${partnerName} updated phone number on profile.`,
    },
    {
      id: "paud_4",
      timestamp: "2026-04-10T13:00:00.000Z",
      activityType: "support",
      description: `${partnerName} submitted a support request.`,
    },
  ];
}

export const PARTNER_AUDIT_ACTIVITY_LABEL: Record<PartnerAuditLogEntry["activityType"], string> = {
  profile: "Profile",
  login: "Login",
  withdrawal: "Withdrawal",
  support: "Support",
};

export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}
