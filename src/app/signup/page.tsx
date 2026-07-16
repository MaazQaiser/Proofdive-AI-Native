"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { LogoSymbol } from "@/components/ui/logo-symbol";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { writeJson } from "@/lib/storage";
import { cn } from "@/lib/utils";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-5 w-5 shrink-0", className)} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("h-5 w-5 shrink-0 text-[#0A66C2]", className)} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [showAgreeError, setShowAgreeError] = useState(false);

  function guardConsent(): boolean {
    if (!agreed) {
      setShowAgreeError(true);
      return false;
    }
    writeJson(StorageKeys.termsConsent, true);
    return true;
  }

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4 sm:px-8">
        <Link href="/">
          <Logo size="xxs" />
        </Link>
        <Button asChild size="sm" className="rounded-lg px-4 text-overline">
          <Link href="/login">Log In</Link>
        </Button>
      </header>

      <main className="mx-auto flex w-full max-w-[524px] flex-col items-center px-6 py-16 text-center sm:px-8">
        <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <LogoSymbol className="h-9 w-9" />
        </div>
        <h1 className="text-subheading mt-6 text-extended-dark-cyan">
          Signup
        </h1>

        <form
          className="mt-8 w-full space-y-3 text-left"
          onSubmit={(e) => {
            e.preventDefault();
            if (!guardConsent()) return;
            router.push("/onboarding");
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              className="h-14"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              className="h-14"
              required
              minLength={8}
            />
          </div>

          <label className="flex cursor-pointer items-start gap-2.5 pt-1 text-caption text-muted-foreground">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => {
                setAgreed(e.target.checked);
                if (e.target.checked) setShowAgreeError(false);
              }}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary"
            />
            <span>
              By signing up, I agree to the{" "}
              <Link
                href="/terms"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-foreground underline-offset-2 hover:underline"
              >
                terms and conditions
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-foreground underline-offset-2 hover:underline"
              >
                privacy policy
              </Link>
              .
            </span>
          </label>
          {showAgreeError ? (
            <p className="text-left text-overline text-destructive" role="alert">
              Please agree to the terms and conditions and privacy policy to continue.
            </p>
          ) : null}
          <Button type="submit" className="text-body h-14 w-full">
            Create account
          </Button>
        </form>

        <p className="text-body mt-4 text-primary">Or sign in with</p>

        <div className="mt-4 w-full space-y-2.5">
          <Button
            type="button"
            variant="outline"
            className="text-body relative h-14 w-full"
            onClick={() => guardConsent() && router.push("/onboarding")}
          >
            <GoogleIcon className="absolute left-4 top-1/2 -translate-y-1/2" />
            <span className="font-normal text-[#242524]">Google</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="text-body relative h-14 w-full"
            onClick={() => guardConsent() && router.push("/onboarding")}
          >
            <LinkedInIcon className="absolute left-4 top-1/2 -translate-y-1/2" />
            <span className="font-normal text-[#242524]">LinkedIn</span>
          </Button>
        </div>
      </main>
    </div>
  );
}
