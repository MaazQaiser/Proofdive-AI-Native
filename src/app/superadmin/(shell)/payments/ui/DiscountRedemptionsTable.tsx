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
import type { DiscountRedemption } from "@/lib/superAdminPaymentsData";

type DateFilter = "all" | "7d" | "30d" | "90d" | "year";

const DATE_FILTER_LABEL: Record<DateFilter, string> = {
  all: "All dates",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  year: "This year",
};

function isWithinDateFilter(iso: string, filter: DateFilter): boolean {
  if (filter === "all") return true;
  const redeemed = new Date(iso).getTime();
  if (Number.isNaN(redeemed)) return false;
  const now = Date.now();
  if (filter === "year") {
    return new Date(iso).getFullYear() === new Date().getFullYear();
  }
  const days = filter === "7d" ? 7 : filter === "30d" ? 30 : 90;
  return redeemed >= now - days * 24 * 60 * 60 * 1000;
}

type Props = {
  redemptions: DiscountRedemption[];
};

export function DiscountRedemptionsTable({ redemptions }: Props) {
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return redemptions.filter((r) => {
      if (!isWithinDateFilter(r.dateRedeemed, dateFilter)) return false;
      if (!q) return true;
      return r.organizationOrUser.toLowerCase().includes(q);
    });
  }, [redemptions, search, dateFilter]);

  const emptyMessage =
    redemptions.length === 0
      ? "No redemptions yet."
      : search.trim() || dateFilter !== "all"
        ? "No matching redemptions found."
        : "No redemptions found.";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border px-6 py-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
          <SelectTrigger size="sm" variant="filter" active={dateFilter !== "all"}>
            <SelectValue placeholder="Date" />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(DATE_FILTER_LABEL) as DateFilter[]).map((key) => (
              <SelectItem key={key} value={key}>
                {DATE_FILTER_LABEL[key]}
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
                <TableHead className="text-overline pl-6 text-muted-foreground">Email</TableHead>
                <TableHead className="text-overline pr-6 text-muted-foreground">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="pl-6 font-semibold text-text-primary">
                    {r.organizationOrUser}
                  </TableCell>
                  <TableCell className="pr-6 text-caption text-muted-foreground">
                    {new Date(r.dateRedeemed).toLocaleDateString()}
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
