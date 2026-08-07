"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Search,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { OrgAdminUserDetailDrawer } from "@/app/orgadmin/(shell)/users/ui/OrgAdminUserDetailDrawer";
import { EditUserDialog } from "@/app/orgadmin/(shell)/users/ui/EditUserDialog";
import { OrgAdminUserStatusPill } from "@/app/orgadmin/(shell)/users/ui/OrgAdminUserStatusPill";
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
import {
  ORG_ADMIN_USERS,
  ORG_ADMIN_USER_STATUS_LABEL,
  type OrgAdminUser,
  type OrgAdminUserStatus,
} from "@/lib/orgAdminUsers";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50] as const;

export function CandidatesListScreen() {
  const [candidates, setCandidates] = useState<OrgAdminUser[]>(ORG_ADMIN_USERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrgAdminUserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(ROWS_PER_PAGE_OPTIONS[0]);
  const [confirmTarget, setConfirmTarget] = useState<{
    user: OrgAdminUser;
    nextStatus: OrgAdminUserStatus;
  } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<OrgAdminUser | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editUserId, setEditUserId] = useState<string | null>(null);

  const selectedUser = candidates.find((u) => u.id === selectedUserId) ?? null;
  const editUser = candidates.find((u) => u.id === editUserId) ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return candidates.filter((user) => {
      if (q && !user.name.toLowerCase().includes(q) && !user.email.toLowerCase().includes(q)) {
        return false;
      }
      if (statusFilter !== "all" && user.status !== statusFilter) return false;
      return true;
    });
  }, [candidates, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageEnd = Math.min(pageStart + rowsPerPage, filtered.length);
  const pageRows = filtered.slice(pageStart, pageEnd);

  function resetToFirstPage() {
    setPage(1);
  }

  function handleViewDetails(user: OrgAdminUser) {
    setSelectedUserId(user.id);
  }

  function handleUpdateUser(id: string, patch: Partial<OrgAdminUser>) {
    setCandidates((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  function handleRequestStatusChange(user: OrgAdminUser) {
    setConfirmTarget({ user, nextStatus: user.status === "active" ? "inactive" : "active" });
  }

  function handleConfirmStatusChange() {
    if (!confirmTarget) return;
    const { user, nextStatus } = confirmTarget;
    setCandidates((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? {
              ...u,
              status: nextStatus,
              joinedDate:
                nextStatus === "active"
                  ? (u.joinedDate ?? new Date().toISOString().slice(0, 10))
                  : u.joinedDate,
            }
          : u,
      ),
    );
    setConfirmTarget(null);
    toast.success("Candidate status updated successfully.");
  }

  function handleResendInvite(user: OrgAdminUser) {
    toast.success(`Invitation resent to ${user.email}.`);
  }

  function handleRequestRemove(user: OrgAdminUser) {
    setRemoveTarget(user);
  }

  function handleConfirmRemove() {
    if (!removeTarget) return;
    setCandidates((prev) => prev.filter((u) => u.id !== removeTarget.id));
    setRemoveTarget(null);
    if (selectedUserId === removeTarget.id) setSelectedUserId(null);
    toast.success(`${removeTarget.name} was removed.`);
  }

  return (
    <div className="-mx-6 flex h-full min-w-0 flex-col overflow-hidden">
      <PageHeader>
        <PageTitle>Candidates</PageTitle>
      </PageHeader>

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border px-6 py-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetToFirstPage();
            }}
            placeholder="Search by name or email"
            className="pl-9"
          />
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as OrgAdminUserStatus | "all");
            resetToFirstPage();
          }}
        >
          <SelectTrigger size="sm" variant="filter" active={statusFilter !== "all"}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Statuses</SelectItem>
            {(Object.entries(ORG_ADMIN_USER_STATUS_LABEL) as [OrgAdminUserStatus, string][]).map(
              ([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        {pageRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-20 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-body-sm font-medium text-foreground">
              {candidates.length === 0 ? "No candidates found." : "No matching candidates found."}
            </p>
          </div>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <TableHeader sticky>
              <TableRow>
                <TableHead className="text-overline pl-6 text-muted-foreground">Name</TableHead>
                <TableHead className="text-overline text-muted-foreground">Email</TableHead>
                <TableHead className="text-overline text-muted-foreground">Status</TableHead>
                <TableHead className="text-overline text-muted-foreground">Invited Date</TableHead>
                <TableHead className="text-overline pr-6 text-right text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="pl-6">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(user)}
                      className="text-left font-semibold text-text-primary hover:underline"
                    >
                      {user.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <OrgAdminUserStatusPill status={user.status} />
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {user.invitedDate}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${user.name}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setEditUserId(user.id)}>
                          Edit User
                        </DropdownMenuItem>
                        {user.status === "invited" ? (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleResendInvite(user)}>
                              Resend Invite
                            </DropdownMenuItem>
                          </>
                        ) : null}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant={user.status === "active" ? "destructive" : "default"}
                          onClick={() => handleRequestStatusChange(user)}
                        >
                          {user.status === "active" ? "Deactivate User" : "Activate User"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => handleRequestRemove(user)}
                        >
                          Remove User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

      <Dialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmTarget?.nextStatus === "inactive" ? "Deactivate user?" : "Activate user?"}
            </DialogTitle>
            <DialogDescription>
              {confirmTarget?.nextStatus === "inactive"
                ? `Are you sure you want to deactivate "${confirmTarget?.user.name}"? They will lose platform access immediately.`
                : `Are you sure you want to activate "${confirmTarget?.user.name}"? They will regain platform access immediately.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmTarget(null)}>
              Cancel
            </Button>
            <Button
              variant={confirmTarget?.nextStatus === "inactive" ? "destructive" : "default"}
              onClick={handleConfirmStatusChange}
            >
              {confirmTarget?.nextStatus === "inactive" ? "Deactivate" : "Activate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!removeTarget}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove user?</DialogTitle>
            <DialogDescription>
              {`Are you sure you want to remove "${removeTarget?.name}"? This permanently removes them from the candidate list.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmRemove}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditUserDialog
        open={!!editUser}
        onOpenChange={(open) => {
          if (!open) setEditUserId(null);
        }}
        user={editUser}
        onUpdate={handleUpdateUser}
      />

      <OrgAdminUserDetailDrawer
        user={selectedUser}
        onOpenChange={(open) => {
          if (!open) setSelectedUserId(null);
        }}
        onRequestStatusChange={handleRequestStatusChange}
        onRequestEdit={(user) => {
          setSelectedUserId(null);
          setEditUserId(user.id);
        }}
      />
    </div>
  );
}
