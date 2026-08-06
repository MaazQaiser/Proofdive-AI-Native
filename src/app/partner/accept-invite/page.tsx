"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState } from "react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { PARTNER_DEMO } from "@/lib/partnerDemo";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { readJson, writeJson } from "@/lib/storage";
import { cn } from "@/lib/utils";

const EMPTY_PASSWORD_ERROR = "Please enter a password.";
const MISMATCH_ERROR = "Password and Confirm Password do not match.";
const CONSENT_ERROR = "Please accept Terms & Conditions and Privacy Policy.";

const fieldClassName =
  "h-11 rounded-md border-border bg-white px-3 text-body-sm placeholder:text-placeholder md:text-body-sm";

export default function PartnerAcceptInvitePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; agreed?: string }>({});

  useEffect(() => {
    if (readJson<boolean>(StorageKeys.partnerAccountActivated) === true) {
      router.replace("/partner/overview");
      return;
    }
    setReady(true);
  }, [router]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const nextErrors: typeof errors = {};
    if (!password) nextErrors.password = EMPTY_PASSWORD_ERROR;
    if (password !== confirmPassword) nextErrors.confirmPassword = MISMATCH_ERROR;
    if (!agreed) nextErrors.agreed = CONSENT_ERROR;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    writeJson(StorageKeys.termsConsent, true);
    writeJson(StorageKeys.partnerAccountActivated, true);
    router.push("/partner/overview");
  }

  if (!ready) {
    return null;
  }

  return (
    <AuthShell>
      <div className="flex w-full max-w-[400px] flex-col items-stretch gap-5">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h1 className="text-h4 font-medium text-extended-dark-cyan">Activate Your Partner Account</h1>
          <p className="text-body-sm text-muted-foreground">
            Set a password to access your referral dashboard
          </p>
        </div>

        <form className="flex w-full flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex w-full flex-col gap-3">
            <div className="flex w-full flex-col gap-1.5">
              <Label htmlFor="partner-invite-email" className="text-caption font-normal text-foreground">
                Email
              </Label>
              <Input
                id="partner-invite-email"
                name="email"
                type="email"
                value={PARTNER_DEMO.email}
                disabled
                readOnly
                className={cn(fieldClassName, "text-muted-foreground disabled:opacity-100")}
              />
            </div>
            <div className="flex w-full flex-col gap-1.5">
              <Label htmlFor="partner-invite-password" className="text-caption font-normal text-foreground">
                Password
              </Label>
              <PasswordInput
                id="partner-invite-password"
                name="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, password: undefined }));
                }}
                aria-invalid={!!errors.password}
                className={cn(fieldClassName, "pl-3")}
              />
              {errors.password ? (
                <p className="text-overline text-destructive" role="alert">
                  {errors.password}
                </p>
              ) : null}
            </div>
            <div className="flex w-full flex-col gap-1.5">
              <Label
                htmlFor="partner-invite-confirm-password"
                className="text-caption font-normal text-foreground"
              >
                Confirm Password
              </Label>
              <PasswordInput
                id="partner-invite-confirm-password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                }}
                aria-invalid={!!errors.confirmPassword}
                className={cn(fieldClassName, "pl-3")}
              />
              {errors.confirmPassword ? (
                <p className="text-overline text-destructive" role="alert">
                  {errors.confirmPassword}
                </p>
              ) : null}
            </div>

            <label className="flex w-full cursor-pointer items-start gap-2 text-caption text-muted-foreground">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => {
                  setAgreed(e.target.checked);
                  if (e.target.checked) setErrors((prev) => ({ ...prev, agreed: undefined }));
                }}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-input accent-primary"
              />
              <span>
                I agree to the{" "}
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
            {errors.agreed ? (
              <p className="text-left text-overline text-destructive" role="alert">
                {errors.agreed}
              </p>
            ) : null}
          </div>
          <Button type="submit" className="h-11 w-full rounded-md text-body-sm font-medium">
            Activate Account
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
