"use client";

import { History, Search, X } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AUDIT_LOG_ACTIVITY_LABEL,
  buildSeedAuditLog,
  type AuditLogActivityType,
  type AuditLogEntry,
} from "@/lib/orgAdminAuditLog";
import { ORG_ADMIN_DEMO_ORG } from "@/lib/orgAdminDemo";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

const timestampFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });

export function AuditLogsSection() {
  const [entries, setEntries] = useLocalStorageState<AuditLogEntry[]>(
    StorageKeys.orgAdminAuditLogEntries,
    buildSeedAuditLog(ORG_ADMIN_DEMO_ORG.contactName),
  );
  const [search, setSearch] = useState("");
  const [activityFilter, setActivityFilter] = useState<AuditLogActivityType | "all">("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [clearAllOpen, setClearAllOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter((entry) => {
      if (q && !entry.description.toLowerCase().includes(q)) return false;
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
            <CardDescription>Track important actions and changes performed on the platform.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => setClearAllOpen(true)} disabled={entries.length === 0}>
            Clear All Logs
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search logs" className="pl-9" />
          </div>
          <Separator orientation="vertical" className="h-6" />
          <Select value={activityFilter} onValueChange={(v) => setActivityFilter(v as AuditLogActivityType | "all")}>
            <SelectTrigger size="sm" className="w-[172px]">
              <SelectValue placeholder="Activity Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Activity Types</SelectItem>
              {(Object.entries(AUDIT_LOG_ACTIVITY_LABEL) as [AuditLogActivityType, string][]).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 text-caption text-muted-foreground">
            <span>Date Range</span>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
            <span>to</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <History className="h-8 w-8 text-muted-foreground" />
            <p className="text-body-sm font-medium text-foreground">
              {entries.length === 0 ? "No audit logs found." : "No logs match the selected filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full caption-bottom text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-overline pl-4 text-muted-foreground">Activity</TableHead>
                  <TableHead className="text-overline text-muted-foreground">Performed By</TableHead>
                  <TableHead className="text-overline text-muted-foreground">Timestamp</TableHead>
                  <TableHead className="text-overline pr-4 text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="pl-4 text-foreground">{entry.description}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.performedBy}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {timestampFormatter.format(new Date(entry.timestamp))}
                    </TableCell>
                    <TableCell className="pr-4 text-right">
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
          </div>
        )}
      </CardContent>

      <Dialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear all audit logs?</DialogTitle>
            <DialogDescription>
              This permanently removes all {entries.length} audit log {entries.length === 1 ? "entry" : "entries"}.
              This cannot be undone.
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
