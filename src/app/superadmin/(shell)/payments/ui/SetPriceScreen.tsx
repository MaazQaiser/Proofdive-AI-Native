"use client";

import { Check, Pencil, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CLIENT_TYPES,
  formatUsd,
  isValidPrice,
  ITEM_KIND_LABEL,
  ITEM_KINDS,
  rateKey,
  type ClientType,
  type ItemKind,
  type RateKey,
  type RateMap,
} from "@/lib/superAdminPaymentsData";
import { useAddOnRates, useGlobalRates } from "@/lib/usePaymentRates";

import { PaymentsShell } from "./PaymentsShell";

type SectionId = "global" | "addon";

type CellSpec = {
  section: SectionId;
  clientType: ClientType;
  label: string;
};

const PRICE_CELLS: CellSpec[] = [
  { section: "global", clientType: "B2C", label: "Global B2C" },
  { section: "global", clientType: "B2B", label: "Global B2B" },
  { section: "addon", clientType: "B2C", label: "Add-on B2C" },
  { section: "addon", clientType: "B2B", label: "Add-on B2B" },
];

function keysForKind(kind: ItemKind): RateKey[] {
  return CLIENT_TYPES.map((clientType) => rateKey(kind, clientType));
}

function PriceDisplay({ value }: { value: number | undefined }) {
  if (isValidPrice(value)) {
    return <span className="text-foreground">{formatUsd(value)}</span>;
  }
  return <span className="text-muted-foreground">Not set</span>;
}

export function SetPriceScreen() {
  const { rates: globalRates, saveRates: saveGlobal, hydrated: gHydrated } = useGlobalRates();
  const { rates: addOnRates, saveRates: saveAddOn, hydrated: aHydrated } = useAddOnRates();

  const [globalDraft, setGlobalDraft] = useState<RateMap>({});
  const [addOnDraft, setAddOnDraft] = useState<RateMap>({});
  const [editingKind, setEditingKind] = useState<ItemKind | null>(null);
  const [errors, setErrors] = useState<Partial<Record<`${SectionId}:${RateKey}`, string>>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (gHydrated) setGlobalDraft(globalRates);
  }, [gHydrated, globalRates]);

  useEffect(() => {
    if (aHydrated) setAddOnDraft(addOnRates);
  }, [aHydrated, addOnRates]);

  const dirty = useMemo(
    () =>
      JSON.stringify(globalDraft) !== JSON.stringify(globalRates) ||
      JSON.stringify(addOnDraft) !== JSON.stringify(addOnRates),
    [globalDraft, globalRates, addOnDraft, addOnRates],
  );

  function draftFor(section: SectionId): RateMap {
    return section === "global" ? globalDraft : addOnDraft;
  }

  function savedFor(section: SectionId): RateMap {
    return section === "global" ? globalRates : addOnRates;
  }

  function errorKey(section: SectionId, key: RateKey): `${SectionId}:${RateKey}` {
    return `${section}:${key}`;
  }

  function startEdit(kind: ItemKind) {
    setEditingKind(kind);
  }

  function confirmEdit(kind: ItemKind) {
    const nextErrors: Partial<Record<`${SectionId}:${RateKey}`, string>> = { ...errors };
    let hasError = false;

    for (const cell of PRICE_CELLS) {
      const key = rateKey(kind, cell.clientType);
      const value = draftFor(cell.section)[key];
      const ek = errorKey(cell.section, key);
      if (value !== undefined && !isValidPrice(value)) {
        nextErrors[ek] = "Please enter a valid price.";
        hasError = true;
      } else {
        delete nextErrors[ek];
      }
    }

    setErrors(nextErrors);
    if (hasError) return;
    if (editingKind === kind) setEditingKind(null);
  }

  function cancelEdit(kind: ItemKind) {
    const keys = keysForKind(kind);
    setGlobalDraft((prev) => {
      const next = { ...prev };
      for (const key of keys) {
        if (globalRates[key] === undefined) delete next[key];
        else next[key] = globalRates[key];
      }
      return next;
    });
    setAddOnDraft((prev) => {
      const next = { ...prev };
      for (const key of keys) {
        if (addOnRates[key] === undefined) delete next[key];
        else next[key] = addOnRates[key];
      }
      return next;
    });
    setErrors((prev) => {
      const next = { ...prev };
      for (const section of ["global", "addon"] as SectionId[]) {
        for (const key of keys) {
          delete next[errorKey(section, key)];
        }
      }
      return next;
    });
    if (editingKind === kind) setEditingKind(null);
  }

  function onChange(section: SectionId, key: RateKey, value: string) {
    const n = value === "" ? undefined : Number(value);
    const apply = (prev: RateMap): RateMap => {
      const next = { ...prev };
      if (n === undefined || Number.isNaN(n)) delete next[key];
      else next[key] = n;
      return next;
    };
    if (section === "global") setGlobalDraft(apply);
    else setAddOnDraft(apply);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[errorKey(section, key)];
      return next;
    });
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<`${SectionId}:${RateKey}`, string>> = {};
    for (const section of ["global", "addon"] as SectionId[]) {
      const map = draftFor(section);
      for (const [k, v] of Object.entries(map) as [RateKey, number | undefined][]) {
        if (v === undefined) continue;
        if (!isValidPrice(v)) nextErrors[errorKey(section, k)] = "Please enter a valid price.";
      }
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function requestSave() {
    if (!dirty) {
      toast.message("No changes to save.");
      return;
    }
    if (!validate()) {
      toast.error("Please fix invalid prices before saving.");
      return;
    }
    setConfirmOpen(true);
  }

  function confirmSave() {
    saveGlobal(globalDraft);
    saveAddOn(addOnDraft);
    setEditingKind(null);
    setConfirmOpen(false);
    toast.success("Rates updated.");
  }

  function discardAll() {
    setGlobalDraft(globalRates);
    setAddOnDraft(addOnRates);
    setErrors({});
    setEditingKind(null);
    setConfirmOpen(false);
  }

  return (
    <PaymentsShell
      title="Payments"
      actions={
        <>
          <Button type="button" variant="outline" disabled={!dirty} onClick={discardAll}>
            Discard
          </Button>
          <Button type="button" disabled={!dirty} onClick={requestSave}>
            Save changes
          </Button>
        </>
      }
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
          <table className="w-full min-w-[800px] table-fixed caption-bottom text-sm">
            <colgroup>
              <col className="w-[180px]" />
              <col />
              <col />
              <col />
              <col />
              <col className="w-[96px]" />
            </colgroup>
            <TableHeader sticky>
              <TableRow>
                <TableHead className="text-overline pl-6 text-muted-foreground">Item</TableHead>
                {PRICE_CELLS.map((cell) => (
                  <TableHead key={`${cell.section}-${cell.clientType}`} className="text-overline text-muted-foreground">
                    {cell.label}
                  </TableHead>
                ))}
                <TableHead className="text-overline pr-6 text-right text-muted-foreground">Edit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ITEM_KINDS.map((kind) => {
                const editing = editingKind === kind;
                return (
                  <TableRow key={kind}>
                    <TableCell className="pl-6 font-medium text-foreground">
                      {ITEM_KIND_LABEL[kind]}
                    </TableCell>
                    {PRICE_CELLS.map((cell) => {
                      const key = rateKey(kind, cell.clientType);
                      const value = draftFor(cell.section)[key];
                      const saved = savedFor(cell.section)[key];
                      const ek = errorKey(cell.section, key);
                      const error = errors[ek];
                      const inputId = `${cell.section}-${key}`;

                      return (
                        <TableCell key={inputId} className="align-middle">
                          <div className="w-full max-w-[9rem]">
                            <div className="flex h-9 items-center">
                              {editing ? (
                                <>
                                  <Label htmlFor={inputId} className="sr-only">
                                    {ITEM_KIND_LABEL[kind]} {cell.label}
                                  </Label>
                                  <Input
                                    id={inputId}
                                    type="number"
                                    min={0.01}
                                    step={0.01}
                                    className="h-9 w-full"
                                    value={value ?? ""}
                                    placeholder="0.00"
                                    onChange={(e) => onChange(cell.section, key, e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault();
                                        confirmEdit(kind);
                                      }
                                      if (e.key === "Escape") {
                                        e.preventDefault();
                                        cancelEdit(kind);
                                      }
                                    }}
                                    aria-invalid={Boolean(error)}
                                  />
                                </>
                              ) : (
                                <PriceDisplay value={value} />
                              )}
                            </div>
                            {editing && error ? (
                              <p className="mt-0.5 text-caption text-destructive">{error}</p>
                            ) : null}
                            {!editing && value !== saved ? (
                              <span className="mt-0.5 block text-overline text-amber-700">Unsaved</span>
                            ) : null}
                          </div>
                        </TableCell>
                      );
                    })}
                    <TableCell className="pr-6 text-right align-middle">
                      <div className="ml-auto flex h-9 w-[76px] items-center justify-end gap-1">
                        {editing ? (
                          <>
                            <Button
                              type="button"
                              size="icon"
                              aria-label={`Confirm ${ITEM_KIND_LABEL[kind]} prices`}
                              onClick={() => confirmEdit(kind)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              aria-label={`Cancel ${ITEM_KIND_LABEL[kind]} edit`}
                              onClick={() => cancelEdit(kind)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label={`Edit ${ITEM_KIND_LABEL[kind]}`}
                            onClick={() => startEdit(kind)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </table>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update rates?</DialogTitle>
              <DialogDescription>
                Are you sure you want to update these rates? Add-on rate changes will apply
                immediately; global rate changes will apply from each subscriber’s next billing
                cycle.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={discardAll}>
                Cancel
              </Button>
              <Button type="button" onClick={confirmSave}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PaymentsShell>
  );
}
