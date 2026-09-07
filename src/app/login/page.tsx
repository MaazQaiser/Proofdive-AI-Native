"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { AuthDivider, SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

const fieldClassName =
  "h-11 rounded-md border-border bg-white px-3 text-body-sm placeholder:text-placeholder md:text-body-sm";

/** Proof-record teaser + bar chart for the visual panel. Decorative
 * marketing content — the chart carries no data, so it's aria-hidden. */
const PROOF_BARS = [
  { height: "h-10", color: "bg-brand-900" },
  { height: "h-16", color: "bg-brand-600" },
  { height: "h-12", color: "bg-brand-800" },
  { height: "h-20", color: "bg-brand-400" },
  { height: "h-28", color: "bg-brand-100" },
];

/** Right-panel content: the proof-record teaser card. */
function LoginAside() {
  return (
    <div className="w-full max-w-[360px] rounded-2xl bg-card p-6 shadow-[0_16px_40px_-24px_rgba(4,32,39,0.35)]">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-h5 font-medium text-foreground">Your proof record</h2>
        <Badge>↑ trending</Badge>
      </div>
      <div aria-hidden className="mt-6 flex h-28 items-end gap-2">
        {PROOF_BARS.map((bar, i) => (
          <span key={i} className={cn("flex-1 rounded-md", bar.height, bar.color)} />
        ))}
      </div>
      <p className="mt-5 text-caption text-text-secondary">
        Candidates who practice twice a week reach interview-ready scores{" "}
        <strong className="font-semibold text-foreground">3× faster</strong>.
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
          <h1 className="font-gilroy text-[2rem] font-bold leading-tight tracking-[-0.03em] text-[#033B4F]">
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
