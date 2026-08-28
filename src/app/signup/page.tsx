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
import { SuccessDriverIcon } from "@/components/ui/success-driver-icon";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { writeJson } from "@/lib/storage";
import {
  SUCCESS_DRIVERS,
  SUCCESS_DRIVER_ORDER,
  type SuccessDriverId,
} from "@/lib/successDrivers";
import { cn } from "@/lib/utils";

const fieldClassName =
  "h-11 rounded-md border-border bg-white px-3 text-body-sm placeholder:text-placeholder md:text-body-sm";

/** Right-panel pitch: the four Success Drivers — the product's fixed
 * assessment standard and its core differentiator. One line of benefit per
 * pillar; the framework sells itself without reading like an ad. */
const PILLAR_PITCH: Record<SuccessDriverId, string> = {
  thinking: "Structured judgment under pressure",
  action: "Ownership that delivers outcomes",
  people: "Communication that moves decisions",
  mastery: "Craft depth you can demonstrate",
};

function SignupAside() {
  return (
    <div className="w-full max-w-[380px]">
      <h2 className="font-gilroy text-h3 font-bold tracking-[-0.02em] text-[#033B4F]">
        Interviews come down to four things.
      </h2>
      <p className="mt-3 text-body-sm text-text-secondary">
        ProofDive scores every answer against them — so you walk in with
        proof, not a feeling.
      </p>
      <ul className="mt-7 flex flex-col gap-4">
        {SUCCESS_DRIVER_ORDER.map((id) => (
          <li key={id} className="flex items-center gap-3.5">
            <span
              aria-hidden
              className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-extended-green-blue"
            >
              <SuccessDriverIcon driver={id} className="size-4.5 text-white" />
            </span>
            <div>
              <h3 className="text-body-sm font-semibold text-foreground">
                {SUCCESS_DRIVERS[id].label}
              </h3>
              <p className="text-caption text-text-secondary">
                {PILLAR_PITCH[id]}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-7 text-caption text-text-secondary">
        Your first session scores all four — and ends with your first proof
        report.
      </p>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /** Consent is implicit — proceeding past the "By signing up you agree…"
   * notice records it, no checkbox friction.
   * Design-comparison routing (testing): LinkedIn and the email form open
   * onboarding v1; Google opens the v2 copy so both designs are viewable. */
  function continueToApp(destination = "/onboarding") {
    if (submitting) return;
    setSubmitting(true);
    writeJson(StorageKeys.termsConsent, true);
    router.push(destination);
  }

  return (
    <AuthShell aside={<SignupAside />}>
      <div className="flex w-full flex-col items-stretch gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-gilroy text-[2rem] font-bold leading-tight tracking-[-0.03em] text-[#033B4F]">
            Create your account
          </h1>
          <p className="text-body-sm text-muted-foreground">
            Your first practice session is about 10 minutes away.
          </p>
        </div>

        <SocialAuthButtons
          onLinkedIn={() => continueToApp("/onboarding")}
          onGoogle={() => continueToApp("/onboarding-v2")}
          linkedInBadge="imports your experience"
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
              className="font-medium text-primary hover:underline"
            >
              terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              target="_blank"
              className="font-medium text-primary hover:underline"
            >
              privacy policy
            </Link>
            .
          </p>

          <p className="text-center text-body-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
