"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthHeading } from "@/components/auth/AuthHeading";
import { AuthShell } from "@/components/auth/AuthShell";
import { AuthDivider, SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

const fieldClassName =
  "h-11 rounded-md border-border bg-card px-3 text-body-sm placeholder:text-placeholder md:text-body-sm";

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
    <AuthShell>
      <div className="flex w-full flex-col items-stretch gap-6">
        <AuthHeading title="Welcome back">Sign in to pick up where you left off.</AuthHeading>

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
