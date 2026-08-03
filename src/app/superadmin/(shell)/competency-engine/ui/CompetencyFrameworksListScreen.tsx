"use client";

import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Copy,
  MoreHorizontal,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import type {
  CompetencyFrameworkVersion,
  FrameworkStatus,
} from "@/lib/superAdminCompetencyFrameworks";
import { useCompetencyFrameworks } from "@/lib/useCompetencyFrameworks";

import { CreateFrameworkCopyDialog } from "./CreateFrameworkCopyDialog";
import { FrameworkDetailDrawer, FrameworkStatusPill } from "./FrameworkDetailDrawer";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50] as const;

function formatUpdated(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export function CompetencyFrameworksListScreen() {
  const router = useRouter();
  const { frameworks, createCopy, deleteFramework, isNameTaken, hydrated } =
    useCompetencyFrameworks();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FrameworkStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "default" | "custom">("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(ROWS_PER_PAGE_OPTIONS[0]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copySource, setCopySource] = useState<CompetencyFrameworkVersion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CompetencyFrameworkVersion | null>(null);

  const selectedFramework = frameworks.find((f) => f.id === selectedId) ?? null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return frameworks.filter((f) => {
      if (q && !f.name.toLowerCase().includes(q)) return false;
      if (statusFilter !== "all" && f.status !== statusFilter) return false;
      if (typeFilter === "default" && !f.isDefault) return false;
      if (typeFilter === "custom" && f.isDefault) return false;
      return true;
    });
  }, [frameworks, search, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * rowsPerPage;
  const pageEnd = Math.min(pageStart + rowsPerPage, filtered.length);
  const pageRows = filtered.slice(pageStart, pageEnd);

  function openCopy(framework: CompetencyFrameworkVersion) {
    setCopySource(framework);
  }

  function handleConfirmCopy(name: string) {
    if (!copySource) return;
    const created = createCopy(copySource.id, name);
    if (!created) {
      toast.error("Could not create framework copy.");
      return;
    }
    setCopySource(null);
    setSelectedId(null);
    toast.success(`Draft "${created.name}" created.`);
    router.push(`/superadmin/competency-engine/${created.id}/edit`);
  }

  function handleConfirmDelete() {
    if (!deleteTarget || deleteTarget.isDefault) return;
    deleteFramework(deleteTarget.id);
    if (selectedId === deleteTarget.id) setSelectedId(null);
    setDeleteTarget(null);
    toast.success("Framework deleted.");
  }

  const defaultFramework = frameworks.find((f) => f.isDefault) ?? frameworks[0] ?? null;

  return (
    <div className="-mx-6 -mb-6 flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
        <h1 className="text-h4 text-foreground">Competency Frameworks</h1>
        <Button
          type="button"
          onClick={() => defaultFramework && openCopy(defaultFramework)}
          disabled={!defaultFramework}
        >
          <Copy className="h-4 w-4" />
          Create copy
        </Button>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border px-6 py-3">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name…"
            className="pl-9"
          />
        </div>
        <Separator orientation="vertical" className="h-6" />
        <Select
          value={typeFilter}
          onValueChange={(v) => {
            setTypeFilter(v as typeof typeFilter);
            setPage(1);
          }}
        >
          <SelectTrigger size="sm" className="w-[168px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as typeof statusFilter);
            setPage(1);
          }}
        >
          <SelectTrigger size="sm" className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!hydrated ? (
          <p className="px-6 py-4 text-body-sm text-muted-foreground">Loading frameworks…</p>
        ) : filtered.length === 0 ? (
          <p className="px-6 py-4 text-body-sm text-muted-foreground">
            {frameworks.length === 0
              ? "No competency frameworks yet."
              : "No frameworks match your filters."}
          </p>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <TableHeader className="sticky top-0 z-10 border-b border-border bg-background">
              <TableRow>
                <TableHead className="text-overline pl-6 text-muted-foreground">Name</TableHead>
                <TableHead className="text-overline text-muted-foreground">Type</TableHead>
                <TableHead className="text-overline text-muted-foreground">Status</TableHead>
                <TableHead className="text-overline text-muted-foreground">Competencies</TableHead>
                <TableHead className="text-overline text-muted-foreground">Updated</TableHead>
                <TableHead className="text-overline w-12 pr-6 text-right text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((framework) => (
                <TableRow key={framework.id}>
                  <TableCell className="pl-6">
                    <button
                      type="button"
                      className="text-left font-semibold text-text-primary hover:underline"
                      onClick={() => setSelectedId(framework.id)}
                    >
                      {framework.name}
                    </button>
                  </TableCell>
                  <TableCell>
                    {framework.isDefault ? (
                      <Badge variant="secondary">Default</Badge>
                    ) : (
                      <Badge variant="outline">Custom</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <FrameworkStatusPill status={framework.status} />
                  </TableCell>
                  <TableCell>{framework.competencies.length}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatUpdated(framework.updatedAt)}
                  </TableCell>
                  <TableCell className="pr-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Framework actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedId(framework.id)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openCopy(framework)}>
                          Create copy
                        </DropdownMenuItem>
                        {!framework.isDefault ? (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/superadmin/competency-engine/${framework.id}/edit`,
                                )
                              }
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteTarget(framework)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </>
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

      <div className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-t border-border bg-background px-6 py-4">
        <div className="text-caption flex items-center gap-2 text-muted-foreground">
          <span>Rows per page</span>
          <Select
            value={String(rowsPerPage)}
            onValueChange={(v) => {
              setRowsPerPage(Number(v));
              setPage(1);
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
              type="button"
              variant="ghost"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => setPage(1)}
              aria-label="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(totalPages)}
              aria-label="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <FrameworkDetailDrawer
        framework={selectedFramework}
        frameworks={frameworks}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
        onCreateCopy={(framework) => {
          setSelectedId(null);
          openCopy(framework);
        }}
        onSelectFramework={(id) => setSelectedId(id)}
      />

      <CreateFrameworkCopyDialog
        open={copySource !== null}
        source={copySource}
        isNameTaken={isNameTaken}
        onOpenChange={(open) => {
          if (!open) setCopySource(null);
        }}
        onConfirm={handleConfirmCopy}
      />

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete framework?</DialogTitle>
            <DialogDescription>
              This permanently removes{" "}
              <span className="font-medium text-foreground">{deleteTarget?.name}</span>{" "}
              from this admin session store. Organizations still pointing at it will need another
              framework assigned.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
