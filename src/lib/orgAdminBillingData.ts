export type SubscriptionModuleUsage = { key: string; label: string; allocated: number; used: number };

export type SubscriptionModulePricing = SubscriptionModuleUsage & { unitPriceCents: number };

/** Current plan snapshot — real-time, not filtered by date range (shared with the Dashboard's Subscription donut). */
export const SUBSCRIPTION_PLAN_NAME = "Growth";

export const BASE_SUBSCRIPTION_MODULES: SubscriptionModulePricing[] = [
  { key: "mockInterviews", label: "Mock Interviews", allocated: 1000, used: 650, unitPriceCents: 500 },
  { key: "storyboards", label: "Storyboards", allocated: 500, used: 210, unitPriceCents: 300 },
];

/** Additional allocation purchased per module key, keyed the same as BASE_SUBSCRIPTION_MODULES. */
export type BillingAddOnDeltas = Record<string, number>;

export function applyAddOnDeltas<T extends SubscriptionModuleUsage>(modules: T[], deltas: BillingAddOnDeltas): T[] {
  return modules.map((m) => ({ ...m, allocated: m.allocated + (deltas[m.key] ?? 0) }));
}

export type PaymentMethod = {
  id: string;
  brand: "Visa" | "Mastercard" | "Amex";
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

export const SEED_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm_1", brand: "Visa", last4: "4242", expMonth: 8, expYear: 2027, isDefault: true },
];

export type InvoiceStatus = "paid" | "pending" | "failed";

export type Invoice = {
  id: string;
  invoiceNumber: string;
  paymentDate: string;
  amountCents: number;
  status: InvoiceStatus;
};

export const INVOICE_STATUS_LABEL: Record<InvoiceStatus, string> = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
};

export const SEED_INVOICES: Invoice[] = [
  { id: "inv_1", invoiceNumber: "INV-2026-0006", paymentDate: "2026-07-01", amountCents: 24900, status: "paid" },
  { id: "inv_2", invoiceNumber: "INV-2026-0005", paymentDate: "2026-06-01", amountCents: 24900, status: "paid" },
  { id: "inv_3", invoiceNumber: "INV-2026-0004", paymentDate: "2026-05-01", amountCents: 24900, status: "paid" },
  { id: "inv_4", invoiceNumber: "INV-2026-0003", paymentDate: "2026-04-01", amountCents: 24900, status: "failed" },
];
