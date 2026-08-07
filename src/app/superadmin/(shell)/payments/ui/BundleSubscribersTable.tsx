"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

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
import { StatusPill, type StatusTone } from "@/components/ui/status-pill";
import {
  BILLING_CYCLE_LABEL,
  BILLING_CYCLES,
  formatUsd,
  ITEM_KIND_LABEL,
  type BillingCycle,
  type BundleSubscriber,
} from "@/lib/superAdminPaymentsData";

type SubscriberStatus = BundleSubscriber["status"];

const SUBSCRIBER_STATUS_LABEL: Record<SubscriberStatus, string> = {
  active: "Active",
  cancelled: "Cancelled",
  expired: "Expired",
};

function SubscriberStatusPill({ status }: { status: SubscriberStatus }) {
  const tone: StatusTone =
    status === "active" ? "success" : status === "cancelled" ? "neutral" : "danger";
  return <StatusPill tone={tone}>{SUBSCRIBER_STATUS_LABEL[status]}</StatusPill>;
}

function formatAddOns(sub: BundleSubscriber): string {
  if (sub.addOns.length === 0) return "—";
  return sub.addOns
    .map((ao) => {
      const qty = ao.quantity != null ? ` × ${ao.quantity}` : "";
      return `${ITEM_KIND_LABEL[ao.item]}${qty} · ${formatUsd(ao.pricePaid)}`;
    })
    .join("; ");
}

type Props = {
  subscribers: BundleSubscriber[];
};

export function BundleSubscribersTable({ subscribers }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<SubscriberStatus | "all">("all");
  const [cycleFilter, setCycleFilter] = useState<BillingCycle | "all">("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscribers.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (cycleFilter !== "all" && s.billingCycle !== cycleFilter) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    });
  }, [subscribers, search, statusFilter, cycleFilter]);

  const emptyMessage =
    subscribers.length === 0
      ? "No subscribers yet."
      : search.trim() || statusFilter !== "all" || cycleFilter !== "all"
        ? "No matching subscribers found."
        : "No subscribers found.";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border px-6 py-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as SubscriberStatus | "all")}
        >
          <SelectTrigger size="sm" variant="filter" active={statusFilter !== "all"}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={cycleFilter}
          onValueChange={(v) => setCycleFilter(v as BillingCycle | "all")}
        >
          <SelectTrigger size="sm" variant="filter" active={cycleFilter !== "all"}>
            <SelectValue placeholder="Billing cycle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Billing cycles</SelectItem>
            {BILLING_CYCLES.map((cycle) => (
              <SelectItem key={cycle} value={cycle}>
                {BILLING_CYCLE_LABEL[cycle]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <p className="text-body-sm font-medium text-foreground">{emptyMessage}</p>
          </div>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <TableHeader sticky>
              <TableRow>
                <TableHead className="text-overline pl-6 text-muted-foreground">
                  Subscriber
                </TableHead>
                <TableHead className="text-overline text-muted-foreground">Billing</TableHead>
                <TableHead className="text-overline text-muted-foreground">Status</TableHead>
                <TableHead className="text-overline text-muted-foreground">Purchased</TableHead>
                <TableHead className="text-overline pr-6 text-muted-foreground">Add-ons</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className="pl-6">
                    <div className="min-w-0">
                      <p className="font-semibold text-text-primary">{sub.name}</p>
                      <p className="text-caption text-muted-foreground">{sub.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {BILLING_CYCLE_LABEL[sub.billingCycle]}
                  </TableCell>
                  <TableCell>
                    <SubscriberStatusPill status={sub.status} />
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {new Date(sub.purchasedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="max-w-[220px] pr-6 text-caption text-muted-foreground">
                    <span className="line-clamp-2">{formatAddOns(sub)}</span>
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
