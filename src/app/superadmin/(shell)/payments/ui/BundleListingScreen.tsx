"use client";

import {
  ChevronDown,
  ChevronRight,
  Copy,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { cn } from "@/lib/utils";

import { PaymentsShell } from "./PaymentsShell";

function BundleStatusPill({ status }: { status: BundleStatus }) {
  const tone =
    status === "active"
      ? "border-scoring-green/25 bg-scoring-green/15 text-scoring-green-fg"
      : status === "draft"
        ? "border-border bg-muted text-muted-foreground"
        : "border-scoring-yellow/30 bg-scoring-yellow/20 text-scoring-yellow-fg";
  return (
    <span
      className={cn(
        "text-overline inline-flex h-6 w-fit items-center rounded-full border px-2 whitespace-nowrap",
        tone,
      )}
    >
      {BUNDLE_STATUS_LABEL[status]}
    </span>
  );
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

function SummaryCard({
  title,
  value,
  expandable,
  children,
}: {
  title: string;
  value: string;
  expandable?: boolean;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Card
      className={cn(expandable && "cursor-pointer transition hover:bg-muted/30")}
      onClick={expandable ? () => setOpen((v) => !v) : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardDescription>{title}</CardDescription>
          {expandable ? (
            open ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )
          ) : null}
        </div>
        <CardTitle className="text-h4">{value}</CardTitle>
      </CardHeader>
      {expandable && open && children ? (
        <CardContent className="pt-0 text-caption text-muted-foreground">{children}</CardContent>
      ) : null}
    </Card>
  );
}

export function BundleListingScreen() {
  const router = useRouter();
  const { bundles, deactivate, reactivate, duplicate, hydrated } = usePaymentBundles();
  const { rates: globalRates } = useGlobalRates();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<ClientType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<BundleStatus | "all">("all");
  const [cycleFilter, setCycleFilter] = useState<BillingCycle | "all">("all");
  const [confirmDeactivate, setConfirmDeactivate] = useState<PaymentBundle | null>(null);
  const [reactivateErrors, setReactivateErrors] = useState<string[] | null>(null);

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
      ? "No bundles yet. Create your first payment bundle."
      : search.trim()
        ? "No matching bundles found."
        : typeFilter !== "all" || statusFilter !== "all" || cycleFilter !== "all"
          ? "No bundles found for the selected filters."
          : "No bundles found.";

  return (
    <PaymentsShell
      title="Payments"
      description="Monitor bundle performance and manage payment offerings across B2C and B2B."
      actions={
        <Button asChild>
          <Link href="/superadmin/payments/bundles/new">
            <Plus className="h-4 w-4" />
            Create New Bundle
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Total Active Bundles" value={String(stats.totalActiveBundles)} />
        <SummaryCard title="Earnings" value={formatUsd(stats.earnings)} expandable>
          <ul className="space-y-1">
            <li>B2C: {formatUsd(stats.earningsByClientType.B2C)}</li>
            <li>B2B: {formatUsd(stats.earningsByClientType.B2B)}</li>
            <li>Add-ons: {formatUsd(stats.earningsAddOns)}</li>
          </ul>
        </SummaryCard>
        <SummaryCard title="Total Subscribers" value={String(stats.totalSubscribers)} expandable>
          <ul className="space-y-1">
            <li>B2C: {stats.subscribersByClientType.B2C}</li>
            <li>B2B: {stats.subscribersByClientType.B2B}</li>
          </ul>
        </SummaryCard>
        <SummaryCard
          title="New Subscribers This Month"
          value={String(stats.newSubscribersThisMonth)}
          expandable
        >
          <ul className="space-y-1">
            <li>B2C: {stats.newSubscribersByClientType.B2C}</li>
            <li>B2B: {stats.newSubscribersByClientType.B2B}</li>
          </ul>
        </SummaryCard>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search bundles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ClientType | "all")}>
          <SelectTrigger className="w-full sm:w-36">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="B2C">B2C</SelectItem>
            <SelectItem value="B2B">B2B</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as BundleStatus | "all")}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={cycleFilter}
          onValueChange={(v) => setCycleFilter(v as BillingCycle | "all")}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Billing Cycle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Cycles</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="yearly">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!hydrated ? (
        <p className="text-caption text-muted-foreground">Loading bundles…</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-caption text-muted-foreground">
            {emptyMessage}
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[720px] text-left">
            <TableHeader>
              <TableRow>
                <TableHead>Bundle Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Billing Cycle</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((bundle) =>
                bundle.cycles.length === 0 ? (
                  <TableRow key={bundle.id}>
                    <TableCell>
                      <Link
                        href={`/superadmin/payments/bundles/${bundle.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {bundle.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{bundle.type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">—</TableCell>
                    <TableCell className="text-muted-foreground">—</TableCell>
                    <TableCell>{formatUpdated(bundle.updatedAt)}</TableCell>
                    <TableCell>
                      <BundleStatusPill status={bundle.status} />
                    </TableCell>
                    <TableCell>
                      <BundleRowActions
                        bundle={bundle}
                        onDeactivate={() => setConfirmDeactivate(bundle)}
                        onReactivate={() => handleReactivate(bundle)}
                        onDuplicate={() => handleDuplicate(bundle)}
                      />
                    </TableCell>
                  </TableRow>
                ) : (
                  bundle.cycles.map((cycle, idx) => (
                    <TableRow key={`${bundle.id}-${cycle.cycle}`}>
                      <TableCell>
                        {idx === 0 ? (
                          <Link
                            href={`/superadmin/payments/bundles/${bundle.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {bundle.name}
                          </Link>
                        ) : (
                          <span className="pl-4 text-muted-foreground">↳</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {idx === 0 ? <Badge variant="secondary">{bundle.type}</Badge> : null}
                      </TableCell>
                      <TableCell>{BILLING_CYCLE_LABEL[cycle.cycle]}</TableCell>
                      <TableCell>{formatUsd(cycle.price)}</TableCell>
                      <TableCell>{idx === 0 ? formatUpdated(bundle.updatedAt) : null}</TableCell>
                      <TableCell>
                        {idx === 0 ? <BundleStatusPill status={bundle.status} /> : null}
                      </TableCell>
                      <TableCell>
                        {idx === 0 ? (
                          <BundleRowActions
                            bundle={bundle}
                            onDeactivate={() => setConfirmDeactivate(bundle)}
                            onReactivate={() => handleReactivate(bundle)}
                            onDuplicate={() => handleDuplicate(bundle)}
                          />
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))
                ),
              )}
            </TableBody>
          </table>
        </div>
      )}

      <Dialog open={Boolean(confirmDeactivate)} onOpenChange={(o) => !o && setConfirmDeactivate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate bundle?</DialogTitle>
            <DialogDescription>
              “{confirmDeactivate?.name}” will become unavailable for new purchases. Existing
              subscribers keep access until their current cycle ends.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmDeactivate(null)}>
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

function BundleRowActions({
  bundle,
  onDeactivate,
  onReactivate,
  onDuplicate,
}: {
  bundle: PaymentBundle;
  onDeactivate: () => void;
  onReactivate: () => void;
  onDuplicate: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" size="icon" variant="ghost" aria-label="Bundle actions">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/superadmin/payments/bundles/${bundle.id}`}>Edit Bundle</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onDuplicate}>
          <Copy className="h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {bundle.status === "inactive" ? (
          <DropdownMenuItem onClick={onReactivate}>Reactivate</DropdownMenuItem>
        ) : bundle.status === "active" ? (
          <DropdownMenuItem onClick={onDeactivate}>Deactivate</DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
