"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { Button } from "@/components/ui/button";
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

/** Large display price — drop trailing .00 for whole-dollar amounts. */
function formatDisplayPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

function PlanBadge({
  children,
  featured = false,
}: {
  children: ReactNode;
  featured?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full px-3.5 py-1.5 text-[13px] font-semibold tracking-[-0.01em]",
        featured
          ? "bg-white text-extended-green-blue shadow-sm"
          : "bg-primary text-primary-foreground",
      )}
    >
      {children}
    </span>
  );
}

function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-[15px] leading-snug text-foreground/80">
          <Check
            className="mt-0.5 size-4 shrink-0 text-extended-green-blue"
            aria-hidden
            strokeWidth={2.5}
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function CandidatePricingScreen() {
  const [subscription, setSubscription] = useCandidateSubscription();
  const { bundles, hydrated } = usePaymentBundles();

  const catalog = useMemo(() => {
    const byId = new Map<string, PaymentBundle>();

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
  const effectiveCycle: CycleFilter = availableCycles.includes(cycleFilter)
    ? cycleFilter
    : (availableCycles[0] ?? "monthly");

  const maxYearlySavings = useMemo(() => {
    let max = 0;
    for (const b of catalog) {
      const s = yearlySavingsPercent(b);
      if (s != null && s > max) max = s;
    }
    return max > 0 ? max : null;
  }, [catalog]);

  const featuredId = useMemo(() => {
    if (catalog.some((b) => b.id === "bundle_career_pro")) return "bundle_career_pro";
    return catalog[catalog.length - 1]?.id ?? null;
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
  const ctaLabel =
    isFree || subscription.status === "pending_cancel" ? "Get started" : "Switch to this Bundle";

  return (
    <AppShell>
      <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-12 px-2 py-6 pb-16 sm:px-4 sm:py-10">
          <div className="flex justify-end">
            <Button type="button" variant="ghost" size="sm" className="text-muted-foreground" asChild>
              <Link href="/profile/billing">Back to billing</Link>
            </Button>
          </div>

          <header className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center motion-safe:animate-pricing-rise">
            <h1 className="text-[clamp(2rem,4vw,2.75rem)] font-semibold leading-[1.15] tracking-[-0.04em] text-heading-teal">
              Choose your right plan!
            </h1>
            <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground sm:text-body-sm">
              Pick the Free baseline or a paid plan that matches how you prep. Subscribe or switch
              anytime — your new plan starts as soon as payment succeeds.
            </p>
          </header>

          {availableCycles.includes("monthly") && availableCycles.includes("yearly") ? (
            <div className="flex justify-center motion-safe:animate-pricing-rise">
              <Tabs
                value={effectiveCycle}
                onValueChange={(v) => setCycleFilter(v as CycleFilter)}
                className="w-auto items-center"
              >
                <TabsList
                  aria-label="Billing cycle"
                  className="mx-0 mt-0 h-auto w-auto gap-1 rounded-full border border-border/60 bg-white/80 p-1.5 shadow-sm backdrop-blur-sm"
                >
                  <TabsTrigger
                    value="monthly"
                    className="flex-none rounded-full border-transparent px-5 py-2.5 text-[14px] font-medium data-[state=active]:border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                  >
                    Monthly
                  </TabsTrigger>
                  <TabsTrigger
                    value="yearly"
                    className="flex-none rounded-full border-transparent px-5 py-2.5 text-[14px] font-medium data-[state=active]:border-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none"
                  >
                    Yearly{maxYearlySavings != null ? ` (save ${maxYearlySavings}%)` : ""}
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          ) : null}

          {!hydrated ? (
            <p className="text-center text-caption text-muted-foreground">Loading plans…</p>
          ) : (
            <section
              aria-label="Available plans"
              className="grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6 motion-safe:animate-pricing-rise"
            >
              {/* Free */}
              <article
                className={cn(
                  "flex flex-col rounded-[20px] border border-border/70 bg-white/90 p-7 shadow-[0_12px_40px_-24px_rgba(7,62,76,0.35)] backdrop-blur-sm",
                )}
              >
                <div className="grid grid-rows-[auto_4.5rem_auto] gap-4">
                  <div className="flex items-center justify-between gap-2">
                    <PlanBadge>Free</PlanBadge>
                    {isFree ? (
                      <span className="text-overline text-muted-foreground">Current</span>
                    ) : null}
                  </div>
                  <p className="text-[14px] leading-relaxed text-muted-foreground">
                    One-time baseline at signup — not renewable. Start exploring with core practice.
                  </p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[2.75rem] font-semibold leading-none tracking-[-0.04em] text-heading-teal">
                      $0
                    </span>
                    <span className="text-[15px] font-medium text-muted-foreground">/forever</span>
                  </div>
                </div>

                <div className="my-6 h-px w-full bg-border/80" />

                <div className="flex flex-1 flex-col gap-8">
                  <FeatureList
                    items={[
                      `Mock Interviews × ${FREE_MOCK_INTERVIEW_ALLOCATION}`,
                      `Storyboards × ${FREE_STORYBOARD_ALLOCATION}`,
                    ]}
                  />
                  <Button type="button" variant="outline" className="mt-auto w-full rounded-full" disabled={isFree}>
                    {isFree ? "Current plan" : "Included at signup"}
                  </Button>
                </div>
              </article>

              {catalog.map((bundle) => {
                const priced = priceForCycle(bundle, effectiveCycle);
                const isCurrent = bundle.id === subscription.bundleId;
                const isFeatured = bundle.id === featuredId;
                const savings = yearlySavingsPercent(bundle);
                const features = bundleFeatures(bundle);
                const unavailableForCycle = !priced;
                const period = effectiveCycle === "yearly" ? "/year" : "/month";

                return (
                  <article
                    key={bundle.id}
                    className={cn(
                      "flex flex-col rounded-[20px] border p-7 shadow-[0_12px_40px_-24px_rgba(7,62,76,0.35)] backdrop-blur-sm",
                      isFeatured
                        ? "border-primary/25 bg-gradient-to-b from-brand-1000 via-white to-white"
                        : "border-border/70 bg-white/90",
                    )}
                  >
                    <div className="grid grid-rows-[auto_4.5rem_auto] gap-4">
                      <div className="flex items-center justify-between gap-2">
                        <PlanBadge featured={isFeatured}>{bundle.name}</PlanBadge>
                        {isCurrent ? (
                          <span className="text-overline text-muted-foreground">Current</span>
                        ) : null}
                      </div>
                      <p className="text-[14px] leading-relaxed text-muted-foreground">
                        {bundle.description}
                      </p>
                      <div>
                        {priced ? (
                          <>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[2.75rem] font-semibold leading-none tracking-[-0.04em] text-heading-teal">
                                {formatDisplayPrice(priced.price)}
                              </span>
                              <span className="text-[15px] font-medium text-muted-foreground">
                                {period}
                              </span>
                            </div>
                            {effectiveCycle === "yearly" && savings != null ? (
                              <p className="mt-2 text-[13px] font-medium text-primary">
                                Save {savings}% vs monthly
                              </p>
                            ) : null}
                          </>
                        ) : (
                          <>
                            <span className="text-[2.75rem] font-semibold leading-none tracking-[-0.04em] text-heading-teal">
                              —
                            </span>
                            <p className="mt-2 text-[13px] text-muted-foreground">
                              Not offered on {BILLING_CYCLE_LABEL[effectiveCycle].toLowerCase()}
                            </p>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="my-6 h-px w-full bg-border/80" />

                    <div className="flex flex-1 flex-col gap-8">
                      {features.length > 0 ? (
                        <FeatureList items={features} />
                      ) : (
                        <p className="text-[15px] text-muted-foreground">No included items</p>
                      )}

                      {isCurrent ? (
                        <div className="mt-auto flex w-full flex-col items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full rounded-full"
                            disabled
                          >
                            {subscription.status === "pending_cancel" ? "Canceling" : "Current plan"}
                          </Button>
                          {subscription.status === "active" ? (
                            <Button
                              type="button"
                              variant="ghost"
                              className="h-auto px-0 text-caption font-medium text-muted-foreground hover:bg-transparent hover:text-destructive"
                              onClick={() => {
                                if (
                                  subscription.status !== "active" ||
                                  !subscription.nextBillingDate
                                ) {
                                  toast.error(
                                    "Unable to cancel right now. Open billing to try again.",
                                  );
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
                          className={cn(
                            "mt-auto w-full rounded-full",
                            isFeatured &&
                              "bg-extended-green-blue text-white hover:bg-extended-cyan-green",
                          )}
                          variant={isFeatured ? "default" : "outline"}
                          disabled={unavailableForCycle && bundle.cycles.length === 0}
                          onClick={() => startSubscribe(bundle)}
                        >
                          {ctaLabel}
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          {hydrated && catalog.length === 0 ? (
            <p className="text-center text-caption text-muted-foreground">
              No active B2C bundles yet. Check back soon or return to billing.
            </p>
          ) : null}

          <section className="rounded-[20px] border border-border/70 bg-white/80 px-6 py-8 text-center shadow-[0_12px_40px_-24px_rgba(7,62,76,0.25)] backdrop-blur-sm">
            <h2 className="text-[1.35rem] font-semibold tracking-[-0.02em] text-heading-teal">
              Need more usage on your current plan?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-muted-foreground">
              Purchase Mock Interview, Storyboard, or Masterclass add-ons anytime — available on Free
              and paid Bundles.
            </p>
            <Button type="button" className="mt-5 rounded-full" asChild>
              <Link href="/profile/billing?addon=storyboard">Purchase Add-Ons</Link>
            </Button>
          </section>

          <section aria-labelledby="pricing-faq-heading" className="w-full">
            <h2
              id="pricing-faq-heading"
              className="text-[1.5rem] font-semibold tracking-[-0.02em] text-heading-teal"
            >
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
                  <p className="mt-3 max-w-prose text-caption text-muted-foreground">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
      </div>

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
