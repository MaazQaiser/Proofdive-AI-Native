"use client";

import { Clock3, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { AuthSteps } from "@/components/auth/AuthSteps";
import { PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { AuthDivider, SocialAuthButtons } from "@/components/auth/SocialAuthButtons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { ONBOARDING_STEP_LABELS } from "@/app/onboarding/ui/OnboardingProgressHeader";
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

/**
 * The right panel answers the question this screen raises — what happens after
 * this button? — rather than teaching the scoring framework, which nobody needs
 * in order to decide to sign up (the client: "make more sense, show what the
 * user needs here"). The left column promises a first session ten minutes
 * away; this shows what those ten minutes hold.
 *
 * The steps are onboarding's own, named exactly as its progress header names
 * them one screen later (ONBOARDING_STEP_LABELS), so the next screen confirms
 * this one. Each line was checked against OnboardingAgent: a CV dropped or
 * three quick questions; the role and its job description; a Core Four
 * inferred from that description; a first session the user may start
 * anywhere. Keyed by the label type, so a renamed step is a type error here,
 * not a stale promise.
 */
const STEP_DETAIL: Record<(typeof ONBOARDING_STEP_LABELS)[number], string> = {
  "Your background": "Drop your CV, or answer three quick questions.",
  Target: "The role you want, and its job description.",
  "Focus areas": "Your Core Four, picked from that job description.",
  "First session": "Start with a lesson, a story or a mock interview.",
};

/** The panel's sequence and its glass are AuthSteps'; this page only says what the steps are. */
function SignupAside() {
  return (
    <AuthSteps
      eyebrow="After you sign up"
      title="Four steps to your first session."
      steps={ONBOARDING_STEP_LABELS.map((label) => ({ label, detail: STEP_DETAIL[label] }))}
      chip={
        <>
          <Clock3 className="size-3.5" aria-hidden />
          About 10 minutes
        </>
      }
      // the product's own promise (SESSION_PROMISES in OnboardingAgent)
      footnote="Nothing is written for you. Everything stays grounded in what actually happened."
    />
  );
}

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
    <AuthShell aside={<SignupAside />}>
      <div className="flex w-full flex-col items-stretch gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-gilroy text-[2rem] font-bold leading-tight tracking-[-0.03em] text-extended-green-blue">
            Create your account
          </h1>
          <p className="text-body-sm text-muted-foreground">
            Your first practice session is about 10 minutes away.
          </p>
        </div>

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
              />
              {password.length > 0 ? <PasswordStrengthMeter password={password} /> : null}
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
