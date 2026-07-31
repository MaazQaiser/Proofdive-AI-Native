"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SelectionChip } from "@/components/ui/selection-chip";
import { cn } from "@/lib/utils";
import {
  BILLING_CYCLE_LABEL,
  formatUsd,
  getMasterclassById,
  type BillingCycle,
  type PaymentBundle,
} from "@/lib/superAdminPaymentsData";
import { usePaymentBundles } from "@/lib/usePaymentBundles";
import {
  useCandidateEntitlements,
  useCandidateSubscription,
} from "@/lib/useSubscriberPayments";

import { BundleCheckoutDialog } from "../../billing/ui/BundleCheckoutDialog";

type CycleFilter = "monthly" | "yearly";

const FAQ_ITEMS = [
  {
    q: "What is included in Free?",
    a: "Free is a one-time baseline granted at signup — not a renewable Bundle. Unused free allocation does not carry into a paid Bundle.",
  },
  {
    q: "When does a new Bundle take effect?",
    a: "As soon as payment succeeds. The new Bundle replaces Free or your previous paid Bundle immediately, with no carryover.",
  },
  {
    q: "What happens if I cancel?",
    a: "Paid access continues through the end of the billing cycle you already paid for. After that, your account reverts to Free with any unused free baseline remaining. No refund.",
  },
  {
    q: "Can I buy more usage later?",
    a: "Yes. Purchase Add-Ons anytime from Payments & Subscription, whether you are on Free or a paid Bundle.",
  },
] as const;

function bundleFeatures(bundle: PaymentBundle): string[] {
  const features: string[] = [];
  if (bundle.mockInterview.included) {
    features.push(`Mock Interviews × ${bundle.mockInterview.quantity}`);
  }
  if (bundle.storyboard.included) {
    features.push(`Storyboards × ${bundle.storyboard.quantity}`);
  }
  if (bundle.masterclass.included) {
    for (const sel of bundle.masterclass.selections) {
      const name = getMasterclassById(sel.masterclassId)?.name ?? "Masterclass";
      features.push(`${name}: ${sel.selectedModuleIds.length} modules`);
    }
  }
  return features;
}

function priceForCycle(bundle: PaymentBundle, cycle: CycleFilter) {
  return bundle.cycles.find((c) => c.cycle === cycle) ?? null;
}

function yearlySavingsPercent(bundle: PaymentBundle): number | null {
  const monthly = bundle.cycles.find((c) => c.cycle === "monthly");
  const yearly = bundle.cycles.find((c) => c.cycle === "yearly");
  if (!monthly || !yearly) return null;
  const fullYear = monthly.price * 12;
  if (fullYear <= 0 || yearly.price >= fullYear) return null;
  return Math.round(((fullYear - yearly.price) / fullYear) * 100);
}

export function CandidatePricingScreen() {
  const [subscription, setSubscription] = useCandidateSubscription();
  const [entitlements] = useCandidateEntitlements();
  const { bundles, hydrated } = usePaymentBundles();

  const catalog = useMemo(
    () => bundles.filter((b) => b.type === "B2C" && b.status === "active"),
    [bundles],
  );

  const availableCycles = useMemo(() => {
    const set = new Set<CycleFilter>();
    for (const b of catalog) {
      for (const c of b.cycles) {
        if (c.cycle === "monthly" || c.cycle === "yearly") set.add(c.cycle);
      }
    }
    return Array.from(set);
  }, [catalog]);

  const [cycleFilter, setCycleFilter] = useState<CycleFilter>("monthly");
  const effectiveCycle: CycleFilter =
    availableCycles.includes(cycleFilter) ? cycleFilter : (availableCycles[0] ?? "monthly");

  const recommendedId = useMemo(() => {
    if (catalog.some((b) => b.id === "bundle_career_starter")) return "bundle_career_starter";
    return catalog[Math.min(1, catalog.length - 1)]?.id ?? null;
  }, [catalog]);

  const [checkoutBundle, setCheckoutBundle] = useState<PaymentBundle | null>(null);
  const [checkoutCycle, setCheckoutCycle] = useState<BillingCycle | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"cycle" | "review">("cycle");
  const [forceFail, setForceFail] = useState(false);

  function startSubscribe(bundle: PaymentBundle) {
    const preferred =
      priceForCycle(bundle, effectiveCycle)?.cycle ?? bundle.cycles[0]?.cycle ?? null;
    setCheckoutBundle(bundle);
    setCheckoutCycle(preferred);
    setCheckoutStep(bundle.cycles.length === 1 ? "review" : "cycle");
    setForceFail(false);
  }

  function completeCheckout() {
    if (!checkoutBundle || !checkoutCycle) return;
    if (forceFail) {
      toast.error("Unable to process payment at the moment.");
      setCheckoutStep("review");
      return;
    }
    const cycle = checkoutBundle.cycles.find((c) => c.cycle === checkoutCycle);
    const next = new Date();
    if (checkoutCycle === "monthly") next.setMonth(next.getMonth() + 1);
    else if (checkoutCycle === "quarterly") next.setMonth(next.getMonth() + 3);
    else next.setFullYear(next.getFullYear() + 1);

    setSubscription({
      status: "active",
      bundleId: checkoutBundle.id,
      billingCycle: checkoutCycle,
      nextBillingDate: next.toISOString().slice(0, 10),
      accessEndsAt: null,
    });
    setCheckoutBundle(null);
    toast.success(
      `Subscribed to ${checkoutBundle.name} (${BILLING_CYCLE_LABEL[checkoutCycle]}, ${formatUsd(cycle?.price ?? 0)}).`,
    );
  }

  const isFree = subscription.status === "free";
  const ctaLabel = isFree || subscription.status === "pending_cancel" ? "Subscribe" : "Switch to this Bundle";

  return (
    <AppShell>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-8 pb-28">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-caption font-medium text-primary">Bundle Catalog</p>
            <h1 className="text-h2 mt-2 text-foreground">
              Choose the plan that fits your interview prep
            </h1>
            <p className="text-body-sm mt-3 text-muted-foreground">
              Compare Free and Active B2C Bundles. Subscribe or switch anytime — your new Bundle
              takes effect as soon as payment succeeds.
            </p>
          </div>
          <Button type="button" variant="outline" asChild>
            <Link href="/profile/billing">Back to billing</Link>
          </Button>
        </div>

        {availableCycles.length > 1 ? (
          <div className="flex flex-col items-center gap-3">
            <div
              className="inline-flex flex-wrap items-center justify-center gap-2"
              role="group"
              aria-label="Billing cycle"
            >
              {availableCycles.map((cycle) => (
                <SelectionChip
                  key={cycle}
                  selected={effectiveCycle === cycle}
                  onClick={() => setCycleFilter(cycle)}
                >
                  {BILLING_CYCLE_LABEL[cycle]}
                </SelectionChip>
              ))}
            </div>
            {effectiveCycle === "yearly" ? (
              <p className="text-caption text-muted-foreground">
                Yearly billing saves versus paying monthly.
              </p>
            ) : null}
          </div>
        ) : null}

        {!hydrated ? (
          <p className="text-center text-caption text-muted-foreground">Loading plans…</p>
        ) : (
          <section
            aria-label="Available plans"
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            <Card className="border border-border bg-card shadow-none">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-h5">Free</CardTitle>
                  {isFree ? <Badge variant="secondary">Current</Badge> : null}
                </div>
                <CardDescription>One-time baseline at signup — not renewable.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-6">
                <div>
                  <p className="text-h3 font-medium text-foreground">$0</p>
                  <p className="text-caption text-muted-foreground">Forever free baseline</p>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {[
                    `Mock Interviews × ${entitlements.freeMockInterviews}`,
                    `Storyboards × ${entitlements.freeStoryboards}`,
                    entitlements.freeMasterclassModuleIds.length
                      ? `Masterclass modules × ${entitlements.freeMasterclassModuleIds.length}`
                      : null,
                  ]
                    .filter(Boolean)
                    .map((item) => (
                      <li key={item as string} className="flex items-start gap-2 text-caption">
                        <Check
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden
                          strokeWidth={2.5}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button type="button" variant="outline" className="w-full" disabled={isFree}>
                  {isFree ? "Current plan" : "Included at signup"}
                </Button>
              </CardFooter>
            </Card>

            {catalog.map((bundle) => {
              const priced = priceForCycle(bundle, effectiveCycle);
              const isCurrent = bundle.id === subscription.bundleId;
              const isRecommended = bundle.id === recommendedId;
              const savings = yearlySavingsPercent(bundle);
              const features = bundleFeatures(bundle);
              const unavailableForCycle = !priced;

              return (
                <Card
                  key={bundle.id}
                  className={cn(
                    "border bg-card shadow-none transition-colors duration-200",
                    isRecommended
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border",
                  )}
                >
                  <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <CardTitle className="text-h5">{bundle.name}</CardTitle>
                      <div className="flex flex-wrap gap-1.5">
                        {isRecommended ? <Badge>Most popular</Badge> : null}
                        {isCurrent ? <Badge variant="secondary">Current</Badge> : null}
                      </div>
                    </div>
                    <CardDescription>{bundle.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-6">
                    <div>
                      {priced ? (
                        <>
                          <p className="text-h3 font-medium text-foreground">
                            {formatUsd(priced.price)}
                            <span className="text-body-sm font-normal text-muted-foreground">
                              /{effectiveCycle === "yearly" ? "year" : "mo"}
                            </span>
                          </p>
                          {effectiveCycle === "yearly" && savings != null ? (
                            <p className="text-caption text-primary">Save {savings}% vs monthly</p>
                          ) : (
                            <p className="text-caption text-muted-foreground">
                              Billed {BILLING_CYCLE_LABEL[effectiveCycle].toLowerCase()}
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-h3 font-medium text-foreground">—</p>
                          <p className="text-caption text-muted-foreground">
                            Not offered on {BILLING_CYCLE_LABEL[effectiveCycle].toLowerCase()}
                          </p>
                        </>
                      )}
                    </div>
                    <ul className="flex flex-col gap-2.5">
                      {features.length > 0 ? (
                        features.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-caption">
                            <Check
                              className="mt-0.5 size-4 shrink-0 text-primary"
                              aria-hidden
                              strokeWidth={2.5}
                            />
                            <span>{item}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-caption text-muted-foreground">No included items</li>
                      )}
                    </ul>
                    {bundle.cycles.length > 1 ? (
                      <p className="text-overline text-muted-foreground">
                        Also available:{" "}
                        {bundle.cycles
                          .filter((c) => c.cycle !== effectiveCycle)
                          .map((c) => `${BILLING_CYCLE_LABEL[c.cycle]} ${formatUsd(c.price)}`)
                          .join(" · ")}
                      </p>
                    ) : null}
                  </CardContent>
                  <CardFooter>
                    {isCurrent ? (
                      <Button type="button" variant="outline" className="w-full" disabled>
                        Current plan
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        className="w-full"
                        variant={isRecommended ? "default" : "outline"}
                        disabled={unavailableForCycle && bundle.cycles.length === 0}
                        onClick={() => startSubscribe(bundle)}
                      >
                        {ctaLabel}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </section>
        )}

        {hydrated && catalog.length === 0 ? (
          <p className="text-center text-caption text-muted-foreground">
            No active B2C bundles yet. Check back soon or return to billing.
          </p>
        ) : null}

        <section aria-labelledby="pricing-faq-heading" className="mx-auto w-full max-w-3xl">
          <h2 id="pricing-faq-heading" className="text-h4 text-foreground">
            Billing FAQ
          </h2>
          <div className="mt-6 divide-y divide-border border-y border-border">
            {FAQ_ITEMS.map((item) => (
              <details key={item.q} className="group py-4">
                <summary className="cursor-pointer list-none text-body-sm font-medium text-foreground outline-none transition-colors marker:content-none focus-visible:text-primary [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.q}
                    <span
                      className="text-muted-foreground transition-transform duration-200 group-open:rotate-45"
                      aria-hidden
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="text-caption mt-3 max-w-prose text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="rounded-[16px] border border-border bg-card px-6 py-8 text-center">
          <h2 className="text-h5 text-foreground">Need more usage on your current plan?</h2>
          <p className="text-caption mx-auto mt-2 max-w-md text-muted-foreground">
            Purchase Mock Interview, Storyboard, or Masterclass add-ons anytime — available on Free
            and paid Bundles.
          </p>
          <Button type="button" className="mt-5" asChild>
            <Link href="/profile/billing?addon=storyboard">Purchase Add-Ons</Link>
          </Button>
        </section>
      </main>

      <BundleCheckoutDialog
        bundle={checkoutBundle}
        cycle={checkoutCycle}
        step={checkoutStep}
        forceFail={forceFail}
        pendingCancel={subscription.status === "pending_cancel"}
        onCycleChange={setCheckoutCycle}
        onStepChange={setCheckoutStep}
        onForceFailChange={setForceFail}
        onClose={() => setCheckoutBundle(null)}
        onComplete={completeCheckout}
      />

      <CoachFloatingNav />
    </AppShell>
  );
}
