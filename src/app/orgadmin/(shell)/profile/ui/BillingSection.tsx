"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import { buildSeedAuditLog, type AuditLogEntry } from "@/lib/orgAdminAuditLog";
import {
  SEED_INVOICES,
  SEED_PAYMENT_METHODS,
  type BillingAddOnDeltas,
  type Invoice,
  type PaymentMethod,
} from "@/lib/orgAdminBillingData";
import { ORG_ADMIN_DEMO_ORG } from "@/lib/orgAdminDemo";
import { ORG_ADMIN_USERS } from "@/lib/orgAdminUsers";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  BILLING_CYCLE_LABEL,
  centsFromDollars,
  formatUsd,
  getMasterclassById,
  hasConfiguredRate,
  ITEM_KIND_LABEL,
  moduleShare,
  priceForSelectedModules,
  publishedMasterclasses,
  rateKey,
  roundMoney,
  SEED_BUNDLES,
  type ItemKind,
} from "@/lib/superAdminPaymentsData";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { usePaymentBundles } from "@/lib/usePaymentBundles";
import { useAddOnRates } from "@/lib/usePaymentRates";
import { useOrgAdminSubscription } from "@/lib/useSubscriberPayments";

import { InvoiceHistoryTable } from "./InvoiceHistoryTable";
import { PaymentMethodsCard } from "./PaymentMethodsCard";

export function BillingSection() {
  const [subscription, setSubscription] = useOrgAdminSubscription();
  const { bundles, hydrated: bundlesHydrated } = usePaymentBundles();
  const { rates: addOnRates } = useAddOnRates();
  const [, setDeltas] = useLocalStorageState<BillingAddOnDeltas>(
    StorageKeys.orgAdminBillingOverrides,
    {},
  );
  const [methods] = useLocalStorageState<PaymentMethod[]>(
    StorageKeys.orgAdminPaymentMethods,
    SEED_PAYMENT_METHODS,
  );
  const [, setInvoices] = useLocalStorageState<Invoice[]>(StorageKeys.orgAdminInvoices, SEED_INVOICES);
  const [, setAuditEntries] = useLocalStorageState<AuditLogEntry[]>(
    StorageKeys.orgAdminAuditLogEntries,
    buildSeedAuditLog(ORG_ADMIN_DEMO_ORG.contactName),
  );

  const accountCount = ORG_ADMIN_USERS.length;
  const bundle =
    bundles.find((b) => b.id === subscription.bundleId) ??
    SEED_BUNDLES.find((b) => b.id === subscription.bundleId) ??
    null;

  const cyclePrice =
    bundle?.cycles.find((c) => c.cycle === subscription.billingCycle)?.price ?? 0;
  const totalPrice = roundMoney(cyclePrice * accountCount);

  const [addOnsOpen, setAddOnsOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Subscription Overview</CardTitle>
              <CardDescription>
                Your organization’s plan is assigned by Super Admin. Seat count updates with User
                Management.
              </CardDescription>
            </div>
            {bundle ? <Badge variant="secondary">{bundle.name}</Badge> : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!bundlesHydrated ? (
            <p className="text-caption text-muted-foreground">Loading subscription…</p>
          ) : !bundle ? (
            <p className="text-caption text-muted-foreground">
              No active bundle assigned. Contact ProofDive support.
            </p>
          ) : (
            <>
              <dl className="grid gap-3 sm:grid-cols-2">
                <Detail label="Active Bundle" value={bundle.name} />
                <Detail
                  label="Billing Cycle"
                  value={BILLING_CYCLE_LABEL[subscription.billingCycle]}
                />
                <Detail label="Price per Account" value={formatUsd(cyclePrice)} />
                <Detail label="Current Account Count" value={String(accountCount)} />
                <Detail label="Total Price" value={formatUsd(totalPrice)} />
                <Detail label="Next Billing Date" value={subscription.nextBillingDate} />
              </dl>
              <div>
                <div className="text-caption font-medium text-foreground">
                  Included items (per account)
                </div>
                <ul className="mt-2 space-y-1 text-caption text-muted-foreground">
                  {bundle.mockInterview.included ? (
                    <li>Mock Interviews × {bundle.mockInterview.quantity}</li>
                  ) : null}
                  {bundle.storyboard.included ? (
                    <li>Storyboards × {bundle.storyboard.quantity}</li>
                  ) : null}
                  {bundle.masterclass.included
                    ? bundle.masterclass.selections.map((sel) => {
                        const mc = getMasterclassById(sel.masterclassId);
                        return (
                          <li key={sel.masterclassId}>
                            {mc?.name}: {sel.selectedModuleIds.length} modules
                          </li>
                        );
                      })
                    : null}
                </ul>
              </div>
              <p className="text-overline text-muted-foreground">
                Adding an account mid-cycle charges the full per-account price immediately. Removing
                an account does not refund the current cycle.
              </p>
              <Button type="button" onClick={() => setAddOnsOpen(true)}>
                Purchase Add-Ons
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <PaymentMethodsCard />
      <InvoiceHistoryTable />

      <OrgPurchaseAddOnsDialog
        open={addOnsOpen}
        onOpenChange={setAddOnsOpen}
        accountCount={accountCount}
        addOnRates={addOnRates}
        defaultCard={methods.find((m) => m.isDefault) ?? methods[0] ?? null}
        onSuccess={(totalDollars, summary, deltas) => {
          setDeltas((prev) => {
            const next = { ...prev };
            for (const [k, v] of Object.entries(deltas)) {
              next[k] = (next[k] ?? 0) + v;
            }
            return next;
          });
          const invNumber = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
          setInvoices((prev) => [
            {
              id: `inv_${Date.now()}`,
              invoiceNumber: invNumber,
              paymentDate: new Date().toISOString().slice(0, 10),
              amountCents: centsFromDollars(totalDollars),
              status: "paid",
            },
            ...prev,
          ]);
          setAuditEntries((prev) => [
            {
              id: `log_${Date.now()}`,
              description: `${ORG_ADMIN_DEMO_ORG.contactName} purchased org-wide add-ons: ${summary}.`,
              performedBy: ORG_ADMIN_DEMO_ORG.contactName,
              timestamp: new Date().toISOString(),
              activityType: "billing",
            },
            ...prev,
          ]);
          setSubscription((prev) => ({ ...prev, lastAddOnAccountCount: accountCount }));
          toast.success("Add-ons applied to all current accounts.");
        }}
      />
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-overline text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-caption font-medium text-foreground">{value}</dd>
    </div>
  );
}

function OrgPurchaseAddOnsDialog({
  open,
  onOpenChange,
  accountCount,
  addOnRates,
  defaultCard,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accountCount: number;
  addOnRates: ReturnType<typeof useAddOnRates>["rates"];
  defaultCard: PaymentMethod | null;
  onSuccess: (
    totalDollars: number,
    summary: string,
    deltas: BillingAddOnDeltas,
  ) => void;
}) {
  const [selected, setSelected] = useState<Partial<Record<ItemKind, boolean>>>({});
  const [mockQty, setMockQty] = useState("1");
  const [storyQty, setStoryQty] = useState("1");
  const [moduleIds, setModuleIds] = useState<string[]>(() =>
    publishedMasterclasses().flatMap((mc) => mc.modules.map((m) => m.id)),
  );
  const [step, setStep] = useState<"configure" | "review">("configure");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [forceFail, setForceFail] = useState(false);

  const masterclasses = publishedMasterclasses();
  const totalModules = masterclasses.reduce((n, mc) => n + mc.modules.length, 0);
  const absoluteMc = addOnRates[rateKey("masterclass", "B2B")];

  const lineItems = useMemo(() => {
    const items: { kind: ItemKind; label: string; perAccount: number; detail: string }[] = [];
    if (selected.mockInterview) {
      const qty = Number(mockQty) || 0;
      const unit = addOnRates[rateKey("mockInterview", "B2B")] ?? 0;
      items.push({
        kind: "mockInterview",
        label: ITEM_KIND_LABEL.mockInterview,
        perAccount: roundMoney(qty * unit),
        detail: `× ${qty}`,
      });
    }
    if (selected.storyboard) {
      const qty = Number(storyQty) || 0;
      const unit = addOnRates[rateKey("storyboard", "B2B")] ?? 0;
      items.push({
        kind: "storyboard",
        label: ITEM_KIND_LABEL.storyboard,
        perAccount: roundMoney(qty * unit),
        detail: `× ${qty}`,
      });
    }
    if (selected.masterclass && isValidAddOnRate(absoluteMc)) {
      const perAccount = priceForSelectedModules(absoluteMc, totalModules, moduleIds.length);
      items.push({
        kind: "masterclass",
        label: ITEM_KIND_LABEL.masterclass,
        perAccount,
        detail: `${moduleIds.length} modules`,
      });
    }
    return items;
  }, [selected, mockQty, storyQty, moduleIds, addOnRates, absoluteMc, totalModules]);

  const totalPerAccount = roundMoney(lineItems.reduce((s, i) => s + i.perAccount, 0));
  const total = roundMoney(totalPerAccount * accountCount);

  function reset() {
    setSelected({});
    setMockQty("1");
    setStoryQty("1");
    setModuleIds(masterclasses.flatMap((mc) => mc.modules.map((m) => m.id)));
    setStep("configure");
    setErrors({});
    setForceFail(false);
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!selected.mockInterview && !selected.storyboard && !selected.masterclass) {
      next.items = "Please select at least one item.";
    }
    if (selected.mockInterview) {
      const n = Number(mockQty);
      if (!Number.isInteger(n) || n < 1) next.mockQty = "Please enter a valid quantity.";
      if (!hasConfiguredRate(addOnRates, "mockInterview", "B2B")) {
        next.mockQty = "Add-on rate not configured.";
      }
    }
    if (selected.storyboard) {
      const n = Number(storyQty);
      if (!Number.isInteger(n) || n < 1) next.storyQty = "Please enter a valid quantity.";
      if (!hasConfiguredRate(addOnRates, "storyboard", "B2B")) {
        next.storyQty = "Add-on rate not configured.";
      }
    }
    if (selected.masterclass) {
      if (moduleIds.length < 1) next.modules = "Please select at least one module.";
      if (!hasConfiguredRate(addOnRates, "masterclass", "B2B")) {
        next.modules = "Add-on rate not configured.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function confirmPay() {
    if (!defaultCard) {
      toast.error("Please enter valid card details.");
      return;
    }
    if (forceFail) {
      toast.error("Unable to process payment at the moment.");
      setStep("review");
      return;
    }
    const deltas: BillingAddOnDeltas = {};
    if (selected.mockInterview) deltas.mockInterviews = Number(mockQty);
    if (selected.storyboard) deltas.storyboards = Number(storyQty);
    const summary = lineItems.map((i) => `${i.label} ${i.detail}`).join(", ");
    onSuccess(total, summary, deltas);
    onOpenChange(false);
    reset();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === "configure" ? "Purchase Add-Ons" : "Review & pay"}
          </DialogTitle>
          <DialogDescription>
            {step === "configure"
              ? "Top up Mock Interview, Storyboard, and/or Masterclass usage for every current account."
              : `Charging ${formatUsd(total)} across ${accountCount} accounts via simulated Stripe.`}
          </DialogDescription>
        </DialogHeader>

        {step === "configure" ? (
          <div className="space-y-4">
            {errors.items ? <p className="text-caption text-destructive">{errors.items}</p> : null}
            {(
              [
                ["mockInterview", "Mock Interview"],
                ["storyboard", "Storyboard"],
                ["masterclass", "Masterclass"],
              ] as const
            ).map(([kind, label]) => {
              const available = hasConfiguredRate(addOnRates, kind, "B2B");
              return (
                <div key={kind} className="rounded-xl border border-border p-3">
                  <label className="flex items-center gap-2 text-caption font-medium">
                    <Checkbox
                      checked={Boolean(selected[kind])}
                      disabled={!available}
                      onCheckedChange={(c) =>
                        setSelected((prev) => ({ ...prev, [kind]: Boolean(c) }))
                      }
                    />
                    {label}
                    {!available ? (
                      <span className="text-overline font-normal text-muted-foreground">
                        (unavailable)
                      </span>
                    ) : null}
                  </label>
                  {selected[kind] && kind === "mockInterview" ? (
                    <div className="mt-2 space-y-1">
                      <Label>Quantity per account</Label>
                      <Input
                        type="number"
                        min={1}
                        value={mockQty}
                        onChange={(e) => setMockQty(e.target.value)}
                        placeholder="1"
                      />
                      {errors.mockQty ? (
                        <p className="text-caption text-destructive">{errors.mockQty}</p>
                      ) : null}
                    </div>
                  ) : null}
                  {selected[kind] && kind === "storyboard" ? (
                    <div className="mt-2 space-y-1">
                      <Label>Quantity per account</Label>
                      <Input
                        type="number"
                        min={1}
                        value={storyQty}
                        onChange={(e) => setStoryQty(e.target.value)}
                        placeholder="1"
                      />
                      {errors.storyQty ? (
                        <p className="text-caption text-destructive">{errors.storyQty}</p>
                      ) : null}
                    </div>
                  ) : null}
                  {selected[kind] && kind === "masterclass" ? (
                    <div className="mt-2 space-y-2">
                      {masterclasses.map((mc) => (
                        <div key={mc.id}>
                          <div className="text-overline text-muted-foreground">{mc.name}</div>
                          {mc.modules.map((mod) => (
                            <label
                              key={mod.id}
                              className="mt-1 flex items-center gap-2 text-caption"
                            >
                              <Checkbox
                                checked={moduleIds.includes(mod.id)}
                                onCheckedChange={(c) => {
                                  setModuleIds((prev) =>
                                    c
                                      ? [...new Set([...prev, mod.id])]
                                      : prev.filter((id) => id !== mod.id),
                                  );
                                }}
                              />
                              {mod.name}
                              {isValidAddOnRate(absoluteMc) ? (
                                <span className="text-muted-foreground">
                                  ({formatUsd(moduleShare(absoluteMc, totalModules))})
                                </span>
                              ) : null}
                            </label>
                          ))}
                        </div>
                      ))}
                      {errors.modules ? (
                        <p className="text-caption text-destructive">{errors.modules}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3 text-caption">
            {lineItems.map((item) => (
              <div key={item.kind} className="flex justify-between gap-4">
                <span>
                  {item.label} {item.detail} × {accountCount} accounts
                </span>
                <span className="font-medium">
                  {formatUsd(roundMoney(item.perAccount * accountCount))}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-2 font-medium">
              <span>Total</span>
              <span>{formatUsd(total)}</span>
            </div>
            <p className="text-muted-foreground">
              Paying with {defaultCard ? `${defaultCard.brand} •••• ${defaultCard.last4}` : "no card"}
            </p>
            <label className="flex items-center gap-2 text-overline text-muted-foreground">
              <Checkbox checked={forceFail} onCheckedChange={(c) => setForceFail(Boolean(c))} />
              Simulate payment failure
            </label>
          </div>
        )}

        <DialogFooter>
          {step === "configure" ? (
            <>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!validate()) return;
                  setStep("review");
                }}
              >
                Review
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => setStep("configure")}>
                Back
              </Button>
              <Button type="button" onClick={confirmPay}>
                Pay {formatUsd(total)}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function isValidAddOnRate(n: number | undefined): n is number {
  return typeof n === "number" && Number.isFinite(n) && n >= 0.01;
}
