"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthHeading } from "@/components/auth/AuthHeading";
import { AuthShell } from "@/components/auth/AuthShell";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { AuthDivider, SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  MOCK_SOCIAL_IDENTITY,
  nameFromEmail,
  writeAuthIdentity,
  type AuthIdentity,
} from "@/lib/authIdentity";
import { writeJson } from "@/lib/storage";
import { cn } from "@/lib/utils";

const fieldClassName =
  "h-11 rounded-md border-border bg-card px-3 text-body-sm placeholder:text-placeholder md:text-body-sm";

export default function SignupPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /** Consent is implicit — proceeding past the "By signing up you agree…"
   * notice records it, no checkbox friction. Every path opens the same
   * onboarding flow (the second design variant was retired). */
  function continueToApp(
    destination = "/onboarding",
    identity?: AuthIdentity,
  ) {
    if (submitting) return;
    setSubmitting(true);
    writeJson(StorageKeys.termsConsent, true);
    // Onboarding greets the user by name when the provider gave us one.
    if (identity) writeAuthIdentity(identity);
    router.push(destination);
  }

  return (
    <AuthShell>
      <div className="flex w-full flex-col items-stretch gap-6">
        <AuthHeading title="Create your account">
          Your first practice session is about 10 minutes away.
        </AuthHeading>

        <SocialAuthButtons
          onLinkedIn={() =>
            continueToApp("/onboarding", {
              ...MOCK_SOCIAL_IDENTITY,
              provider: "linkedin",
            })
          }
          onGoogle={() =>
            continueToApp("/onboarding", {
              ...MOCK_SOCIAL_IDENTITY,
              provider: "google",
            })
          }
          linkedInBadge="imports your experience"
          disabled={submitting}
        />

        <AuthDivider />

        <form
          className="flex w-full flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            // No provider profile on this path — the best we have is the
            // address, so derive a name from it (empty stays generic).
            const email = String(
              new FormData(e.currentTarget).get("email") ?? "",
            );
            continueToApp("/onboarding", {
              name: nameFromEmail(email),
              email,
              provider: "email",
            });
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
                placeholder="you@example.com"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                aria-describedby="signup-password-strength"
              />
              <PasswordStrengthMeter password={password} id="signup-password-strength" />
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
                Creating account…
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        <div className="flex flex-col gap-4">
          <p className="text-center text-caption text-muted-foreground">
            By signing up you agree to the{" "}
            <Link
              href="/terms"
              target="_blank"
              className="app-link font-medium"
            >
              terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="app-link font-medium"
            >
              privacy policy
            </Link>
            .
          </p>

          <p className="text-center text-body-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="app-link font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
