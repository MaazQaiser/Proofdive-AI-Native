"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PARTNER_DEMO } from "@/lib/partnerDemo";
import {
  PARTNER_AUDIT_ACTIVITY_LABEL,
  buildSeedPartnerAuditLog,
  type PartnerAuditLogEntry,
} from "@/lib/partnerMockData";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import type { Partner } from "@/lib/superAdminPartners";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

const timestampFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

export function PartnerAuditLogsSection() {
  const [overrides] = useLocalStorageState<Partial<Partner>>(StorageKeys.partnerProfileOverrides, {});
  const partnerName = overrides.fullName ?? PARTNER_DEMO.fullName;
  const [entries, setEntries] = useLocalStorageState<PartnerAuditLogEntry[]>(
    StorageKeys.partnerAuditLogEntries,
    buildSeedPartnerAuditLog(partnerName),
  );
  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState<PartnerAuditLogEntry["activityType"] | "all">("all");
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((entry) => {
      if (q && !entry.description.toLowerCase().includes(q)) return false;
      if (activityFilter !== "all" && entry.activityType !== activityFilter) return false;
      return true;
    });
  }, [entries, search, activityFilter]);

  function handleClearAll() {
    setEntries([]);
    setClearAllOpen(false);
    toast.success("All audit logs cleared.");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>Track important actions performed on your partner account.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setClearAllOpen(true)} disabled={entries.length === 0}>
            Clear All Logs
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search descriptions"
            className="max-w-xs"
          />
          <Select
            value={activityFilter}
            onValueChange={(v) => setActivityFilter(v as PartnerAuditLogEntry["activityType"] | "all")}
          >
            <SelectTrigger size="sm" className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All activities</SelectItem>
              {(Object.entries(PARTNER_AUDIT_ACTIVITY_LABEL) as [PartnerAuditLogEntry["activityType"], string][]).map(
                ([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ),
              )}
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-caption text-muted-foreground">No audit log entries found.</p>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="text-overline text-muted-foreground">Timestamp</TableHead>
                <TableHead className="text-overline text-muted-foreground">Activity</TableHead>
                <TableHead className="text-overline text-muted-foreground">Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-caption text-muted-foreground whitespace-nowrap">
                    {timestampFormatter.format(new Date(entry.timestamp))}
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {PARTNER_AUDIT_ACTIVITY_LABEL[entry.activityType]}
                  </TableCell>
                  <TableCell className="text-body-sm text-foreground">{entry.description}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </table>
        )}
      </CardContent>

      <Dialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all audit logs?</DialogTitle>
            <DialogDescription>This removes all locally stored audit log entries for this demo session.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setClearAllOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
