"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { buildSeedAuditLog, type AuditLogEntry } from "@/lib/orgAdminAuditLog";
import { ORG_ADMIN_DEMO_ORG } from "@/lib/orgAdminDemo";
import {
  ORG_ADMIN_USERS,
  ORG_ADMIN_USER_STATUS_LABEL,
  type OrgAdminUser,
  type OrgAdminUserStatus,
} from "@/lib/orgAdminUsers";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

import { AddUserDialog } from "./AddUserDialog";
import { OrgAdminUserDetailDrawer } from "./OrgAdminUserDetailDrawer";
import { OrgAdminUserStatusPill } from "./OrgAdminUserStatusPill";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50] as const;

export function OrgAdminUsersListScreen() {
  const [users, setUsers] = useState<OrgAdminUser[]>(ORG_ADMIN_USERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrgAdminUserStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(ROWS_PER_PAGE_OPTIONS[0]);
  const [confirmTarget, setConfirmTarget] = useState<{ user: OrgAdminUser; nextStatus: OrgAdminUserStatus } | null>(
    null,
  );
  const [removeTarget, setRemoveTarget] = useState<OrgAdminUser | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const [, setAuditEntries] = useLocalStorageState<AuditLogEntry[]>(
    StorageKeys.orgAdminAuditLogEntries,
    buildSeedAuditLog(ORG_ADMIN_DEMO_ORG.contactName),
  );

  const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      if (q && !user.name.toLowerCase().includes(q) && !user.email.toLowerCase().includes(q)) return false;
      if (statusFilter !== "all" && user.status !== statusFilter) return false;
      return true;
    });
  }, [users, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageEnd = Math.min(pageStart + rowsPerPage, filtered.length);
  const pageRows = filtered.slice(pageStart, pageEnd);

  function resetToFirstPage() {
    setPage(1);
  }

  function appendAuditEntry(description: string) {
    setAuditEntries((prev) => [
      {
        id: `log_${Date.now()}`,
        description,
        performedBy: ORG_ADMIN_DEMO_ORG.contactName,
        timestamp: new Date().toISOString(),
        activityType: "user_management",
      },
      ...prev,
    ]);
  }

  function handleViewDetails(user: OrgAdminUser) {
    setSelectedUserId(user.id);
  }

  function handleCreateUsers(newUsers: OrgAdminUser[]) {
    setUsers((prev) => [...newUsers, ...prev]);
    setIsAddDialogOpen(false);
    resetToFirstPage();
    if (newUsers.length === 1) {
      toast.success(`Invitation sent to ${newUsers[0].name}.`);
      appendAuditEntry(`${ORG_ADMIN_DEMO_ORG.contactName} invited ${newUsers[0].email} to the organization.`);
    } else {
      toast.success(`${newUsers.length} users invited.`);
      appendAuditEntry(`${ORG_ADMIN_DEMO_ORG.contactName} invited ${newUsers.length} users to the organization.`);
    }
  }

  function handleUpdateUser(id: string, patch: Partial<OrgAdminUser>) {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }

  function handleRequestStatusChange(user: OrgAdminUser) {
    setConfirmTarget({ user, nextStatus: user.status === "active" ? "inactive" : "active" });
  }

  function handleConfirmStatusChange() {
    if (!confirmTarget) return;
    const { user, nextStatus } = confirmTarget;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: nextStatus, joinedDate: nextStatus === "active" ? (u.joinedDate ?? new Date().toISOString().slice(0, 10)) : u.joinedDate }
          : u,
      ),
    );
    setConfirmTarget(null);
    toast.success("User status updated successfully.");
    appendAuditEntry(
      `${ORG_ADMIN_DEMO_ORG.contactName} ${nextStatus === "inactive" ? "deactivated" : "activated"} user ${user.email}.`,
    );
  }

  function handleResendInvite(user: OrgAdminUser) {
    toast.success(`Invitation resent to ${user.email}.`);
  }

  function handleRequestRemove(user: OrgAdminUser) {
    setRemoveTarget(user);
  }

  function handleConfirmRemove() {
    if (!removeTarget) return;
    setUsers((prev) => prev.filter((u) => u.id !== removeTarget.id));
    setRemoveTarget(null);
    if (selectedUserId === removeTarget.id) setSelectedUserId(null);
    toast.success(`${removeTarget.name} was removed.`);
    appendAuditEntry(`${ORG_ADMIN_DEMO_ORG.contactName} removed user ${removeTarget.email}.`);
  }

  return (
    <div className="-m-6 flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-12 py-4">
        <h1 className="text-h6 text-foreground">User Management</h1>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border px-12 py-3">
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
          <SelectTrigger size="sm" className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.entries(ORG_ADMIN_USER_STATUS_LABEL) as [OrgAdminUserStatus, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {pageRows.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-20 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-body-sm font-medium text-foreground">
              {users.length === 0 ? "No users found." : "No matching users found."}
            </p>
          </div>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-10 border-b border-border bg-background">
              <TableRow>
                <TableHead className="text-overline pl-12 text-muted-foreground">Name</TableHead>
                <TableHead className="text-overline text-muted-foreground">Email</TableHead>
                <TableHead className="text-overline text-muted-foreground">Status</TableHead>
                <TableHead className="text-overline text-muted-foreground">Invited Date</TableHead>
                <TableHead className="text-overline pr-12 text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="pl-12">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(user)}
                      className="text-caption text-left font-semibold text-primary hover:underline"
                    >
                      {user.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <OrgAdminUserStatusPill status={user.status} />
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">{user.invitedDate}</TableCell>
                  <TableCell className="pr-12 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Actions for ${user.name}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(user)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewDetails(user)}>Edit User</DropdownMenuItem>
                        {user.status === "invited" && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleResendInvite(user)}>
                              Resend Invite
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant={user.status === "active" ? "destructive" : "default"}
                          onClick={() => handleRequestStatusChange(user)}
                        >
                          {user.status === "active" ? "Deactivate User" : "Activate User"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive" onClick={() => handleRequestRemove(user)}>
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
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-border bg-background px-12 py-4">
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
            <Button variant="ghost" size="icon" disabled={currentPage === 1} onClick={() => setPage(1)} aria-label="First page">
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
              {`Are you sure you want to remove "${removeTarget?.name}"? This permanently removes them from the organization's user list.`}
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

      <AddUserDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        existingEmails={users.map((u) => u.email)}
        onCreate={handleCreateUsers}
      />

      <OrgAdminUserDetailDrawer
        user={selectedUser}
        onOpenChange={(open) => {
          if (!open) setSelectedUserId(null);
        }}
        onUpdate={handleUpdateUser}
        onRequestStatusChange={handleRequestStatusChange}
      />
    </div>
  );
}
