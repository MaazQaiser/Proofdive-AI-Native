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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import {
  FREE_MOCK_INTERVIEW_ALLOCATION,
  FREE_STORYBOARD_ALLOCATION,
} from "@/lib/candidateUsage";
import {
  BILLING_CYCLE_LABEL,
  formatUsd,
  SEED_BUNDLES,
  type BillingCycle,
  type PaymentBundle,
} from "@/lib/superAdminPaymentsData";
import { usePaymentBundles } from "@/lib/usePaymentBundles";
import { useCandidateSubscription } from "@/lib/useSubscriberPayments";

import { BundleCheckoutDialog } from "../../billing/ui/BundleCheckoutDialog";

type CycleFilter = "monthly" | "yearly";

/** Demo B2C plans that must always appear on the candidate pricing page. */
const CANDIDATE_DEMO_BUNDLE_IDS = ["bundle_career_starter", "bundle_career_pro"] as const;

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
    features.push("Masterclass included");
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
  const { bundles, hydrated } = usePaymentBundles();

  const catalog = useMemo(() => {
    const byId = new Map<string, PaymentBundle>();

    // Always surface Career Starter + Career Pro from seed so demo allocations
    // (e.g. Starter storyboards × 5) stay correct even if localStorage is stale.
    for (const id of CANDIDATE_DEMO_BUNDLE_IDS) {
      const fromSeed = SEED_BUNDLES.find((b) => b.id === id);
      if (fromSeed) byId.set(id, fromSeed);
    }

    for (const b of bundles) {
      if (b.type === "B2C" && b.status === "active" && !byId.has(b.id)) {
        byId.set(b.id, b);
      }
    }

    const order = ["bundle_career_starter", "bundle_interview_prep", "bundle_career_pro"];
    return Array.from(byId.values()).sort((a, b) => {
      const ai = order.indexOf(a.id);
      const bi = order.indexOf(b.id);
      const aRank = ai === -1 ? order.length : ai;
      const bRank = bi === -1 ? order.length : bi;
      if (aRank !== bRank) return aRank - bRank;
      return a.name.localeCompare(b.name);
    });
  }, [bundles]);

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
              Pick the Free baseline or a paid plan that matches how you prep. Subscribe or switch
              anytime and your new plan starts as soon as payment succeeds.
            </p>
          </div>
          <Button type="button" variant="outline" asChild>
            <Link href="/profile/billing">Back to billing</Link>
          </Button>
        </div>

        {availableCycles.includes("monthly") && availableCycles.includes("yearly") ? (
          <div className="flex flex-col items-center gap-3">
            <Tabs
              value={effectiveCycle}
              onValueChange={(v) => setCycleFilter(v as CycleFilter)}
              className="w-auto items-center"
            >
              <TabsList
                aria-label="Billing cycle"
                className="mx-0 mt-0 h-auto w-auto gap-1 rounded-full bg-muted p-1"
              >
                <TabsTrigger
                  value="monthly"
                  className="flex-none rounded-full border-transparent px-5 py-2 text-caption data-[state=active]:border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                >
                  Monthly
                </TabsTrigger>
                <TabsTrigger
                  value="yearly"
                  className="flex-none rounded-full border-transparent px-5 py-2 text-caption data-[state=active]:border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                >
                  Yearly
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {effectiveCycle === "yearly" ? (
              <p className="text-caption text-muted-foreground">
                Yearly billing saves versus paying monthly.
              </p>
            ) : (
              <p className="text-caption invisible" aria-hidden>
                Yearly billing saves versus paying monthly.
              </p>
            )}
          </div>
        ) : null}

        {!hydrated ? (
          <p className="text-center text-caption text-muted-foreground">Loading plans…</p>
        ) : (
          <section
            aria-label="Available plans"
            className="grid grid-cols-1 gap-6 md:grid-cols-3"
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
                    `Mock Interviews × ${FREE_MOCK_INTERVIEW_ALLOCATION}`,
                    `Storyboards × ${FREE_STORYBOARD_ALLOCATION}`,
                  ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-caption">
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
                  </CardContent>
                  <CardFooter>
                    {isCurrent ? (
                      <div className="flex w-full flex-col items-center gap-2">
                        <Button type="button" variant="outline" className="w-full" disabled>
                          {subscription.status === "pending_cancel"
                            ? "Canceling"
                            : "Current plan"}
                        </Button>
                        {subscription.status === "active" ? (
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-auto px-0 text-caption font-medium text-muted-foreground hover:bg-transparent hover:text-destructive"
                            onClick={() => {
                              if (subscription.status !== "active" || !subscription.nextBillingDate) {
                                toast.error("Unable to cancel right now. Open billing to try again.");
                                return;
                              }
                              setSubscription((prev) => ({
                                ...prev,
                                status: "pending_cancel",
                                accessEndsAt: prev.nextBillingDate,
                              }));
                              toast.success(
                                "Cancellation scheduled. Reverting to Free in a few seconds for this demo.",
                              );
                            }}
                          >
                            Cancel plan
                          </Button>
                        ) : null}
                      </div>
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

        <section aria-labelledby="pricing-faq-heading" className="w-full">
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
