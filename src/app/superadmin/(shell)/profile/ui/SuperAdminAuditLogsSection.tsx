"use client";

import { X } from "lucide-react";
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
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  SUPER_ADMIN_AUDIT_ACTIVITY_LABEL,
  SUPER_ADMIN_DEMO_PROFILE,
  buildSeedSuperAdminAuditLog,
  type SuperAdminAuditActivityType,
  type SuperAdminAuditLogEntry,
  type SuperAdminProfile,
} from "@/lib/superAdminProfileData";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function SuperAdminAuditLogsSection() {
  const [overrides] = useLocalStorageState<Partial<SuperAdminProfile>>(
    StorageKeys.superAdminProfileOverrides,
    {},
  );
  const performedBy = overrides.fullName ?? SUPER_ADMIN_DEMO_PROFILE.fullName;

  const [entries, setEntries] = useLocalStorageState<SuperAdminAuditLogEntry[]>(
    StorageKeys.superAdminAuditLogEntries,
    buildSeedSuperAdminAuditLog(performedBy),
  );
  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState<SuperAdminAuditActivityType | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((entry) => {
      if (q && !entry.description.toLowerCase().includes(q) && !entry.performedBy.toLowerCase().includes(q))
        return false;
      if (activityFilter !== "all" && entry.activityType !== activityFilter) return false;
      const day = entry.timestamp.slice(0, 10);
      if (dateFrom && day < dateFrom) return false;
      if (dateTo && day > dateTo) return false;
      return true;
    });
  }, [entries, search, activityFilter, dateFrom, dateTo]);

  function handleRemove(id: string) {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
    toast.success("Audit log entry removed.");
  }

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
            <CardDescription>Track important Super Admin actions performed on the platform.</CardDescription>
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
            placeholder="Search logs"
            className="max-w-xs"
          />
          <Select
            value={activityFilter}
            onValueChange={(v) => setActivityFilter(v as SuperAdminAuditActivityType | "all")}
          >
            <SelectTrigger size="sm" className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All activities</SelectItem>
              {(
                Object.entries(SUPER_ADMIN_AUDIT_ACTIVITY_LABEL) as [SuperAdminAuditActivityType, string][]
              ).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[160px]" />
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[160px]" />
        </div>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-caption text-muted-foreground">No audit logs found.</p>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="text-overline text-muted-foreground">Timestamp</TableHead>
                <TableHead className="text-overline text-muted-foreground">Performed By</TableHead>
                <TableHead className="text-overline text-muted-foreground">Activity</TableHead>
                <TableHead className="text-overline text-muted-foreground">Description</TableHead>
                <TableHead className="text-overline w-10 text-right text-muted-foreground" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-caption text-muted-foreground whitespace-nowrap">
                    {timestampFormatter.format(new Date(entry.timestamp))}
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">{entry.performedBy}</TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {SUPER_ADMIN_AUDIT_ACTIVITY_LABEL[entry.activityType]}
                  </TableCell>
                  <TableCell className="text-body-sm text-foreground">{entry.description}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove log entry"
                      onClick={() => handleRemove(entry.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
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
            <DialogDescription>
              This removes all locally stored audit log entries for this demo session.
            </DialogDescription>
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
