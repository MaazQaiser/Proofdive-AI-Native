"use client";

import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  BILLING_CYCLE_LABEL,
  BILLING_CYCLES,
  calculateBundleItemSubtotal,
  createEmptyBundleDraft,
  formatUsd,
  getMasterclassById,
  hasConfiguredRate,
  isValidPrice,
  moduleShare,
  priceForSelectedModules,
  publishedMasterclasses,
  rateKey,
  roundMoney,
  type BillingCycle,
  type BundleCyclePrice,
  type BundleMasterclassSelection,
  type ClientType,
  type PaymentBundle,
  type RateMap,
} from "@/lib/superAdminPaymentsData";
import { usePaymentBundles } from "@/lib/usePaymentBundles";
import { useGlobalRates } from "@/lib/usePaymentRates";

import { PaymentsShell } from "./PaymentsShell";

type Props = {
  mode: "create" | "edit";
  bundleId?: string;
};

type FormErrors = Partial<Record<string, string>>;

export function BundleFormScreen({ mode, bundleId }: Props) {
  const router = useRouter();
  const { getById, upsert, nameTaken, hydrated } = usePaymentBundles();
  const { rates: globalRates } = useGlobalRates();

  const existing = bundleId ? getById(bundleId) : null;
  const [bundle, setBundle] = useState<PaymentBundle>(() => createEmptyBundleDraft());
  const [step, setStep] = useState<"form" | "preview">("form");
  const [errors, setErrors] = useState<FormErrors>({});
  const [cycleOverrides, setCycleOverrides] = useState<Partial<Record<BillingCycle, string>>>({});

  useEffect(() => {
    if (mode === "edit" && existing) {
      setBundle(existing);
      const overrides: Partial<Record<BillingCycle, string>> = {};
      for (const c of existing.cycles) {
        if (c.priceOverridden) overrides[c.cycle] = String(c.price);
      }
      setCycleOverrides(overrides);
    }
  }, [mode, existing]);

  const typeLocked = mode === "edit" && existing?.status !== "draft";
  const isActiveEdit = mode === "edit" && existing?.status === "active";

  const autoSubtotal = useMemo(() => calculateBundleItemSubtotal(bundle), [bundle]);

  const selectedCycles = bundle.cycles.map((c) => c.cycle);

  function updateField<K extends keyof PaymentBundle>(key: K, value: PaymentBundle[K]) {
    setBundle((prev) => ({ ...prev, [key]: value }));
  }

  function setType(type: ClientType) {
    setBundle((prev) => {
      const next = { ...prev, type };
      if (next.mockInterview.included && !next.mockInterview.priceOverridden) {
        next.mockInterview = {
          ...next.mockInterview,
          unitPrice: globalRates[rateKey("mockInterview", type)] ?? 0,
        };
      }
      if (next.storyboard.included && !next.storyboard.priceOverridden) {
        next.storyboard = {
          ...next.storyboard,
          unitPrice: globalRates[rateKey("storyboard", type)] ?? 0,
        };
      }
      if (next.masterclass.included) {
        next.masterclass = {
          ...next.masterclass,
          selections: next.masterclass.selections.map((sel) => {
            if (sel.priceOverridden) return sel;
            const mc = getMasterclassById(sel.masterclassId);
            const absolute = globalRates[rateKey("masterclass", type)] ?? 0;
            return {
              ...sel,
              price: priceForSelectedModules(
                absolute,
                mc?.modules.length ?? 0,
                sel.selectedModuleIds.length,
              ),
            };
          }),
        };
      }
      return next;
    });
  }

  function toggleItem(
    kind: "mockInterview" | "storyboard",
    included: boolean,
  ) {
    if (included && !hasConfiguredRate(globalRates, kind, bundle.type)) {
      toast.error(`${kind === "mockInterview" ? "Mock Interview" : "Storyboard"} Global Rate is not configured for ${bundle.type}.`);
      return;
    }
    setBundle((prev) => ({
      ...prev,
      [kind]: {
        ...prev[kind],
        included,
        unitPrice: included
          ? prev[kind].priceOverridden
            ? prev[kind].unitPrice
            : (globalRates[rateKey(kind, prev.type)] ?? 0)
          : prev[kind].unitPrice,
      },
    }));
  }

  function toggleMasterclass(included: boolean) {
    if (included && !hasConfiguredRate(globalRates, "masterclass", bundle.type)) {
      toast.error(`Masterclass Global Rate is not configured for ${bundle.type}.`);
      return;
    }
    setBundle((prev) => ({
      ...prev,
      masterclass: included
        ? { ...prev.masterclass, included: true }
        : { included: false, selections: [] },
    }));
  }

  function addMasterclass(masterclassId: string) {
    const mc = getMasterclassById(masterclassId);
    if (!mc) return;
    const absolute = globalRates[rateKey("masterclass", bundle.type)] ?? 0;
    const selection: BundleMasterclassSelection = {
      masterclassId,
      selectedModuleIds: mc.modules.map((m) => m.id),
      price: absolute,
    };
    setBundle((prev) => ({
      ...prev,
      masterclass: {
        ...prev.masterclass,
        selections: [...prev.masterclass.selections.filter((s) => s.masterclassId !== masterclassId), selection],
      },
    }));
  }

  function removeMasterclass(masterclassId: string) {
    setBundle((prev) => ({
      ...prev,
      masterclass: {
        ...prev.masterclass,
        selections: prev.masterclass.selections.filter((s) => s.masterclassId !== masterclassId),
      },
    }));
  }

  function toggleModule(masterclassId: string, moduleId: string, checked: boolean) {
    setBundle((prev) => ({
      ...prev,
      masterclass: {
        ...prev.masterclass,
        selections: prev.masterclass.selections.map((sel) => {
          if (sel.masterclassId !== masterclassId) return sel;
          const mc = getMasterclassById(masterclassId);
          const total = mc?.modules.length ?? 0;
          const absolute = globalRates[rateKey("masterclass", prev.type)] ?? sel.price;
          const baseAbsolute = sel.priceOverridden
            ? // Keep override absolute as current price / selected ratio is messy; use global for share
              (globalRates[rateKey("masterclass", prev.type)] ?? 0)
            : absolute;
          const share = moduleShare(baseAbsolute, total);
          let selected = sel.selectedModuleIds;
          if (checked) selected = [...new Set([...selected, moduleId])];
          else selected = selected.filter((id) => id !== moduleId);
          const price = sel.priceOverridden
            ? roundMoney(share * selected.length)
            : priceForSelectedModules(baseAbsolute, total, selected.length);
          return { ...sel, selectedModuleIds: selected, price };
        }),
      },
    }));
  }

  function toggleCycle(cycle: BillingCycle, checked: boolean) {
    setBundle((prev) => {
      let cycles = prev.cycles;
      if (checked) {
        if (!cycles.some((c) => c.cycle === cycle)) {
          const override = cycleOverrides[cycle];
          cycles = [
            ...cycles,
            {
              cycle,
              price: override ? Number(override) : autoSubtotal,
              priceOverridden: Boolean(override),
            },
          ];
        }
      } else {
        cycles = cycles.filter((c) => c.cycle !== cycle);
      }
      return { ...prev, cycles };
    });
  }

  // Keep non-overridden cycle prices in sync with subtotal
  useEffect(() => {
    setBundle((prev) => {
      let changed = false;
      const cycles = prev.cycles.map((c) => {
        if (c.priceOverridden || c.price === autoSubtotal) return c;
        changed = true;
        return { ...c, price: autoSubtotal };
      });
      return changed ? { ...prev, cycles } : prev;
    });
  }, [autoSubtotal]);

  function validate(): boolean {
    const next: FormErrors = {};
    if (!bundle.name.trim()) next.name = "Bundle name is required.";
    else if (nameTaken(bundle.name, bundle.id)) {
      next.name = "Bundle name already exists. Please choose a different name.";
    }
    if (!bundle.type) next.type = "Please select a bundle type.";
    const anyItem =
      bundle.mockInterview.included || bundle.storyboard.included || bundle.masterclass.included;
    if (!anyItem) {
      next.items = "Please include at least one item (Mock Interview, Storyboard, or Masterclass) in the bundle.";
    }
    if (bundle.mockInterview.included) {
      if (!Number.isInteger(bundle.mockInterview.quantity) || bundle.mockInterview.quantity < 1) {
        next.mockQty = "Please enter a valid quantity (minimum 1).";
      }
      if (!isValidPrice(bundle.mockInterview.unitPrice)) {
        next.mockPrice = "Please enter a valid price.";
      }
    }
    if (bundle.storyboard.included) {
      if (!Number.isInteger(bundle.storyboard.quantity) || bundle.storyboard.quantity < 1) {
        next.storyQty = "Please enter a valid quantity (minimum 1).";
      }
      if (!isValidPrice(bundle.storyboard.unitPrice)) {
        next.storyPrice = "Please enter a valid price.";
      }
    }
    if (bundle.masterclass.included) {
      if (bundle.masterclass.selections.length === 0) {
        next.masterclass = "Please select at least one masterclass.";
      }
      for (const sel of bundle.masterclass.selections) {
        if (sel.selectedModuleIds.length === 0) {
          next.modules = "Please keep at least one module selected per masterclass.";
        }
        if (!isValidPrice(sel.price)) next.mcPrice = "Please enter a valid price.";
      }
    }
    if (bundle.cycles.length === 0) {
      next.cycles = "Please select at least one billing cycle.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goPreview() {
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    // Apply cycle override strings
    const cycles: BundleCyclePrice[] = bundle.cycles.map((c) => {
      const raw = cycleOverrides[c.cycle];
      if (raw != null && raw !== "" && isValidPrice(Number(raw))) {
        return { ...c, price: Number(raw), priceOverridden: true };
      }
      return { ...c, price: autoSubtotal, priceOverridden: false };
    });
    setBundle((prev) => ({ ...prev, cycles }));
    setStep("preview");
  }

  function save(status: "draft" | "active") {
    const toSave: PaymentBundle = {
      ...bundle,
      name: bundle.name.trim(),
      status: isActiveEdit ? "active" : status,
      updatedAt: new Date().toISOString(),
    };
    upsert(toSave);
    if (isActiveEdit) toast.success("Bundle updated.");
    else if (toSave.status === "draft") toast.success("Bundle saved as draft.");
    else toast.success("Bundle activated.");
    router.push("/superadmin/payments");
  }

  if (mode === "edit" && hydrated && !existing) {
    return (
      <PaymentsShell title="Bundle not found">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-caption text-muted-foreground">This bundle does not exist.</p>
            <Button className="mt-4" onClick={() => router.push("/superadmin/payments")}>
              Back to listing
            </Button>
          </CardContent>
        </Card>
      </PaymentsShell>
    );
  }

  if (step === "preview") {
    return (
      <PaymentsShell
        title="Bundle preview"
        actions={
          <>
            <Button type="button" variant="outline" onClick={() => setStep("form")}>
              Back to edit
            </Button>
            {isActiveEdit ? (
              <Button type="button" onClick={() => save("active")}>
                Save
              </Button>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => save("draft")}>
                  Save as Draft
                </Button>
                <Button type="button" onClick={() => save("active")}>
                  Save & Activate
                </Button>
              </>
            )}
          </>
        }
      >
        <Card className="mx-auto w-full max-w-[800px]">
          <CardHeader>
            <CardTitle>{bundle.name}</CardTitle>
            <CardDescription>
              {bundle.type} · {bundle.description || "No description"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-caption">
            <PreviewItems bundle={bundle} rates={globalRates} />
            <div>
              <div className="font-medium text-foreground">Billing cycles</div>
              <ul className="mt-1 space-y-1 text-muted-foreground">
                {bundle.cycles.map((c) => (
                  <li key={c.cycle}>
                    {BILLING_CYCLE_LABEL[c.cycle]}: {formatUsd(c.price)}
                    {c.priceOverridden ? " (overridden)" : ""}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </PaymentsShell>
    );
  }

  return (
    <PaymentsShell
      title={mode === "create" ? "Create New Bundle" : `Edit: ${bundle.name || "Bundle"}`}
      actions={
        <>
          <Button type="button" variant="outline" onClick={() => router.push("/superadmin/payments")}>
            Cancel
          </Button>
          <Button type="button" onClick={goPreview}>
            Continue to preview
          </Button>
        </>
      }
    >
      <div className="mx-auto flex w-full max-w-[800px] flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Bundle Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bundle-name">Bundle Name</Label>
              <Input
                id="bundle-name"
                value={bundle.name}
                onChange={(e) => updateField("name", e.target.value)}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name ? <p className="text-caption text-destructive">{errors.name}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <Select
                value={bundle.type}
                disabled={typeLocked}
                onValueChange={(v) => setType(v as ClientType)}
              >
                <SelectTrigger className="w-full" aria-invalid={Boolean(errors.type)}>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="B2C">B2C</SelectItem>
                  <SelectItem value="B2B">B2B</SelectItem>
                </SelectContent>
              </Select>
              {typeLocked ? (
                <p className="text-overline text-muted-foreground">Type is locked after leaving Draft.</p>
              ) : null}
              {errors.type ? <p className="text-caption text-destructive">{errors.type}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="bundle-desc">Description</Label>
              <Textarea
                id="bundle-desc"
                value={bundle.description}
                onChange={(e) => updateField("description", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Included Items</CardTitle>
            <CardDescription>At least one item type is required.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {errors.items ? (
              <p className="text-caption text-destructive sm:col-span-2">{errors.items}</p>
            ) : null}

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="flex items-center gap-2 text-caption">
                <Checkbox
                  checked={bundle.mockInterview.included}
                  disabled={
                    !hasConfiguredRate(globalRates, "mockInterview", bundle.type) &&
                    !bundle.mockInterview.included
                  }
                  onCheckedChange={(c) => toggleItem("mockInterview", Boolean(c))}
                />
                Mock Interview
                {!hasConfiguredRate(globalRates, "mockInterview", bundle.type) &&
                !bundle.mockInterview.included ? (
                  <span className="text-overline text-muted-foreground">(set Global Rate first)</span>
                ) : null}
              </label>
            </div>
            {bundle.mockInterview.included ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    value={bundle.mockInterview.quantity}
                    onChange={(e) =>
                      setBundle((prev) => ({
                        ...prev,
                        mockInterview: {
                          ...prev.mockInterview,
                          quantity: Number(e.target.value) || 0,
                        },
                      }))
                    }
                  />
                  {errors.mockQty ? (
                    <p className="text-caption text-destructive">{errors.mockQty}</p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={bundle.mockInterview.unitPrice}
                    onChange={(e) =>
                      setBundle((prev) => ({
                        ...prev,
                        mockInterview: {
                          ...prev.mockInterview,
                          unitPrice: Number(e.target.value) || 0,
                          priceOverridden: true,
                        },
                      }))
                    }
                  />
                  {errors.mockPrice ? (
                    <p className="text-caption text-destructive">{errors.mockPrice}</p>
                  ) : null}
                </div>
              </>
            ) : null}

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="flex items-center gap-2 text-caption">
                <Checkbox
                  checked={bundle.storyboard.included}
                  disabled={
                    !hasConfiguredRate(globalRates, "storyboard", bundle.type) &&
                    !bundle.storyboard.included
                  }
                  onCheckedChange={(c) => toggleItem("storyboard", Boolean(c))}
                />
                Storyboard
                {!hasConfiguredRate(globalRates, "storyboard", bundle.type) &&
                !bundle.storyboard.included ? (
                  <span className="text-overline text-muted-foreground">(set Global Rate first)</span>
                ) : null}
              </label>
            </div>
            {bundle.storyboard.included ? (
              <>
                <div className="flex flex-col gap-1.5">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min={1}
                    value={bundle.storyboard.quantity}
                    onChange={(e) =>
                      setBundle((prev) => ({
                        ...prev,
                        storyboard: {
                          ...prev.storyboard,
                          quantity: Number(e.target.value) || 0,
                        },
                      }))
                    }
                  />
                  {errors.storyQty ? (
                    <p className="text-caption text-destructive">{errors.storyQty}</p>
                  ) : null}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    min={0.01}
                    step={0.01}
                    value={bundle.storyboard.unitPrice}
                    onChange={(e) =>
                      setBundle((prev) => ({
                        ...prev,
                        storyboard: {
                          ...prev.storyboard,
                          unitPrice: Number(e.target.value) || 0,
                          priceOverridden: true,
                        },
                      }))
                    }
                  />
                  {errors.storyPrice ? (
                    <p className="text-caption text-destructive">{errors.storyPrice}</p>
                  ) : null}
                </div>
              </>
            ) : null}

            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="flex items-center gap-2 text-caption">
                <Checkbox
                  checked={bundle.masterclass.included}
                  disabled={
                    !hasConfiguredRate(globalRates, "masterclass", bundle.type) &&
                    !bundle.masterclass.included
                  }
                  onCheckedChange={(c) => toggleMasterclass(Boolean(c))}
                />
                Masterclass
                {!hasConfiguredRate(globalRates, "masterclass", bundle.type) &&
                !bundle.masterclass.included ? (
                  <span className="text-overline text-muted-foreground">(set Global Rate first)</span>
                ) : null}
              </label>
            </div>
            {bundle.masterclass.included ? (
              <>
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <Label>Add Master Class Module</Label>
                  <div className="flex flex-wrap gap-2">
                    {publishedMasterclasses()
                      .filter(
                        (mc) =>
                          !bundle.masterclass.selections.some((s) => s.masterclassId === mc.id),
                      )
                      .map((mc) => (
                        <Button
                          key={mc.id}
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => addMasterclass(mc.id)}
                        >
                          <Plus className="h-4 w-4" />
                          {mc.name}
                        </Button>
                      ))}
                  </div>
                  {errors.masterclass ? (
                    <p className="text-caption text-destructive">{errors.masterclass}</p>
                  ) : null}
                </div>
                {bundle.masterclass.selections.map((sel) => {
                  const mc = getMasterclassById(sel.masterclassId);
                  if (!mc) return null;
                  return (
                    <div key={sel.masterclassId} className="contents">
                      <Separator className="sm:col-span-2" />
                      <div className="flex items-center justify-between gap-2 sm:col-span-2">
                        <span className="text-caption font-medium">{mc.name}</span>
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Remove ${mc.name}`}
                          onClick={() => removeMasterclass(sel.masterclassId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-col gap-2 sm:col-span-2">
                        {mc.modules.map((mod) => (
                          <label key={mod.id} className="flex items-center gap-2 text-caption">
                            <Checkbox
                              checked={sel.selectedModuleIds.includes(mod.id)}
                              onCheckedChange={(c) =>
                                toggleModule(sel.masterclassId, mod.id, Boolean(c))
                              }
                            />
                            {mod.name}
                            <span className="text-muted-foreground">
                              (
                              {formatUsd(
                                moduleShare(
                                  globalRates[rateKey("masterclass", bundle.type)] ?? 0,
                                  mc.modules.length,
                                ),
                              )}
                              )
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="flex flex-col gap-1.5 sm:col-span-2 sm:max-w-[calc(50%-0.5rem)]">
                        <Label>Masterclass Price</Label>
                        <Input
                          type="number"
                          min={0.01}
                          step={0.01}
                          value={sel.price}
                          onChange={(e) =>
                            setBundle((prev) => ({
                              ...prev,
                              masterclass: {
                                ...prev.masterclass,
                                selections: prev.masterclass.selections.map((s) =>
                                  s.masterclassId === sel.masterclassId
                                    ? {
                                        ...s,
                                        price: Number(e.target.value) || 0,
                                        priceOverridden: true,
                                      }
                                    : s,
                                ),
                              },
                            }))
                          }
                        />
                      </div>
                    </div>
                  );
                })}
                {errors.modules ? (
                  <p className="text-caption text-destructive sm:col-span-2">{errors.modules}</p>
                ) : null}
                {errors.mcPrice ? (
                  <p className="text-caption text-destructive sm:col-span-2">{errors.mcPrice}</p>
                ) : null}
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing Cycle & Pricing</CardTitle>
            <CardDescription>
              Calculated subtotal: {formatUsd(autoSubtotal)}. Override per cycle as needed.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {errors.cycles ? (
              <p className="text-caption text-destructive">{errors.cycles}</p>
            ) : null}
            {BILLING_CYCLES.map((cycle) => {
              const checked = selectedCycles.includes(cycle);
              return (
                <div key={cycle} className="grid gap-4 sm:grid-cols-2">
                  <label className="flex min-h-9 items-center gap-2 text-caption">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) => toggleCycle(cycle, Boolean(c))}
                    />
                    {BILLING_CYCLE_LABEL[cycle]}
                  </label>
                  {checked ? (
                    <div className="flex flex-col gap-1.5">
                      <Label className="sr-only">Price for {BILLING_CYCLE_LABEL[cycle]}</Label>
                      <Input
                        type="number"
                        min={0.01}
                        step={0.01}
                        placeholder={String(autoSubtotal)}
                        value={cycleOverrides[cycle] ?? ""}
                        onChange={(e) =>
                          setCycleOverrides((prev) => ({ ...prev, [cycle]: e.target.value }))
                        }
                      />
                      <span className="text-overline text-muted-foreground">
                        default {formatUsd(autoSubtotal)}
                      </span>
                    </div>
                  ) : (
                    <div className="hidden sm:block" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </PaymentsShell>
  );
}

function PreviewItems({ bundle, rates }: { bundle: PaymentBundle; rates: RateMap }) {
  return (
    <div>
      <div className="font-medium text-foreground">Included items</div>
      <ul className="mt-1 space-y-1 text-muted-foreground">
        {bundle.mockInterview.included ? (
          <li>
            Mock Interview × {bundle.mockInterview.quantity} @{" "}
            {formatUsd(bundle.mockInterview.unitPrice)}
          </li>
        ) : null}
        {bundle.storyboard.included ? (
          <li>
            Storyboard × {bundle.storyboard.quantity} @ {formatUsd(bundle.storyboard.unitPrice)}
          </li>
        ) : null}
        {bundle.masterclass.included
          ? bundle.masterclass.selections.map((sel) => {
              const mc = getMasterclassById(sel.masterclassId);
              return (
                <li key={sel.masterclassId}>
                  {mc?.name ?? sel.masterclassId}: {sel.selectedModuleIds.length} modules ·{" "}
                  {formatUsd(sel.price)}
                  {rates ? null : null}
                </li>
              );
            })
          : null}
      </ul>
    </div>
  );
}
