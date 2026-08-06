"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Handshake,
  MoreHorizontal,
  Plus,
  Search,
} from "lucide-react";
import Link from "next/link";
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
  COMMISSION_TYPE_LABEL,
  PARTNER_STATUS_LABEL,
  PARTNER_TYPE_LABEL,
  type CommissionType,
  type Partner,
  type PartnerStatus,
  type PartnerType,
} from "@/lib/superAdminPartners";
import { usePartners } from "@/lib/usePartners";

import { PartnerDetailDrawer } from "./PartnerDetailDrawer";
import { PartnerStatusPill } from "./PartnerStatusPills";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50] as const;

export function PartnersListScreen() {
  const { partners, updatePartner, existingEmails } = usePartners();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<PartnerType | "all">("all");
  const [commissionFilter, setCommissionFilter] = useState<CommissionType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<PartnerStatus | "all">("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(ROWS_PER_PAGE_OPTIONS[0]);
  const [confirmTarget, setConfirmTarget] = useState<{ partner: Partner; nextStatus: PartnerStatus } | null>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  const selectedPartner = partners.find((p) => p.id === selectedPartnerId) ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return partners.filter((partner) => {
      if (
        q &&
        !partner.fullName.toLowerCase().includes(q) &&
        !partner.email.toLowerCase().includes(q) &&
        !partner.referralCode.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (typeFilter !== "all" && partner.partnerType !== typeFilter) return false;
      if (commissionFilter !== "all" && partner.commissionType !== commissionFilter) return false;
      if (statusFilter !== "all" && partner.status !== statusFilter) return false;
      return true;
    });
  }, [partners, search, typeFilter, commissionFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageEnd = Math.min(pageStart + rowsPerPage, filtered.length);
  const pageRows = filtered.slice(pageStart, pageEnd);

  function resetToFirstPage() {
    setPage(1);
  }

  function handleViewDetails(partner: Partner) {
    setSelectedPartnerId(partner.id);
  }

  function handleRequestStatusChange(partner: Partner) {
    setConfirmTarget({
      partner,
      nextStatus: partner.status === "active" ? "inactive" : "active",
    });
  }

  function handleConfirmStatusChange() {
    if (!confirmTarget) return;
    const { partner, nextStatus } = confirmTarget;
    updatePartner(partner.id, { status: nextStatus });
    setConfirmTarget(null);
    toast.success(
      nextStatus === "inactive"
        ? "Partner deactivated. Referral code is inactive; history is preserved."
        : "Partner reactivated successfully.",
    );
  }

  return (
    <div className="-mx-6 -mb-6 flex h-full flex-col overflow-hidden">
      <PageHeader>
        <PageTitle>Partners</PageTitle>
        <Button asChild>
          <Link href="/superadmin/partners/new">
            <Plus className="h-4 w-4" />
            Add Partner
          </Link>
        </Button>
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
            placeholder="Search by name, email, or referral code"
            className="pl-9"
          />
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v as PartnerType | "all");
            resetToFirstPage();
          }}
        >
          <SelectTrigger size="sm" variant="filter" active={typeFilter !== "all"}>
            <SelectValue placeholder="Partner Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Types</SelectItem>
            {(Object.entries(PARTNER_TYPE_LABEL) as [PartnerType, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={commissionFilter}
          onValueChange={(v) => {
            setCommissionFilter(v as CommissionType | "all");
            resetToFirstPage();
          }}
        >
          <SelectTrigger size="sm" variant="filter" active={commissionFilter !== "all"}>
            <SelectValue placeholder="Commission Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Commission Types</SelectItem>
            {(Object.entries(COMMISSION_TYPE_LABEL) as [CommissionType, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as PartnerStatus | "all");
            resetToFirstPage();
          }}
        >
          <SelectTrigger size="sm" variant="filter" active={statusFilter !== "all"}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Statuses</SelectItem>
            {(Object.entries(PARTNER_STATUS_LABEL) as [PartnerStatus, string][]).map(([value, label]) => (
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
            <Handshake className="h-8 w-8 text-muted-foreground" />
            <p className="text-body-sm font-medium text-foreground">
              {partners.length === 0 ? "No partners found." : "No matching partners found."}
            </p>
          </div>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <TableHeader sticky>
              <TableRow>
                <TableHead className="text-overline pl-6 text-muted-foreground">Full Name</TableHead>
                <TableHead className="text-overline text-muted-foreground">Email</TableHead>
                <TableHead className="text-overline text-muted-foreground">Partner Type</TableHead>
                <TableHead className="text-overline text-muted-foreground">Referral Code</TableHead>
                <TableHead className="text-overline text-muted-foreground">Commission</TableHead>
                <TableHead className="text-overline text-muted-foreground">Status</TableHead>
                <TableHead className="text-overline pr-6 text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((partner) => (
                <TableRow key={partner.id}>
                  <TableCell className="pl-6">
                    <button
                      type="button"
                      onClick={() => handleViewDetails(partner)}
                      className="text-left font-semibold text-text-primary hover:underline"
                    >
                      {partner.fullName}
                    </button>
                  </TableCell>
                  <TableCell className="text-caption text-muted-foreground">{partner.email}</TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {PARTNER_TYPE_LABEL[partner.partnerType]}
                  </TableCell>
                  <TableCell className="font-mono text-caption text-foreground">{partner.referralCode}</TableCell>
                  <TableCell className="text-caption text-muted-foreground">
                    {COMMISSION_TYPE_LABEL[partner.commissionType]}
                  </TableCell>
                  <TableCell>
                    <PartnerStatusPill status={partner.status} />
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Actions for ${partner.fullName}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(partner)}>View Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleViewDetails(partner)}>Edit Partner</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant={partner.status === "active" ? "destructive" : "default"}
                          onClick={() => handleRequestStatusChange(partner)}
                        >
                          {partner.status === "active" ? "Deactivate Partner" : "Activate Partner"}
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

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-border px-6 py-4">
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
              {confirmTarget?.nextStatus === "inactive" ? "Deactivate partner?" : "Activate partner?"}
            </DialogTitle>
            <DialogDescription>
              {confirmTarget?.nextStatus === "inactive"
                ? `Are you sure you want to deactivate "${confirmTarget?.partner.fullName}"? They will lose login access and their referral code will stop accepting new signups. History and earnings are preserved.`
                : `Are you sure you want to activate "${confirmTarget?.partner.fullName}"? They will regain platform access and their referral code will become active again.`}
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

      <PartnerDetailDrawer
        partner={selectedPartner}
        onOpenChange={(open) => {
          if (!open) setSelectedPartnerId(null);
        }}
        existingEmails={existingEmails}
        onUpdate={(id, patch) => updatePartner(id, patch)}
        onRequestStatusChange={handleRequestStatusChange}
      />
    </div>
  );
}
