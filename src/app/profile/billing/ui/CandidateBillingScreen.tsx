"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
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
import {
  BILLING_CYCLE_LABEL,
  formatUsd,
  hasConfiguredRate,
  ITEM_KIND_LABEL,
  rateKey,
  roundMoney,
  type ItemKind,
} from "@/lib/superAdminPaymentsData";
import { usePaymentBundles } from "@/lib/usePaymentBundles";
import { useAddOnRates } from "@/lib/usePaymentRates";
import {
  useCandidateEntitlements,
  useCandidateSubscription,
} from "@/lib/useSubscriberPayments";

export function CandidateBillingScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselect = searchParams.get("addon");

  const [subscription, setSubscription] = useCandidateSubscription();
  const [entitlements, setEntitlements] = useCandidateEntitlements();
  const { bundles, hydrated } = usePaymentBundles();
  const { rates: addOnRates } = useAddOnRates();

  const activeBundle =
    subscription.bundleId != null
      ? bundles.find((b) => b.id === subscription.bundleId) ?? null
      : null;

  const [cancelOpen, setCancelOpen] = useState(false);
  const [addOnsOpen, setAddOnsOpen] = useState(false);

  useEffect(() => {
    if (preselect === "storyboard") setAddOnsOpen(true);
  }, [preselect]);

  // Demo revert to Free is handled in useCandidateSubscription after a short delay.

  function confirmCancel() {
    if (subscription.status !== "active" || !subscription.nextBillingDate) return;
    setSubscription((prev) => ({
      ...prev,
      status: "pending_cancel",
      accessEndsAt: prev.nextBillingDate,
    }));
    setCancelOpen(false);
    toast.success("Cancellation scheduled. Reverting to Free in a few seconds for this demo.");
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-8 pb-24">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-h4 text-foreground">Payments & Subscription</h1>
            <p className="mt-1 text-caption text-muted-foreground">
              Manage your plan, browse B2C bundles, and purchase add-ons.
            </p>
          </div>
          <Button type="button" variant="outline" asChild>
            <Link href="/profile">Back to profile</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Subscription Overview</CardTitle>
                <CardDescription>Your current plan and entitlements.</CardDescription>
              </div>
              <Badge variant="secondary">
                {subscription.status === "free"
                  ? "Free"
                  : subscription.status === "pending_cancel"
                    ? "Canceling"
                    : "Paid"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-caption">
            {!hydrated ? (
              <p className="text-muted-foreground">Loading…</p>
            ) : subscription.status === "free" ? (
              <>
                <p>
                  <span className="font-medium">Current Plan: Free</span>
                </p>
                <p className="text-muted-foreground">
                  One-time free baseline remaining: {entitlements.freeMockInterviews} mock
                  interviews, {entitlements.freeStoryboards} storyboards.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" asChild>
                    <Link href="/profile/pricing">Browse plans</Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
                    onClick={() => setAddOnsOpen(true)}
                  >
                    Purchase Add-Ons
                  </Button>
                </div>
              </>
            ) : activeBundle ? (
              <>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-overline text-muted-foreground">Bundle</dt>
                    <dd className="font-medium">{activeBundle.name}</dd>
                  </div>
                  <div>
                    <dt className="text-overline text-muted-foreground">Billing Cycle</dt>
                    <dd className="font-medium">
                      {subscription.billingCycle
                        ? BILLING_CYCLE_LABEL[subscription.billingCycle]
                        : "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-overline text-muted-foreground">Price</dt>
                    <dd className="font-medium">
                      {formatUsd(
                        activeBundle.cycles.find((c) => c.cycle === subscription.billingCycle)
                          ?.price ?? 0,
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-overline text-muted-foreground">Next Billing Date</dt>
                    <dd className="font-medium">{subscription.nextBillingDate ?? "—"}</dd>
                  </div>
                </dl>
                {subscription.status === "pending_cancel" ? (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-900">
                    Cancellation pending. For this demo, your account reverts to Free in a few
                    seconds.
                  </p>
                ) : null}
                <div>
                  <div className="font-medium">Included items</div>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    {activeBundle.mockInterview.included ? (
                      <li>Mock Interviews × {activeBundle.mockInterview.quantity}</li>
                    ) : null}
                    {activeBundle.storyboard.included ? (
                      <li>Storyboards × {activeBundle.storyboard.quantity}</li>
                    ) : null}
                    {activeBundle.masterclass.included ? (
                      <li>Masterclass included</li>
                    ) : null}
                  </ul>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="outline" asChild>
                    <Link href="/profile/pricing">Switch Bundle</Link>
                  </Button>
                  {subscription.status === "active" ? (
                    <Button type="button" variant="outline" onClick={() => setCancelOpen(true)}>
                      Cancel Subscription
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
                    onClick={() => setAddOnsOpen(true)}
                  >
                    Purchase Add-Ons
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">Assigned bundle is unavailable.</p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10 hover:text-primary"
                    onClick={() => setAddOnsOpen(true)}
                  >
                    Purchase Add-Ons
                  </Button>
                </div>
              </>
            )}
            {(entitlements.addOnMockInterviews > 0 ||
              entitlements.addOnStoryboards > 0 ||
              entitlements.addOnMasterclassIncluded ||
              entitlements.addOnMasterclassModuleIds.length > 0) && (
              <p className="text-overline text-muted-foreground">
                Add-ons on account: {entitlements.addOnMockInterviews} mock,{" "}
                {entitlements.addOnStoryboards} storyboard
                {entitlements.addOnMasterclassIncluded ||
                entitlements.addOnMasterclassModuleIds.length > 0
                  ? ", Masterclass included"
                  : ""}
                .
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel subscription?</DialogTitle>
            <DialogDescription>
              Paid access continues through the end of the current billing cycle (
              {subscription.nextBillingDate}). Billing will not renew, and your account will revert
              to Free with any unused free baseline remaining. No refund.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setCancelOpen(false)}>
              Keep plan
            </Button>
            <Button type="button" variant="destructive" onClick={confirmCancel}>
              Confirm cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CandidateAddOnsDialog
        open={addOnsOpen}
        onOpenChange={setAddOnsOpen}
        preselectStoryboard={preselect === "storyboard"}
        addOnRates={addOnRates}
        onSuccess={(deltas) => {
          setEntitlements((prev) => ({
            ...prev,
            addOnMockInterviews: prev.addOnMockInterviews + (deltas.mock ?? 0),
            addOnStoryboards: prev.addOnStoryboards + (deltas.storyboard ?? 0),
            addOnMasterclassIncluded:
              prev.addOnMasterclassIncluded || Boolean(deltas.masterclassIncluded),
          }));
          toast.success("Add-ons added to your account.");
          if (preselect === "storyboard") {
            router.replace("/profile/billing");
          }
        }}
      />

      <CoachFloatingNav />
    </AppShell>
  );
}

function CandidateAddOnsDialog({
  open,
  onOpenChange,
  preselectStoryboard,
  addOnRates,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectStoryboard: boolean;
  addOnRates: ReturnType<typeof useAddOnRates>["rates"];
  onSuccess: (deltas: {
    mock?: number;
    storyboard?: number;
    masterclassIncluded?: boolean;
  }) => void;
}) {
  const [selected, setSelected] = useState<Partial<Record<ItemKind, boolean>>>({});
  const [mockQty, setMockQty] = useState("1");
  const [storyQty, setStoryQty] = useState("1");
  const [step, setStep] = useState<"configure" | "review">("configure");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [forceFail, setForceFail] = useState(false);

  const absoluteMc = addOnRates[rateKey("masterclass", "B2C")];

  useEffect(() => {
    if (!open) return;
    setSelected(preselectStoryboard ? { storyboard: true } : {});
    setMockQty("1");
    setStoryQty("1");
    setStep("configure");
    setErrors({});
    setForceFail(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when dialog opens
  }, [open, preselectStoryboard]);

  const lineItems = useMemo(() => {
    const items: { kind: ItemKind; label: string; price: number; detail: string }[] = [];
    if (selected.mockInterview) {
      const qty = Number(mockQty) || 0;
      const unit = addOnRates[rateKey("mockInterview", "B2C")] ?? 0;
      items.push({
        kind: "mockInterview",
        label: ITEM_KIND_LABEL.mockInterview,
        price: roundMoney(qty * unit),
        detail: `× ${qty}`,
      });
    }
    if (selected.storyboard) {
      const qty = Number(storyQty) || 0;
      const unit = addOnRates[rateKey("storyboard", "B2C")] ?? 0;
      items.push({
        kind: "storyboard",
        label: ITEM_KIND_LABEL.storyboard,
        price: roundMoney(qty * unit),
        detail: `× ${qty}`,
      });
    }
    if (selected.masterclass && typeof absoluteMc === "number" && absoluteMc >= 0.01) {
      items.push({
        kind: "masterclass",
        label: ITEM_KIND_LABEL.masterclass,
        price: roundMoney(absoluteMc),
        detail: "included",
      });
    }
    return items;
  }, [selected, mockQty, storyQty, addOnRates, absoluteMc]);

  const total = roundMoney(lineItems.reduce((s, i) => s + i.price, 0));

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!selected.mockInterview && !selected.storyboard && !selected.masterclass) {
      next.items = "Please select at least one item.";
    }
    if (selected.mockInterview) {
      const n = Number(mockQty);
      if (!Number.isInteger(n) || n < 1) next.mockQty = "Please enter a valid quantity.";
      if (!hasConfiguredRate(addOnRates, "mockInterview", "B2C")) next.mockQty = "Unavailable.";
    }
    if (selected.storyboard) {
      const n = Number(storyQty);
      if (!Number.isInteger(n) || n < 1) next.storyQty = "Please enter a valid quantity.";
      if (!hasConfiguredRate(addOnRates, "storyboard", "B2C")) next.storyQty = "Unavailable.";
    }
    if (selected.masterclass) {
      if (!hasConfiguredRate(addOnRates, "masterclass", "B2C")) {
        next.masterclass = "Unavailable.";
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function pay() {
    if (forceFail) {
      toast.error("Unable to process payment at the moment.");
      return;
    }
    onSuccess({
      mock: selected.mockInterview ? Number(mockQty) : undefined,
      storyboard: selected.storyboard ? Number(storyQty) : undefined,
      masterclassIncluded: selected.masterclass ? true : undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {step === "configure" ? "Purchase Add-Ons" : "Review & pay"}
          </DialogTitle>
          <DialogDescription>
            Available on Free or any paid Bundle. Uses B2C add-on rates.
          </DialogDescription>
        </DialogHeader>

        {step === "configure" ? (
          <div className="space-y-3">
            {errors.items ? <p className="text-caption text-destructive">{errors.items}</p> : null}
            {(
              [
                ["mockInterview", "Mock Interview"],
                ["storyboard", "Storyboard"],
                ["masterclass", "Masterclass"],
              ] as const
            ).map(([kind, label]) => {
              const available = hasConfiguredRate(addOnRates, kind, "B2C");
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
                  </label>
                  {selected[kind] && kind !== "masterclass" ? (
                    <div className="mt-2 space-y-1">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min={1}
                        value={kind === "mockInterview" ? mockQty : storyQty}
                        onChange={(e) =>
                          kind === "mockInterview"
                            ? setMockQty(e.target.value)
                            : setStoryQty(e.target.value)
                        }
                        placeholder="1"
                      />
                      {(kind === "mockInterview" ? errors.mockQty : errors.storyQty) ? (
                        <p className="text-caption text-destructive">
                          {kind === "mockInterview" ? errors.mockQty : errors.storyQty}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {selected[kind] && kind === "masterclass" ? (
                    <div className="mt-2 space-y-1">
                      {typeof absoluteMc === "number" ? (
                        <p className="text-caption font-medium">{formatUsd(absoluteMc)}</p>
                      ) : null}
                      {errors.masterclass ? (
                        <p className="text-caption text-destructive">{errors.masterclass}</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2 text-caption">
            {lineItems.map((item) => (
              <div key={item.kind} className="flex justify-between gap-4">
                <span>
                  {item.label} {item.detail}
                </span>
                <span className="font-medium">{formatUsd(item.price)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t border-border pt-2 font-medium">
              <span>Total</span>
              <span>{formatUsd(total)}</span>
            </div>
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
              <Button type="button" onClick={pay}>
                Pay {formatUsd(total)}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
