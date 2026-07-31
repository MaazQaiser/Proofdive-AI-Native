"use client";

import { Download, Handshake, Percent, Search, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { formatNumber } from "@/components/dashboard/format";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  SUPER_ADMIN_COMMISSION_DATE_RANGE_OPTIONS,
  SUPER_ADMIN_COMMISSION_INVOICES,
  buildCommissionListingRows,
  computeCommissionKpis,
  exportCommissionListingCsv,
  filterCommissionRows,
  formatCents,
  type SuperAdminCommissionDateRange,
} from "@/lib/superAdminCommissions";
import {
  COMMISSION_TYPE_LABEL,
  PARTNER_TYPE_LABEL,
  type CommissionType,
  type PartnerType,
} from "@/lib/superAdminPartners";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { usePartners } from "@/lib/usePartners";

export function CommissionsListingScreen() {
  const router = useRouter();
  const { partners } = usePartners();
  const [dateRange, setDateRange] = useLocalStorageState<SuperAdminCommissionDateRange>(
    StorageKeys.superAdminCommissionsDateRange,
    "all_time",
  );
  const [search, setSearch] = useState("");
  const [commissionFilter, setCommissionFilter] = useState<CommissionType | "all">("all");
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<PartnerType | "all">("all");

  const baseRows = useMemo(
    () => buildCommissionListingRows(partners, SUPER_ADMIN_COMMISSION_INVOICES, dateRange),
    [partners, dateRange],
  );

  const filteredRows = useMemo(
    () =>
      filterCommissionRows(baseRows, {
        search,
        commissionType: commissionFilter,
        partnerType: partnerTypeFilter,
      }),
    [baseRows, search, commissionFilter, partnerTypeFilter],
  );

  /** KPIs are platform-wide for the date range (before search/type filters), per story. */
  const kpis = useMemo(() => computeCommissionKpis(baseRows), [baseRows]);

  const dateRangeLabel =
    SUPER_ADMIN_COMMISSION_DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)?.label ?? dateRange;

  function handleExport() {
    try {
      if (filteredRows.length === 0) {
        toast.error("Unable to export listing at this time. Please try again.");
        return;
      }
      const csv = exportCommissionListingCsv(filteredRows);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `proofdive-commissions-${dateRange}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Listing exported successfully.");
    } catch {
      toast.error("Unable to export listing at this time. Please try again.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-h5 text-foreground">Commissions &amp; Payouts</h1>
          <p className="mt-0.5 text-caption text-muted-foreground">
            Platform-wide partner commission activity and earnings oversight.
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} disabled={filteredRows.length === 0}>
          <Download className="h-4 w-4" />
          Export Listing
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Commissions Generated"
          value={formatCents(kpis.totalCents)}
          icon={Wallet}
        />
        <KpiCard label="Tiered" value={formatCents(kpis.tieredCents)} icon={Handshake} />
        <KpiCard label="Percentage-Based" value={formatCents(kpis.percentageCents)} icon={Percent} />
        <KpiCard label="Fixed" value={formatCents(kpis.fixedCents)} icon={Wallet} />
      </div>

      <div className="flex flex-col gap-3 rounded-md border border-border p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search partners by name, email, or code"
              className="pl-9"
            />
          </div>
          <Separator orientation="vertical" className="hidden h-6 sm:block" />
          <Select
            value={dateRange}
            onValueChange={(v) => setDateRange(v as SuperAdminCommissionDateRange)}
          >
            <SelectTrigger size="sm" className="w-[200px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              {SUPER_ADMIN_COMMISSION_DATE_RANGE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={commissionFilter}
            onValueChange={(v) => setCommissionFilter(v as CommissionType | "all")}
          >
            <SelectTrigger size="sm" className="w-[180px]">
              <SelectValue placeholder="Commission Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Commission Types</SelectItem>
              {(Object.entries(COMMISSION_TYPE_LABEL) as [CommissionType, string][]).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
          <Select
            value={partnerTypeFilter}
            onValueChange={(v) => setPartnerTypeFilter(v as PartnerType | "all")}
          >
            <SelectTrigger size="sm" className="w-[220px]">
              <SelectValue placeholder="Partner Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Partner Types</SelectItem>
              {(Object.entries(PARTNER_TYPE_LABEL) as [PartnerType, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-caption text-muted-foreground">Applied filters:</span>
          <Badge variant="secondary">{dateRangeLabel}</Badge>
          <Badge variant="secondary">
            {commissionFilter === "all" ? "All commission types" : COMMISSION_TYPE_LABEL[commissionFilter]}
          </Badge>
          <Badge variant="secondary">
            {partnerTypeFilter === "all" ? "All partner types" : PARTNER_TYPE_LABEL[partnerTypeFilter]}
          </Badge>
          {search.trim() ? <Badge variant="secondary">Search: “{search.trim()}”</Badge> : null}
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        {filteredRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-20 text-center">
            <Handshake className="h-8 w-8 text-muted-foreground" />
            <p className="text-body-sm font-medium text-foreground">
              {baseRows.length === 0
                ? dateRange !== "all_time"
                  ? "No data available for the selected filters."
                  : "No partners with commission activity found."
                : "No matching partners found."}
            </p>
          </div>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="border-b border-border bg-background">
              <TableRow>
                <TableHead className="text-overline pl-4 text-muted-foreground">Partner Name</TableHead>
                <TableHead className="text-overline text-muted-foreground">Partner Type</TableHead>
                <TableHead className="text-overline text-muted-foreground">Commission Type</TableHead>
                <TableHead className="text-overline text-muted-foreground">Total Earned</TableHead>
                <TableHead className="text-overline pr-4 text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map(({ partner, totalEarnedCents, invoiceCount }) => (
                <TableRow key={partner.id}>
                  <TableCell className="pl-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{partner.fullName}</span>
                      <span className="text-caption text-muted-foreground">{partner.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {PARTNER_TYPE_LABEL[partner.partnerType]}
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {COMMISSION_TYPE_LABEL[partner.commissionType]}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-body-sm font-medium text-foreground">
                        {formatCents(totalEarnedCents)}
                      </span>
                      <span className="text-caption text-muted-foreground">
                        {formatNumber(invoiceCount)} invoice{invoiceCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="pr-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/superadmin/commissions/${partner.id}`)}
                    >
                      View Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </table>
        )}
      </div>
    </div>
  );
}
