"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CreditCard,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { KpiCard, KpiRow } from "@/components/dashboard/KpiCard";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusPill, type StatusTone } from "@/components/ui/status-pill";
import {
  BILLING_CYCLE_LABEL,
  BUNDLE_STATUS_LABEL,
  computeBundleSummary,
  formatUsd,
  type BillingCycle,
  type BundleStatus,
  type ClientType,
  type PaymentBundle,
} from "@/lib/superAdminPaymentsData";
import { usePaymentBundles } from "@/lib/usePaymentBundles";
import { useGlobalRates } from "@/lib/usePaymentRates";

import { PaymentsShell } from "./PaymentsShell";
import { BundleDetailDrawer } from "./BundleDetailDrawer";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50] as const;

function BundleStatusPill({ status }: { status: BundleStatus }) {
  const tone: StatusTone =
    status === "active" ? "success" : status === "draft" ? "warning" : "neutral";
  return <StatusPill tone={tone}>{BUNDLE_STATUS_LABEL[status]}</StatusPill>;
}

function formatUpdated(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatCyclesInline(bundle: PaymentBundle): string {
  if (bundle.cycles.length === 0) return "—";
  return bundle.cycles.map((c) => BILLING_CYCLE_LABEL[c.cycle]).join(", ");
}

function formatPricesInline(bundle: PaymentBundle): string {
  if (bundle.cycles.length === 0) return "—";
  return bundle.cycles.map((c) => formatUsd(c.price)).join(", ");
}

export function BundleListingScreen() {
  const router = useRouter();
  const { bundles, deactivate, reactivate, duplicate, hydrated } = usePaymentBundles();
  const { rates: globalRates } = useGlobalRates();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ClientType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<BundleStatus | "all">("all");
  const [cycleFilter, setCycleFilter] = useState<BillingCycle | "all">("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(ROWS_PER_PAGE_OPTIONS[0]);
  const [confirmDeactivate, setConfirmDeactivate] = useState<PaymentBundle | null>(null);
  const [reactivateErrors, setReactivateErrors] = useState<string[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedBundle = bundles.find((b) => b.id === selectedId) ?? null;
  const stats = useMemo(() => computeBundleSummary(bundles), [bundles]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return bundles.filter((b) => {
      if (typeFilter !== "all" && b.type !== typeFilter) return false;
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (cycleFilter !== "all" && !b.cycles.some((c) => c.cycle === cycleFilter)) return false;
      if (!q) return true;
      const hay = [
        b.name,
        b.type,
        b.status,
        ...b.cycles.map((c) => BILLING_CYCLE_LABEL[c.cycle]),
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [bundles, search, typeFilter, statusFilter, cycleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageEnd = Math.min(pageStart + rowsPerPage, filtered.length);
  const pageRows = filtered.slice(pageStart, pageEnd);

  function resetToFirstPage() {
    setPage(1);
  }

  function handleDuplicate(bundle: PaymentBundle) {
    const copy = duplicate(bundle.id);
    if (!copy) {
      toast.error("Could not duplicate bundle.");
      return;
    }
    toast.success(`Draft "${copy.name}" created.`);
    router.push(`/superadmin/payments/bundles/${copy.id}`);
  }

  function handleReactivate(bundle: PaymentBundle) {
    const result = reactivate(bundle.id, globalRates);
    if (!result.ok) {
      setReactivateErrors(result.errors);
      return;
    }
    toast.success(`"${bundle.name}" reactivated.`);
  }

  function confirmDeactivateAction() {
    if (!confirmDeactivate) return;
    deactivate(confirmDeactivate.id);
    toast.success(`"${confirmDeactivate.name}" deactivated.`);
    setConfirmDeactivate(null);
  }

  const emptyMessage =
    bundles.length === 0
      ? "No bundles found."
      : search.trim() || typeFilter !== "all" || statusFilter !== "all" || cycleFilter !== "all"
        ? "No matching bundles found."
        : "No bundles found.";

  return (
    <PaymentsShell
      title="Payments"
      actions={
        <Button asChild>
          <Link href="/superadmin/payments/bundles/new">
            <Plus className="h-4 w-4" />
            Create New Bundle
          </Link>
        </Button>
      }
    >
      <div className="shrink-0 border-b border-border px-6">
        <KpiRow>
          <KpiCard label="Total Active Bundles" value={String(stats.totalActiveBundles)} />
          <KpiCard label="Earnings" value={formatUsd(stats.earnings)} />
          <KpiCard label="Total Subscribers" value={String(stats.totalSubscribers)} />
          <KpiCard label="New Subscribers This Month" value={String(stats.newSubscribersThisMonth)} />
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
            placeholder="Search by Bundle Name"
            className="pl-9"
          />
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v as ClientType | "all");
            resetToFirstPage();
          }}
        >
          <SelectTrigger size="sm" variant="filter" active={typeFilter !== "all"}>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Types</SelectItem>
            <SelectItem value="B2C">B2C</SelectItem>
            <SelectItem value="B2B">B2B</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as BundleStatus | "all");
            resetToFirstPage();
          }}
        >
          <SelectTrigger size="sm" variant="filter" active={statusFilter !== "all"}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={cycleFilter}
          onValueChange={(v) => {
            setCycleFilter(v as BillingCycle | "all");
            resetToFirstPage();
          }}
        >
          <SelectTrigger size="sm" variant="filter" active={cycleFilter !== "all"}>
            <SelectValue placeholder="Billing Cycle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Cycles</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!hydrated ? (
          <p className="px-6 py-10 text-caption text-muted-foreground">Loading bundles…</p>
        ) : pageRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-20 text-center">
            <CreditCard className="h-8 w-8 text-muted-foreground" />
            <p className="text-body-sm font-medium text-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <TableHeader sticky>
              <TableRow>
                <TableHead className="text-overline pl-6 text-muted-foreground">Bundle Name</TableHead>
                <TableHead className="text-overline text-muted-foreground">Type</TableHead>
                <TableHead className="text-overline text-muted-foreground">Billing Cycle</TableHead>
                <TableHead className="text-overline text-muted-foreground">Price</TableHead>
                <TableHead className="text-overline text-muted-foreground">Last Updated</TableHead>
                <TableHead className="text-overline text-muted-foreground">Status</TableHead>
                <TableHead className="text-overline pr-6 text-right text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((bundle) => (
                <TableRow key={bundle.id}>
                  <TableCell className="pl-6">
                    <button
                      type="button"
                      className="text-left font-semibold text-text-primary hover:underline"
                      onClick={() => setSelectedId(bundle.id)}
                    >
                      {bundle.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">{bundle.type}</TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {formatCyclesInline(bundle)}
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {formatPricesInline(bundle)}
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {formatUpdated(bundle.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <BundleStatusPill status={bundle.status} />
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${bundle.name}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedId(bundle.id)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/superadmin/payments/bundles/${bundle.id}?edit=1`)
                          }
                        >
                          Edit Bundle
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(bundle)}>
                          Duplicate
                        </DropdownMenuItem>
                        {bundle.status === "active" || bundle.status === "inactive" ? (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant={bundle.status === "active" ? "destructive" : "default"}
                              onClick={() =>
                                bundle.status === "active"
                                  ? setConfirmDeactivate(bundle)
                                  : handleReactivate(bundle)
                              }
                            >
                              {bundle.status === "active" ? "Deactivate Bundle" : "Reactivate Bundle"}
                            </DropdownMenuItem>
                          </>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </table>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-4">
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
            {filtered.length === 0
              ? "0 items found"
              : `${filtered.length} item${filtered.length === 1 ? "" : "s"} found, displaying ${pageStart + 1} to ${pageEnd}`}
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

      <BundleDetailDrawer
        bundle={selectedBundle}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onRequestDeactivate={(b) => setConfirmDeactivate(b)}
        onRequestReactivate={(b) => handleReactivate(b)}
      />

      <Dialog
        open={Boolean(confirmDeactivate)}
        onOpenChange={(o) => !o && setConfirmDeactivate(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate bundle?</DialogTitle>
            <DialogDescription>
              “{confirmDeactivate?.name}” will become unavailable for new purchases. Existing
              subscribers keep access until their current cycle ends.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setConfirmDeactivate(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDeactivateAction}>
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(reactivateErrors)} onOpenChange={(o) => !o && setReactivateErrors(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot reactivate</DialogTitle>
            <DialogDescription>
              Update the bundle to fix these issues before reactivating:
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-1 pl-5 text-caption text-foreground">
            {reactivateErrors?.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <DialogFooter>
            <Button type="button" onClick={() => setReactivateErrors(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PaymentsShell>
  );
}
