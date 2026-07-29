"use client";

import { Pencil } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { Label } from "@/components/ui/label";
import {
  CLIENT_TYPES,
  formatUsd,
  isValidPrice,
  ITEM_KIND_LABEL,
  ITEM_KINDS,
  rateKey,
  type RateKey,
  type RateMap,
} from "@/lib/superAdminPaymentsData";
import { useAddOnRates, useGlobalRates } from "@/lib/usePaymentRates";

import { PaymentsShell } from "./PaymentsShell";

type SectionId = "global" | "addon";

function RateSection({
  title,
  description,
  sectionId,
  saved,
  draft,
  editingKey,
  errors,
  onStartEdit,
  onCancelEdit,
  onChange,
}: {
  title: string;
  description: string;
  sectionId: SectionId;
  saved: RateMap;
  draft: RateMap;
  editingKey: RateKey | null;
  errors: Partial<Record<RateKey, string>>;
  onStartEdit: (section: SectionId, key: RateKey) => void;
  onCancelEdit: (section: SectionId, key: RateKey) => void;
  onChange: (section: SectionId, key: RateKey, value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ITEM_KINDS.flatMap((kind) =>
          CLIENT_TYPES.map((clientType) => {
            const key = rateKey(kind, clientType);
            const editing = editingKey === key;
            const error = errors[key];
            const display = draft[key];
            return (
              <div key={`${sectionId}-${key}`} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-caption font-medium text-foreground">
                      {ITEM_KIND_LABEL[kind]}
                    </div>
                    <div className="text-overline text-muted-foreground">{clientType}</div>
                  </div>
                  {!editing ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label={`Edit ${ITEM_KIND_LABEL[kind]} ${clientType}`}
                      onClick={() => onStartEdit(sectionId, key)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  ) : null}
                </div>
                {editing ? (
                  <div className="mt-3 space-y-2">
                    <Label htmlFor={`${sectionId}-${key}`} className="sr-only">
                      Price
                    </Label>
                    <Input
                      id={`${sectionId}-${key}`}
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={display ?? ""}
                      onChange={(e) => onChange(sectionId, key, e.target.value)}
                      aria-invalid={Boolean(error)}
                    />
                    {error ? <p className="text-caption text-destructive">{error}</p> : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onCancelEdit(sectionId, key)}
                    >
                      Cancel edit
                    </Button>
                  </div>
                ) : (
                  <p className="mt-3 text-h6 text-foreground">
                    {isValidPrice(display) ? (
                      formatUsd(display)
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </p>
                )}
                {!editing && display !== saved[key] ? (
                  <p className="mt-1 text-overline text-amber-700">Unsaved change</p>
                ) : null}
              </div>
            );
          }),
        )}
      </CardContent>
    </Card>
  );
}

export function SetPriceScreen() {
  const { rates: globalRates, saveRates: saveGlobal, hydrated: gHydrated } = useGlobalRates();
  const { rates: addOnRates, saveRates: saveAddOn, hydrated: aHydrated } = useAddOnRates();

  const [globalDraft, setGlobalDraft] = useState<RateMap>({});
  const [addOnDraft, setAddOnDraft] = useState<RateMap>({});
  const [editingSection, setEditingSection] = useState<SectionId | null>(null);
  const [editingKey, setEditingKey] = useState<RateKey | null>(null);
  const [errors, setErrors] = useState<Partial<Record<RateKey, string>>>({});
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

  function startEdit(section: SectionId, key: RateKey) {
    setEditingSection(section);
    setEditingKey(key);
  }

  function cancelEdit(section: SectionId, key: RateKey) {
    if (section === "global") {
      setGlobalDraft((prev) => {
        const next = { ...prev };
        if (globalRates[key] === undefined) delete next[key];
        else next[key] = globalRates[key];
        return next;
      });
    } else {
      setAddOnDraft((prev) => {
        const next = { ...prev };
        if (addOnRates[key] === undefined) delete next[key];
        else next[key] = addOnRates[key];
        return next;
      });
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (editingKey === key && editingSection === section) {
      setEditingKey(null);
      setEditingSection(null);
    }
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
  }

  function validate(): boolean {
    const nextErrors: Partial<Record<RateKey, string>> = {};
    for (const map of [globalDraft, addOnDraft]) {
      for (const [k, v] of Object.entries(map) as [RateKey, number | undefined][]) {
        if (v === undefined) continue;
        if (!isValidPrice(v)) nextErrors[k] = "Please enter a valid price.";
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
    setEditingKey(null);
    setEditingSection(null);
    setConfirmOpen(false);
    toast.success("Rates updated.");
  }

  function discardAll() {
    setGlobalDraft(globalRates);
    setAddOnDraft(addOnRates);
    setErrors({});
    setEditingKey(null);
    setEditingSection(null);
    setConfirmOpen(false);
  }

  return (
    <PaymentsShell
      title="Set Price"
      description="Configure global bundle-inclusion rates and add-on top-up rates by item and client type."
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
      <div className="flex flex-col gap-6">
        <RateSection
          title="Global Rates"
          description="Prefill prices when including items in a bundle. Changes apply from each subscriber’s next billing cycle."
          sectionId="global"
          saved={globalRates}
          draft={globalDraft}
          editingKey={editingSection === "global" ? editingKey : null}
          errors={errors}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onChange={onChange}
        />
        <RateSection
          title="Add-On Rates"
          description="Rates charged when subscribers purchase items beyond their bundle allocation. Changes apply immediately."
          sectionId="addon"
          saved={addOnRates}
          draft={addOnDraft}
          editingKey={editingSection === "addon" ? editingKey : null}
          errors={errors}
          onStartEdit={startEdit}
          onCancelEdit={cancelEdit}
          onChange={onChange}
        />
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update rates?</DialogTitle>
            <DialogDescription>
              Are you sure you want to update these rates? Add-on rate changes will apply
              immediately; global rate changes will apply from each subscriber’s next billing cycle.
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
    </PaymentsShell>
  );
}
