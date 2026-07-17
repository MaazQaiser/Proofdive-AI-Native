"use client";

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { COMPETENCY_FRAMEWORKS, type CompetencyFramework } from "@/lib/superAdminOrganizationWizard";
import {
  ORGANIZATION_STATUS_LABEL,
  ORGANIZATION_TYPE_LABEL,
  SUBSCRIPTION_STATUS_LABEL,
  SUPER_ADMIN_ORGANIZATIONS,
  type Organization,
  type OrganizationStatus,
  type OrganizationType,
  type SubscriptionStatus,
} from "@/lib/superAdminOrganizations";

import { AddOrganizationDialog } from "./AddOrganizationDialog";
import { OrganizationDetailDrawer } from "./OrganizationDetailDrawer";
import { OrganizationStatusPill, SubscriptionStatusPill } from "./StatusPills";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50] as const;

export function OrganizationsListScreen() {
  const [organizations, setOrganizations] = useState<Organization[]>(SUPER_ADMIN_ORGANIZATIONS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<OrganizationType | "all">("all");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [subscriptionStatusFilter, setSubscriptionStatusFilter] = useState<SubscriptionStatus | "all">("all");
  const [statusFilter, setStatusFilter] = useState<OrganizationStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(ROWS_PER_PAGE_OPTIONS[0]);
  const [confirmTarget, setConfirmTarget] = useState<{ org: Organization; nextStatus: OrganizationStatus } | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const [frameworks, setFrameworks] = useState<CompetencyFramework[]>(COMPETENCY_FRAMEWORKS);

  const selectedOrganization = organizations.find((o) => o.id === selectedOrgId) ?? null;

  const countries = useMemo(
    () => Array.from(new Set(organizations.map((o) => o.country))).sort((a, b) => a.localeCompare(b)),
    [organizations],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return organizations.filter((org) => {
      if (q && !org.name.toLowerCase().includes(q)) return false;
      if (typeFilter !== "all" && org.type !== typeFilter) return false;
      if (countryFilter !== "all" && org.country !== countryFilter) return false;
      if (subscriptionStatusFilter !== "all" && org.subscriptionStatus !== subscriptionStatusFilter) return false;
      if (statusFilter !== "all" && org.status !== statusFilter) return false;
      return true;
    });
  }, [organizations, search, typeFilter, countryFilter, subscriptionStatusFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageEnd = Math.min(pageStart + rowsPerPage, filtered.length);
  const pageRows = filtered.slice(pageStart, pageEnd);

  function resetToFirstPage() {
    setPage(1);
  }

  function handleAddOrganization() {
    setIsAddDialogOpen(true);
  }

  function handleCreateOrganization(org: Organization) {
    setOrganizations((prev) => [org, ...prev]);
    setIsAddDialogOpen(false);
    resetToFirstPage();
    toast.success(`"${org.name}" was created and an invitation was sent to the Organization Admin.`);
  }

  function handleViewDetails(org: Organization) {
    setSelectedOrgId(org.id);
  }

  function handleRequestStatusChange(org: Organization) {
    setConfirmTarget({ org, nextStatus: org.status === "active" ? "inactive" : "active" });
  }

  function handleConfirmStatusChange() {
    if (!confirmTarget) return;
    const { org, nextStatus } = confirmTarget;
    setOrganizations((prev) => prev.map((o) => (o.id === org.id ? { ...o, status: nextStatus } : o)));
    setConfirmTarget(null);
    toast.success("Organization status updated successfully.");
  }

  function handleUpdateOrganization(id: string, patch: Partial<Organization>) {
    setOrganizations((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }

  return (
    <div className="-m-6 flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-12 py-4">
        <h1 className="text-h6 text-foreground">Organizations</h1>
        <Button onClick={handleAddOrganization}>
          <Plus className="h-4 w-4" />
          Add Organization
        </Button>
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
            placeholder="Search by Organization Name"
            className="pl-9"
          />
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v as OrganizationType | "all");
            resetToFirstPage();
          }}
        >
          <SelectTrigger size="sm" className="w-[168px]">
            <SelectValue placeholder="Organization Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {(Object.entries(ORGANIZATION_TYPE_LABEL) as [OrganizationType, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={countryFilter}
          onValueChange={(v) => {
            setCountryFilter(v);
            resetToFirstPage();
          }}
        >
          <SelectTrigger size="sm" className="w-[168px]">
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            {countries.map((country) => (
              <SelectItem key={country} value={country}>
                {country}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={subscriptionStatusFilter}
          onValueChange={(v) => {
            setSubscriptionStatusFilter(v as SubscriptionStatus | "all");
            resetToFirstPage();
          }}
        >
          <SelectTrigger size="sm" className="w-[172px]">
            <SelectValue placeholder="Subscription Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subscription Statuses</SelectItem>
            {(Object.entries(SUBSCRIPTION_STATUS_LABEL) as [SubscriptionStatus, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as OrganizationStatus | "all");
            resetToFirstPage();
          }}
        >
          <SelectTrigger size="sm" className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(Object.entries(ORGANIZATION_STATUS_LABEL) as [OrganizationStatus, string][]).map(([value, label]) => (
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
            <Building2 className="h-8 w-8 text-muted-foreground" />
            <p className="text-body-sm font-medium text-foreground">
              {organizations.length === 0 ? "No organizations found." : "No matching organizations found."}
            </p>
          </div>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-10 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
              <TableRow>
                <TableHead className="text-overline pl-12 text-muted-foreground">Organization</TableHead>
                <TableHead className="text-overline text-muted-foreground">Type</TableHead>
                <TableHead className="text-overline text-muted-foreground">Country</TableHead>
                <TableHead className="text-overline text-muted-foreground">Subscription Plan</TableHead>
                <TableHead className="text-overline text-muted-foreground">Subscription Status</TableHead>
                <TableHead className="text-overline text-muted-foreground">Status</TableHead>
                <TableHead className="text-overline pr-12 text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((org) => (
                <TableRow key={org.id}>
                  <TableCell className="pl-12">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(org)}
                      className="text-caption text-left font-semibold text-primary hover:underline"
                    >
                      {org.name}
                    </button>
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {ORGANIZATION_TYPE_LABEL[org.type]}
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">{org.country}</TableCell>
                  <TableCell className="text-caption text-muted-foreground">{org.subscriptionPlan}</TableCell>
                  <TableCell>
                    <SubscriptionStatusPill status={org.subscriptionStatus} />
                  </TableCell>
                  <TableCell>
                    <OrganizationStatusPill status={org.status} />
                  </TableCell>
                  <TableCell className="pr-12 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Actions for ${org.name}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(org)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewDetails(org)}>Edit Organization</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant={org.status === "active" ? "destructive" : "default"}
                          onClick={() => handleRequestStatusChange(org)}
                        >
                          {org.status === "active" ? "Deactivate Organization" : "Activate Organization"}
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

      <Dialog
        open={!!confirmTarget}
        onOpenChange={(open) => {
          if (!open) setConfirmTarget(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmTarget?.nextStatus === "inactive" ? "Deactivate organization?" : "Activate organization?"}
            </DialogTitle>
            <DialogDescription>
              {confirmTarget?.nextStatus === "inactive"
                ? `Are you sure you want to deactivate "${confirmTarget?.org.name}"? Its admin and users will lose platform access immediately. Data, reports, and subscription details are preserved.`
                : `Are you sure you want to activate "${confirmTarget?.org.name}"? Its admin and users will regain platform access immediately.`}
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

      <AddOrganizationDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        existingOrganizationNames={organizations.map((o) => o.name)}
        frameworks={frameworks}
        onCreateFramework={(framework) => setFrameworks((prev) => [...prev, framework])}
        onCreate={handleCreateOrganization}
      />

      <OrganizationDetailDrawer
        organization={selectedOrganization}
        onOpenChange={(open) => {
          if (!open) setSelectedOrgId(null);
        }}
        existingOrganizationNames={organizations.map((o) => o.name)}
        frameworks={frameworks}
        onUpdate={handleUpdateOrganization}
        onRequestStatusChange={handleRequestStatusChange}
      />
    </div>
  );
}
