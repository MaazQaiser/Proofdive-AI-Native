"use client";

import { CheckCheck, LifeBuoy, MoreHorizontal, Search } from "lucide-react";
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
  SEED_SUPPORT_REQUESTS,
  SUPPORT_REQUEST_STATUS_LABEL,
  SUPPORT_REQUEST_TYPE_LABEL,
  type SupportRequest,
  type SupportRequestStatus,
  type SupportRequestType,
} from "@/lib/superAdminSupportData";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { cn } from "@/lib/utils";

const timestampFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

type SortOrder = "newest" | "oldest";

function StatusPill({ status }: { status: SupportRequestStatus }) {
  const open = status === "open";
  return (
    <span
      className={cn(
        "text-overline inline-flex h-6 w-fit items-center rounded-full border px-2 whitespace-nowrap",
        open
          ? "border-scoring-yellow/30 bg-scoring-yellow/20 text-scoring-yellow-fg"
          : "border-scoring-green/25 bg-scoring-green/15 text-scoring-green-fg",
      )}
    >
      {SUPPORT_REQUEST_STATUS_LABEL[status]}
    </span>
  );
}

export function SupportRequestsScreen() {
  const [requests, setRequests] = useLocalStorageState<SupportRequest[]>(
    StorageKeys.superAdminSupportRequests,
    SEED_SUPPORT_REQUESTS,
  );
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<SupportRequestType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<SupportRequestStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [markAllOpen, setMarkAllOpen] = useState(false);

  const selected = requests.find((r) => r.id === selectedId) ?? null;
  const openCount = requests.filter((r) => r.status === "open").length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = requests.filter((req) => {
      if (
        q &&
        !req.title.toLowerCase().includes(q) &&
        !req.requestedByEmail.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (typeFilter !== "all" && req.type !== typeFilter) return false;
      if (statusFilter !== "all" && req.status !== statusFilter) return false;
      return true;
    });
    return [...list].sort((a, b) =>
      sortOrder === "newest"
        ? b.requestedAt.localeCompare(a.requestedAt)
        : a.requestedAt.localeCompare(b.requestedAt),
    );
  }, [requests, search, typeFilter, statusFilter, sortOrder]);

  function markResolved(id: string) {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "resolved" as const } : r)),
    );
    toast.success("Request marked as resolved successfully.");
  }

  function markAllResolved() {
    setRequests((prev) => prev.map((r) => ({ ...r, status: "resolved" as const })));
    setMarkAllOpen(false);
    toast.success("All requests marked as resolved successfully.");
  }

  return (
    <div className="-mx-6 -mb-6 flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <div>
          <h1 className="text-h4 text-foreground">Support Tickets</h1>
          <p className="mt-0.5 text-caption text-muted-foreground">
            Track and resolve support requests across the platform.
          </p>
        </div>
        <Button
          variant="outline"
          disabled={openCount === 0}
          onClick={() => setMarkAllOpen(true)}
        >
          <CheckCheck className="h-4 w-4" />
          Mark All as Resolved
        </Button>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border px-6 py-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or email"
            className="pl-9"
          />
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as SupportRequestType | "all")}
        >
          <SelectTrigger size="sm" className="w-[240px]">
            <SelectValue placeholder="Request Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Request Types</SelectItem>
            {(Object.entries(SUPPORT_REQUEST_TYPE_LABEL) as [SupportRequestType, string][]).map(
              ([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as SupportRequestStatus | "all")}
        >
          <SelectTrigger size="sm" className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as SortOrder)}>
          <SelectTrigger size="sm" className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-20 text-center">
            <LifeBuoy className="h-8 w-8 text-muted-foreground" />
            <p className="text-body-sm font-medium text-foreground">
              {requests.length === 0 ? "No support requests found." : "No matching requests found."}
            </p>
          </div>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-10 border-b border-border bg-background">
              <TableRow>
                <TableHead className="text-overline pl-6 text-muted-foreground">Request</TableHead>
                <TableHead className="text-overline text-muted-foreground">Requested By</TableHead>
                <TableHead className="text-overline text-muted-foreground">Requested At</TableHead>
                <TableHead className="text-overline text-muted-foreground">Status</TableHead>
                <TableHead className="text-overline pr-6 text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="pl-6">
                    <button
                      type="button"
                      onClick={() => setSelectedId(req.id)}
                      className="text-left"
                    >
                      <span className="font-semibold text-foreground hover:underline">{req.title}</span>
                      <span className="mt-0.5 block text-caption text-muted-foreground">
                        {SUPPORT_REQUEST_TYPE_LABEL[req.type]}
                      </span>
                    </button>
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">{req.requestedByEmail}</TableCell>
                  <TableCell className="text-caption text-muted-foreground whitespace-nowrap">
                    {timestampFormatter.format(new Date(req.requestedAt))}
                  </TableCell>
                  <TableCell>
                    <StatusPill status={req.status} />
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Actions for ${req.title}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedId(req.id)}>
                          View Request Details
                        </DropdownMenuItem>
                        {req.status === "open" ? (
                          <DropdownMenuItem onClick={() => markResolved(req.id)}>
                            Mark as Resolved
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
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selected?.title ?? "Request details"}</DialogTitle>
            <DialogDescription>Support request details</DialogDescription>
          </DialogHeader>
          {selected ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary">{SUPPORT_REQUEST_TYPE_LABEL[selected.type]}</Badge>
                <StatusPill status={selected.status} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-caption text-muted-foreground">Requested By</span>
                  <span className="text-body-sm text-foreground">{selected.requestedByEmail}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-caption text-muted-foreground">Requested At</span>
                  <span className="text-body-sm text-foreground">
                    {timestampFormatter.format(new Date(selected.requestedAt))}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-caption text-muted-foreground">Description</span>
                <p className="text-body-sm text-foreground">{selected.description}</p>
              </div>
            </div>
          ) : (
            <p className="text-caption text-muted-foreground">Unable to load request details.</p>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setSelectedId(null)}>
              Close
            </Button>
            {selected?.status === "open" ? (
              <Button
                onClick={() => {
                  markResolved(selected.id);
                  setSelectedId(null);
                }}
              >
                Mark as Resolved
              </Button>
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={markAllOpen} onOpenChange={setMarkAllOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark all requests as resolved?</DialogTitle>
            <DialogDescription>
              This will mark {openCount} open request{openCount === 1 ? "" : "s"} as resolved. History is preserved.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setMarkAllOpen(false)}>
              Cancel
            </Button>
            <Button onClick={markAllResolved}>Mark All as Resolved</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
