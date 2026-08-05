"use client";

import { MoreHorizontal, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
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
  DISCOUNT_STATUS_LABEL,
  DISCOUNT_TYPE_LABEL,
  formatUsd,
  type DiscountStatus,
  type DiscountType,
} from "@/lib/superAdminPaymentsData";
import { useDiscountCodes } from "@/lib/useDiscountCodes";
import { cn } from "@/lib/utils";

import { PaymentsShell } from "./PaymentsShell";

function StatusPill({ status }: { status: DiscountStatus }) {
  const tone =
    status === "active"
      ? "border-scoring-green/25 bg-scoring-green/15 text-scoring-green-fg"
      : status === "deactivated"
        ? "border-border bg-muted text-muted-foreground"
        : status === "scheduled"
          ? "border-scoring-yellow/30 bg-scoring-yellow/20 text-scoring-yellow-fg"
          : "border-scoring-red/25 bg-scoring-red/15 text-scoring-red-fg";
  return (
    <span
      className={cn(
        "text-overline inline-flex h-6 w-fit items-center rounded-full border px-2 whitespace-nowrap",
        tone,
      )}
    >
      {DISCOUNT_STATUS_LABEL[status]}
    </span>
  );
}

function formatValue(type: DiscountType, value: number | null): string {
  if (type === "free") return "Free Access";
  if (type === "percentage") return `${value ?? 0}%`;
  return formatUsd(value ?? 0);
}

export function DiscountListingScreen() {
  const { withStatus, deactivate, reactivate, hydrated } = useDiscountCodes();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<DiscountType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<DiscountStatus | "all">("all");
  const [confirmDeactivateId, setConfirmDeactivateId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return withStatus.filter((c) => {
      if (typeFilter !== "all" && c.discountType !== typeFilter) return false;
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (!q) return true;
      const hay = [c.code, c.discountType, c.status, ...c.appliesTo].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [withStatus, search, typeFilter, statusFilter]);

  function handleReactivate(id: string) {
    const result = reactivate(id);
    if (!result.ok) {
      toast.error(
        result.reason === "expiry"
          ? "This code’s expiry date has passed. Extend it on the detail page to reactivate."
          : result.reason === "max"
            ? "This code has reached its redemption limit. Increase the limit on the detail page."
            : result.reason === "both"
              ? "Extend expiry and increase the redemption limit on the detail page."
              : "Code not found.",
      );
      return;
    }
    toast.success("Discount code reactivated.");
  }

  const emptyMessage =
    withStatus.length === 0
      ? "No discount codes yet."
      : search.trim()
        ? "No matching discount codes found."
        : "No discount codes found for the selected filters.";

  return (
    <PaymentsShell
      title="Payments"
      actions={
        <Button asChild>
          <Link href="/superadmin/payments/discounts/new">
            <Plus className="h-4 w-4" />
            Generate Discount Code
          </Link>
        </Button>
      }
    >
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border px-6 py-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search codes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as DiscountType | "all")}>
          <SelectTrigger size="sm" variant="filter" active={typeFilter !== "all"}>
            <SelectValue placeholder="Discount Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="fixed">Fixed Amount</SelectItem>
            <SelectItem value="free">Free Access</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as DiscountStatus | "all")}
        >
          <SelectTrigger size="sm" variant="filter" active={statusFilter !== "all"}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
            <SelectItem value="deactivated">Deactivated</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!hydrated ? (
          <p className="px-6 py-10 text-caption text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-20 text-center">
            <p className="text-body-sm font-medium text-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-10 border-b border-border">
              <TableRow>
                <TableHead className="text-overline pl-6 text-muted-foreground">Code</TableHead>
                <TableHead className="text-overline text-muted-foreground">Discount Type</TableHead>
                <TableHead className="text-overline text-muted-foreground">Value</TableHead>
                <TableHead className="text-overline text-muted-foreground">Applies To</TableHead>
                <TableHead className="text-overline text-muted-foreground">Validity</TableHead>
                <TableHead className="text-overline text-muted-foreground">Status</TableHead>
                <TableHead className="text-overline pr-6 text-right text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((code) => (
                <TableRow key={code.id}>
                  <TableCell className="pl-6">
                    <Link
                      href={`/superadmin/payments/discounts/${code.id}`}
                      className="font-semibold text-text-primary hover:underline"
                    >
                      {code.code}
                    </Link>
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {DISCOUNT_TYPE_LABEL[code.discountType]}
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {formatValue(code.discountType, code.value)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {code.appliesTo.map((t) => (
                        <Badge key={t} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {code.startDate} → {code.expiryDate}
                  </TableCell>
                  <TableCell>
                    <StatusPill status={code.status} />
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button type="button" size="icon" variant="ghost" aria-label={`Actions for ${code.code}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/superadmin/payments/discounts/${code.id}`}>View</Link>
                        </DropdownMenuItem>
                        {code.status === "active" || code.status === "scheduled" ? (
                          <DropdownMenuItem onClick={() => setConfirmDeactivateId(code.id)}>
                            Deactivate
                          </DropdownMenuItem>
                        ) : code.deactivated ? (
                          <DropdownMenuItem onClick={() => handleReactivate(code.id)}>
                            Reactivate
                          </DropdownMenuItem>
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

      <Dialog
          open={Boolean(confirmDeactivateId)}
          onOpenChange={(o) => !o && setConfirmDeactivateId(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deactivate discount code?</DialogTitle>
              <DialogDescription>
                Are you sure you want to deactivate this discount code? Existing redemptions are
                unaffected.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setConfirmDeactivateId(null)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  if (confirmDeactivateId) deactivate(confirmDeactivateId);
                  setConfirmDeactivateId(null);
                  toast.success("Discount code deactivated.");
                }}
              >
                Deactivate
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </PaymentsShell>
  );
}
