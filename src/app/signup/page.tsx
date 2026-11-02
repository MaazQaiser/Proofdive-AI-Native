"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
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

/**
 * Minimal on purpose: words, a numbered rail and the water — no cards, no
 * icons, no fills. The ink is the panel's own teal (extended-green-blue),
 * not the page's grey: grey falls under AA on this gradient. Labels at full
 * strength, everything else at 80% — measured at the gradient's darkest end,
 * that is the lowest step that clears 4.5:1 in both themes (70% gave 3.99 in
 * light), and brand-blue numerals fell to 4.08. Weight and size carry the
 * hierarchy instead of colour. The closing line is the product's own promise (SESSION_PROMISES in
 * OnboardingAgent), so the panel claims nothing the product does not.
 */
function SignupAside() {
  const last = ONBOARDING_STEP_LABELS.length - 1;
  return (
    <div className="w-full max-w-[380px]">
      <p className="text-overline uppercase text-extended-green-blue/80">After you sign up</p>
      <h2 className="mt-3 font-gilroy text-h3 font-bold tracking-[-0.02em] text-extended-green-blue [text-wrap:balance]">
        Four steps to your first session.
      </h2>

      <ol className="mt-10 flex flex-col">
        {ONBOARDING_STEP_LABELS.map((label, i) => (
          <li key={label} className="relative grid grid-cols-[2rem_1fr] gap-x-3 pb-7 last:pb-0">
            {/* the rail, from under this numeral to the next */}
            {i < last ? (
              <span
                aria-hidden
                className="absolute bottom-1 left-[0.55rem] top-7 w-px bg-extended-green-blue/20"
              />
            ) : null}
            {/* the list already says the order to a screen reader */}
            <span
              aria-hidden
              className="pt-px font-gilroy text-body-sm font-semibold tabular-nums text-extended-green-blue/80"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <h3 className="text-body-sm font-semibold text-extended-green-blue">{label}</h3>
              <p className="mt-0.5 text-caption text-extended-green-blue/80">{STEP_DETAIL[label]}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-10 border-t border-extended-green-blue/15 pt-5 text-caption text-extended-green-blue/80">
        Nothing is written for you. Everything stays grounded in what actually happened.
      </p>
    </div>
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
