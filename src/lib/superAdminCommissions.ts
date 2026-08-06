import type { PartnerCommissionInvoice } from "@/lib/partnerMockData";
import { formatCents } from "@/lib/partnerMockData";
import type { CommissionType, Partner, PartnerType } from "@/lib/superAdminPartners";

export type SuperAdminCommissionDateRange = "monthly" | "quarterly" | "ytd" | "all_time";

export const SUPER_ADMIN_COMMISSION_DATE_RANGE_OPTIONS: {
  value: SuperAdminCommissionDateRange;
  label: string;
}[] = [
  { value: "monthly", label: "Monthly (Jul 2026)" },
  { value: "quarterly", label: "Quarterly (Q2 2026)" },
  { value: "ytd", label: "Year to Date 2026" },
  { value: "all_time", label: "Lifetime" },
];

export type PartnerCommissionRecord = PartnerCommissionInvoice & {
  partnerId: string;
};

/** Platform-wide commission invoices keyed by partner (mock). */
export const SUPER_ADMIN_COMMISSION_INVOICES: PartnerCommissionRecord[] = [
  // partner_001 — Maya Chen (percentage)
  { id: "sc_inv_001_1", partnerId: "partner_001", invoiceNumber: "PINV-2026-0007", date: "2026-07-01", amountCents: 42000, period: "July 2026" },
  { id: "sc_inv_001_2", partnerId: "partner_001", invoiceNumber: "PINV-2026-0006", date: "2026-06-01", amountCents: 38500, period: "June 2026" },
  { id: "sc_inv_001_3", partnerId: "partner_001", invoiceNumber: "PINV-2026-0005", date: "2026-05-01", amountCents: 31200, period: "May 2026" },
  { id: "sc_inv_001_4", partnerId: "partner_001", invoiceNumber: "PINV-2026-0004", date: "2026-04-01", amountCents: 27800, period: "April 2026" },
  { id: "sc_inv_001_5", partnerId: "partner_001", invoiceNumber: "PINV-2026-0003", date: "2026-03-01", amountCents: 22500, period: "March 2026" },
  // partner_002 — Campus Launch (tiered)
  { id: "sc_inv_002_1", partnerId: "partner_002", invoiceNumber: "PINV-2026-0012", date: "2026-07-01", amountCents: 68000, period: "July 2026" },
  { id: "sc_inv_002_2", partnerId: "partner_002", invoiceNumber: "PINV-2026-0011", date: "2026-06-01", amountCents: 72000, period: "June 2026" },
  { id: "sc_inv_002_3", partnerId: "partner_002", invoiceNumber: "PINV-2026-0010", date: "2026-05-01", amountCents: 55000, period: "May 2026" },
  { id: "sc_inv_002_4", partnerId: "partner_002", invoiceNumber: "PINV-2026-0009", date: "2026-04-01", amountCents: 48000, period: "April 2026" },
  { id: "sc_inv_002_5", partnerId: "partner_002", invoiceNumber: "PINV-2026-0008", date: "2026-02-01", amountCents: 45000, period: "February 2026" },
  // partner_003 — Jordan Blake (fixed)
  { id: "sc_inv_003_1", partnerId: "partner_003", invoiceNumber: "PINV-2026-0018", date: "2026-07-01", amountCents: 84000, period: "July 2026" },
  { id: "sc_inv_003_2", partnerId: "partner_003", invoiceNumber: "PINV-2026-0017", date: "2026-06-01", amountCents: 91000, period: "June 2026" },
  { id: "sc_inv_003_3", partnerId: "partner_003", invoiceNumber: "PINV-2026-0016", date: "2026-05-01", amountCents: 77000, period: "May 2026" },
  { id: "sc_inv_003_4", partnerId: "partner_003", invoiceNumber: "PINV-2026-0015", date: "2026-04-01", amountCents: 70000, period: "April 2026" },
  { id: "sc_inv_003_5", partnerId: "partner_003", invoiceNumber: "PINV-2026-0014", date: "2026-01-01", amountCents: 98000, period: "January 2026" },
  // partner_004 — TalentBridge (percentage, inactive — still has history)
  { id: "sc_inv_004_1", partnerId: "partner_004", invoiceNumber: "PINV-2026-0020", date: "2026-05-01", amountCents: 22000, period: "May 2026" },
  { id: "sc_inv_004_2", partnerId: "partner_004", invoiceNumber: "PINV-2026-0019", date: "2026-04-01", amountCents: 18000, period: "April 2026" },
  { id: "sc_inv_004_3", partnerId: "partner_004", invoiceNumber: "PINV-2026-0013", date: "2026-03-01", amountCents: 26000, period: "March 2026" },
  // partner_005 — Aisha Rahman (percentage)
  { id: "sc_inv_005_1", partnerId: "partner_005", invoiceNumber: "PINV-2026-0024", date: "2026-07-01", amountCents: 28000, period: "July 2026" },
  { id: "sc_inv_005_2", partnerId: "partner_005", invoiceNumber: "PINV-2026-0023", date: "2026-06-01", amountCents: 31000, period: "June 2026" },
  { id: "sc_inv_005_3", partnerId: "partner_005", invoiceNumber: "PINV-2026-0022", date: "2026-05-01", amountCents: 25000, period: "May 2026" },
  { id: "sc_inv_005_4", partnerId: "partner_005", invoiceNumber: "PINV-2026-0021", date: "2026-03-01", amountCents: 30000, period: "March 2026" },
];

export function invoiceInDateRange(
  invoice: Pick<PartnerCommissionRecord, "date">,
  range: SuperAdminCommissionDateRange,
): boolean {
  const month = invoice.date.slice(0, 7); // YYYY-MM
  if (range === "all_time") return true;
  if (range === "monthly") return month === "2026-07";
  if (range === "quarterly") return month >= "2026-04" && month <= "2026-06";
  if (range === "ytd") return invoice.date.startsWith("2026-");
  return true;
}

export type PartnerCommissionRow = {
  partner: Partner;
  totalEarnedCents: number;
  invoiceCount: number;
};

export function buildCommissionListingRows(
  partners: Partner[],
  invoices: PartnerCommissionRecord[],
  dateRange: SuperAdminCommissionDateRange,
): PartnerCommissionRow[] {
  const scoped = invoices.filter((inv) => invoiceInDateRange(inv, dateRange));
  const byPartner = new Map<string, { total: number; count: number }>();

  for (const inv of scoped) {
    const current = byPartner.get(inv.partnerId) ?? { total: 0, count: 0 };
    current.total += inv.amountCents;
    current.count += 1;
    byPartner.set(inv.partnerId, current);
  }

  const rows: PartnerCommissionRow[] = [];
  for (const partner of partners) {
    const stats = byPartner.get(partner.id);
    if (!stats || stats.count === 0) continue;
    rows.push({
      partner,
      totalEarnedCents: stats.total,
      invoiceCount: stats.count,
    });
  }

  return rows.sort((a, b) => b.totalEarnedCents - a.totalEarnedCents);
}

export type CommissionKpis = {
  totalCents: number;
  tieredCents: number;
  percentageCents: number;
  fixedCents: number;
};

export function computeCommissionKpis(rows: PartnerCommissionRow[]): CommissionKpis {
  const kpis: CommissionKpis = {
    totalCents: 0,
    tieredCents: 0,
    percentageCents: 0,
    fixedCents: 0,
  };

  for (const row of rows) {
    kpis.totalCents += row.totalEarnedCents;
    if (row.partner.commissionType === "tiered") kpis.tieredCents += row.totalEarnedCents;
    else if (row.partner.commissionType === "percentage") kpis.percentageCents += row.totalEarnedCents;
    else if (row.partner.commissionType === "fixed") kpis.fixedCents += row.totalEarnedCents;
  }

  return kpis;
}

export function filterCommissionRows(
  rows: PartnerCommissionRow[],
  opts: {
    search: string;
    commissionType: CommissionType | "all";
    partnerType: PartnerType | "all";
  },
): PartnerCommissionRow[] {
  const q = opts.search.trim().toLowerCase();
  return rows.filter(({ partner }) => {
    if (
      q &&
      !partner.fullName.toLowerCase().includes(q) &&
      !partner.email.toLowerCase().includes(q) &&
      !partner.referralCode.toLowerCase().includes(q)
    ) {
      return false;
    }
    if (opts.commissionType !== "all" && partner.commissionType !== opts.commissionType) return false;
    if (opts.partnerType !== "all" && partner.partnerType !== opts.partnerType) return false;
    return true;
  });
}

export function invoicesForPartner(
  invoices: PartnerCommissionRecord[],
  partnerId: string,
  dateRange: SuperAdminCommissionDateRange,
): PartnerCommissionRecord[] {
  return invoices
    .filter((inv) => inv.partnerId === partnerId && invoiceInDateRange(inv, dateRange))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function exportCommissionListingCsv(rows: PartnerCommissionRow[]): string {
  const header = ["Partner Name", "Email", "Partner Type", "Commission Type", "Total Earned (USD)", "Invoice Count"];
  const lines = rows.map(({ partner, totalEarnedCents, invoiceCount }) =>
    [
      partner.fullName,
      partner.email,
      partner.partnerType,
      partner.commissionType,
      (totalEarnedCents / 100).toFixed(2),
      String(invoiceCount),
    ]
      .map((cell) => `"${cell.replace(/"/g, '""')}"`)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export { formatCents };
