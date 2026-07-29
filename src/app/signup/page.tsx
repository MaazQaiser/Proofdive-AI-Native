"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";
import { GoogleIcon, LinkedInIcon } from "@/components/icons/SocialIcons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { writeJson } from "@/lib/storage";
import { cn } from "@/lib/utils";

const fieldClassName =
  "h-11 rounded-md border-border px-3 text-body-sm placeholder:text-placeholder md:text-body-sm";
const socialClassName =
  "flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-border bg-white px-4 text-body-sm font-medium text-foreground hover:bg-muted";

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
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white">
      <header className="relative z-10 flex h-16 shrink-0 items-center px-8 sm:px-12">
        <Link href="/">
          <Logo size="xxs" />
        </Link>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <AuthVisualPanel />

        <div className="flex w-full flex-1 items-center justify-center px-6 py-10 lg:min-w-[938px]">
          <div className="flex w-full max-w-[400px] flex-col items-stretch gap-5">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <h1 className="text-h4 font-medium text-extended-dark-cyan">Signup</h1>
              <p className="text-body-sm text-muted-foreground">Enter your email to get started</p>
            </div>

            <form
              className="flex w-full flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                if (!guardConsent()) return;
                router.push("/onboarding");
              }}
            >
              <div className="flex w-full flex-col gap-3">
                <div className="flex w-full flex-col gap-1.5">
                  <Label htmlFor="signup-email" className="text-caption font-normal text-foreground">
                    Email
                  </Label>
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Enter your email"
                    className={fieldClassName}
                    required
                  />
                </div>
                <div className="flex w-full flex-col gap-1.5">
                  <Label htmlFor="signup-password" className="text-caption font-normal text-foreground">
                    Password
                  </Label>
                  <PasswordInput
                    id="signup-password"
                    name="password"
                    autoComplete="new-password"
                    placeholder="Create a password"
                    className={cn(fieldClassName, "pl-3")}
                    required
                    minLength={8}
                  />
                </div>

                <label className="flex w-full cursor-pointer items-start gap-2 text-caption text-muted-foreground">
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
              </div>
              <Button type="submit" className="h-11 w-full rounded-md text-body-sm font-medium">
                Create account
              </Button>
            </form>

            <div className="flex w-full flex-col gap-2.5">
              <button
                type="button"
                onClick={() => guardConsent() && router.push("/onboarding")}
                className={socialClassName}
              >
                <GoogleIcon />
                Continue with Google
              </button>
              <button
                type="button"
                onClick={() => guardConsent() && router.push("/onboarding")}
                className={socialClassName}
              >
                <LinkedInIcon />
                Continue with LinkedIn
              </button>
            </div>

            <p className="text-center text-body-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/login-signup%20assets/Background%20gradient.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-0 w-[1276px] max-w-none"
      />
    </div>
  );
}
