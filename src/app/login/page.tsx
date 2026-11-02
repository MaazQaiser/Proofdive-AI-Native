"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { GlassPane } from "@/components/shared/GlassPane";
import { AuthDivider, SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/ui/logo";
import { PasswordInput } from "@/components/ui/password-input";
import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import { scoringBadgeClass, scoringFillClass, scoringLabelForScore } from "@/lib/scoringPalette";
import { SUCCESS_DRIVERS, SUCCESS_DRIVER_ORDER, type SuccessDriverId } from "@/lib/successDrivers";
import { cn } from "@/lib/utils";

const fieldClassName =
  "h-11 rounded-md border-border bg-card px-3 text-body-sm placeholder:text-placeholder md:text-body-sm";

/**
 * The right panel shows what "pick up where you left off" (the subtitle on
 * the left) looks like: the readiness card and the next step waiting on
 * Home, on panes of the website's glass floating on the panel's water.
 *
 * It replaced a "proof record" card whose claim — practising twice a week
 * reaches interview-ready scores "3× faster" — was a number nothing had
 * measured, over bars that charted nothing. Everything here is the product's
 * own: its bands, its Success Drivers, the journey's own "Up next" and step
 * title. The scores are an example and say so ("Illustrative", as the
 * website labels its product views); they average to the overall shown, and
 * one driver sits a band lower, because that is what a real first report
 * looks like and what the next step is for.
 */
const PREVIEW_OVERALL = 3.8;
const PREVIEW_DRIVERS: Record<SuccessDriverId, number> = {
  thinking: 3.2,
  action: 4.1,
  people: 3.7,
  mastery: 4.2,
};

function LoginAside() {
  const band = scoringLabelForScore(PREVIEW_OVERALL);
  return (
    <div className="w-full max-w-[460px]">
      <div
        role="img"
        aria-label={`Illustrative: interview readiness ${PREVIEW_OVERALL} out of 5, ${band}, with Take a Mock Studios session as the next step.`}
        className="relative"
      >
        <GlassPane lean className="px-8 pb-16 pt-8">
          <div className="flex items-start justify-between gap-4">
            <p className="text-overline uppercase text-extended-green-blue/80">Interview readiness</p>
            <Badge variant="outline" className={scoringBadgeClass(PREVIEW_OVERALL)}>
              {band}
            </Badge>
          </div>
          <p className="mt-3 font-gilroy leading-none tabular-nums text-extended-green-blue">
            <span className="text-[64px] tracking-[-0.04em]">{PREVIEW_OVERALL.toFixed(1)}</span>
            <span className="ml-1 text-[28px] text-extended-green-blue/60">/5</span>
          </p>

          <ul className="mt-8 flex flex-col gap-5">
            {SUCCESS_DRIVER_ORDER.map((id) => {
              const score = PREVIEW_DRIVERS[id];
              return (
                <li key={id} className="grid grid-cols-[1.25rem_5.5rem_1fr_2rem] items-center gap-3">
                  <SuccessDriverIcon driver={id} className="size-4 text-extended-green-blue" />
                  <span className="text-body-sm font-medium text-extended-green-blue">
                    {SUCCESS_DRIVERS[id].shortLabel}
                  </span>
                  <span className="h-1.5 overflow-hidden rounded-full bg-extended-green-blue/10">
                    <span
                      className={cn("block h-full rounded-full", scoringFillClass(score))}
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </span>
                  <span className="text-right font-gilroy text-body-sm tabular-nums text-extended-green-blue/80">
                    {score.toFixed(1)}
                  </span>
                </li>
              );
            })}
          </ul>
        </GlassPane>

        {/* the journey's next step, on its own small pane over the corner. The
            pane's foot padding is what keeps it off the last driver row. */}
        <div className="glass-pane absolute -bottom-10 -left-6 w-[17rem] rounded-[20px] px-5 py-4">
          <p className="flex items-center gap-1.5 text-overline uppercase text-extended-green-blue/80">
            <LogoMark className="size-3" />
            Up next
          </p>
          <p className="mt-1.5 text-body-sm font-semibold text-extended-green-blue">
            Take a Mock Studios session
          </p>
        </div>
      </div>

      <p className="mt-16 text-caption text-extended-green-blue/80">
        Illustrative. Your own readiness and next step are waiting when you sign in.
      </p>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  /** Design-comparison routing (testing): LinkedIn and the email form open
   * onboarding v1; Google opens the v2 copy so both designs are viewable. */
  function continueToApp(destination = "/onboarding") {
    if (submitting) return;
    setSubmitting(true);
    router.push(destination);
  }

  return (
    <AuthShell aside={<LoginAside />}>
      <div className="flex w-full flex-col items-stretch gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-gilroy text-[2rem] font-bold leading-tight tracking-[-0.03em] text-extended-green-blue">
            Welcome back
          </h1>
          <p className="text-body-sm text-muted-foreground">
            Sign in to pick up where you left off.
          </p>
        </div>

        <SocialAuthButtons
          onLinkedIn={() => continueToApp("/onboarding")}
          onGoogle={() => continueToApp("/onboarding")}
          disabled={submitting}
        />

        <AuthDivider />

        <form
          className="flex w-full flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            continueToApp("/onboarding");
          }}
        >
          <div className="flex w-full flex-col gap-3">
            <div className="flex w-full flex-col gap-1.5">
              <Label htmlFor="login-email" className="text-caption font-normal text-foreground">
                Email
              </Label>
              <Input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={fieldClassName}
                required
              />
            </div>
            <div className="flex w-full flex-col gap-1.5">
              <div className="flex w-full items-center justify-between gap-3">
                <Label htmlFor="login-password" className="text-caption font-normal text-foreground">
                  Password
                </Label>
                <Link href="/forgot-password" className="app-link text-caption font-medium">
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="login-password"
                name="password"
                autoComplete="current-password"
                placeholder="Password"
                className={cn(fieldClassName, "pl-3")}
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="h-11 w-full rounded-md text-body-sm font-medium"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="text-center text-body-sm">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <Link href="/signup" className="app-link font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </AuthShell>
  );
}
