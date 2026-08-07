"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Handshake,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { KpiCard, KpiRow } from "@/components/dashboard/KpiCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { PageTitle } from "@/components/ui/page-title";
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

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50] as const;

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
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(ROWS_PER_PAGE_OPTIONS[0]);

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

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageEnd = Math.min(pageStart + rowsPerPage, filteredRows.length);
  const pageRows = filteredRows.slice(pageStart, pageEnd);

  function resetToFirstPage() {
    setPage(1);
  }

  /** KPIs are platform-wide for the date range (before search/type filters), per story. */
  const kpis = useMemo(() => computeCommissionKpis(baseRows), [baseRows]);

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
    <div className="-mx-6 flex h-full min-w-0 flex-col overflow-hidden">
      <PageHeader>
        <PageTitle>Commissions &amp; Payouts</PageTitle>
        <Button variant="outline" onClick={handleExport} disabled={filteredRows.length === 0}>
          <Download className="h-4 w-4" />
          Export Listing
        </Button>
      </PageHeader>

      <div className="shrink-0 border-b border-border px-6">
        <KpiRow>
          <KpiCard label="Total Commissions Generated" value={formatCents(kpis.totalCents)} />
          <KpiCard label="Tiered" value={formatCents(kpis.tieredCents)} />
          <KpiCard label="Percentage-Based" value={formatCents(kpis.percentageCents)} />
          <KpiCard label="Fixed" value={formatCents(kpis.fixedCents)} />
        </KpiRow>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border px-6 py-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetToFirstPage();
            }}
            placeholder="Search partners by name, email, or code"
            className="pl-9"
          />
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Select
          value={dateRange}
          onValueChange={(v) => {
            setDateRange(v as SuperAdminCommissionDateRange);
            resetToFirstPage();
          }}
        >
          <SelectTrigger size="sm" variant="filter" active={dateRange !== "all_time"}>
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
          onValueChange={(v) => {
            setCommissionFilter(v as CommissionType | "all");
            resetToFirstPage();
          }}
        >
          <SelectTrigger size="sm" variant="filter" active={commissionFilter !== "all"}>
            <SelectValue placeholder="Commission Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Commission Types</SelectItem>
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
          onValueChange={(v) => {
            setPartnerTypeFilter(v as PartnerType | "all");
            resetToFirstPage();
          }}
        >
          <SelectTrigger size="sm" variant="filter" active={partnerTypeFilter !== "all"}>
            <SelectValue placeholder="Partner Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Partner Types</SelectItem>
            {(Object.entries(PARTNER_TYPE_LABEL) as [PartnerType, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        {pageRows.length === 0 ? (
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
            <TableHeader sticky>
              <TableRow>
                <TableHead className="text-overline pl-6 text-muted-foreground">Partner Name</TableHead>
                <TableHead className="text-overline text-muted-foreground">Partner Type</TableHead>
                <TableHead className="text-overline text-muted-foreground">Commission Type</TableHead>
                <TableHead className="text-overline text-muted-foreground">Total Earned</TableHead>
                <TableHead className="text-overline pr-6 text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map(({ partner, totalEarnedCents }) => (
                <TableRow key={partner.id}>
                  <TableCell className="pl-6">
                    <button
                      type="button"
                      onClick={() => router.push(`/superadmin/commissions/${partner.id}`)}
                      className="text-left font-semibold text-text-primary hover:underline"
                    >
                      {partner.fullName}
                    </button>
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {PARTNER_TYPE_LABEL[partner.partnerType]}
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {COMMISSION_TYPE_LABEL[partner.commissionType]}
                  </TableCell>
                  <TableCell className="text-body-sm font-medium text-foreground">
                    {formatCents(totalEarnedCents)}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-extended-dark-cyan hover:bg-transparent hover:text-extended-dark-cyan"
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

        <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-4 border-t border-border app-canvas-wash px-6 py-4">
          <div className="text-caption flex items-center gap-2 text-muted-foreground">
            <span>Rows per page</span>
            <Select
              value={String(rowsPerPage)}
              onValueChange={(v) => {
                setRowsPerPage(Number(v));
                resetToFirstPage();
              }}
            >
              <SelectTrigger size="sm" className="w-[72px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROWS_PER_PAGE_OPTIONS.map((n) => (
                  <SelectItem key={n} value={String(n)}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-caption flex items-center gap-4 text-muted-foreground">
            <span>
              {`page ${currentPage} of ${totalPages}`}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setPage(1)}
                aria-label="First page"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                disabled={currentPage === totalPages}
                onClick={() => setPage(totalPages)}
                aria-label="Last page"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
