"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { AuthVisualPanel } from "@/components/auth/AuthVisualPanel";
import { isPasswordStrong, PasswordStrengthMeter } from "@/components/auth/PasswordStrengthMeter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/ui/logo";
import { ORG_ADMIN_DEMO_ORG } from "@/lib/orgAdminDemo";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { writeJson } from "@/lib/storage";

const WEAK_PASSWORD_ERROR =
  "Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.";
const MISMATCH_ERROR = "Password and Confirm Password do not match.";
const CONSENT_ERROR = "Please accept Terms & Conditions and Privacy Policy.";

export default function OrgAdminAcceptInvitePage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; agreed?: string }>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const nextErrors: typeof errors = {};
    if (!isPasswordStrong(password)) nextErrors.password = WEAK_PASSWORD_ERROR;
    if (password !== confirmPassword) nextErrors.confirmPassword = MISMATCH_ERROR;
    if (!agreed) nextErrors.agreed = CONSENT_ERROR;

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    writeJson(StorageKeys.termsConsent, true);
    router.push("/orgadmin/overview");
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white">
      <header className="relative z-10 flex h-20 shrink-0 items-center px-12">
        <Link href="/">
          <Logo size="xxs" />
        </Link>
      </header>

      <div className="relative flex flex-1 overflow-hidden">
        <AuthVisualPanel />

        <div className="flex w-full items-center justify-center px-6 py-16 lg:w-[731px] lg:shrink-0 lg:px-12">
          <div className="flex w-full max-w-[524px] flex-col items-start gap-3">
            <div className="flex w-full flex-col items-center">
              <h1 className="text-subheading text-center font-medium text-extended-dark-cyan">
                Activate Your Account
              </h1>
            </div>
            <div className="flex w-full flex-col items-center">
              <p className="text-center text-[22px] leading-10 font-medium tracking-[-0.88px] text-muted-foreground">
                Set a password for {ORG_ADMIN_DEMO_ORG.name}
              </p>
            </div>

            <form className="flex w-full flex-col gap-[26px]" onSubmit={handleSubmit}>
              <div className="flex w-full flex-col gap-4">
                <div className="flex w-full flex-col gap-[5px]">
                  <Label htmlFor="invite-email" className="text-caption font-normal text-foreground">
                    Email
                  </Label>
                  <Input
                    id="invite-email"
                    name="email"
                    type="email"
                    value={ORG_ADMIN_DEMO_ORG.contactEmail}
                    disabled
                    readOnly
                    className="h-14 rounded-lg border-border px-[13px] py-[17px] text-lg text-muted-foreground disabled:opacity-100 md:text-lg"
                  />
                </div>
                <div className="flex w-full flex-col gap-[5px]">
                  <Label htmlFor="invite-password" className="text-caption font-normal text-foreground">
                    Password
                  </Label>
                  <Input
                    id="invite-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: undefined }));
                    }}
                    aria-invalid={!!errors.password}
                    className="h-14 rounded-lg border-border px-[13px] py-[17px] text-lg placeholder:text-placeholder md:text-lg"
                  />
                  <PasswordStrengthMeter password={password} />
                  {errors.password ? (
                    <p className="text-overline text-destructive" role="alert">
                      {errors.password}
                    </p>
                  ) : null}
                </div>
                <div className="flex w-full flex-col gap-[5px]">
                  <Label htmlFor="invite-confirm-password" className="text-caption font-normal text-foreground">
                    Confirm Password
                  </Label>
                  <Input
                    id="invite-confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }}
                    aria-invalid={!!errors.confirmPassword}
                    className="h-14 rounded-lg border-border px-[13px] py-[17px] text-lg placeholder:text-placeholder md:text-lg"
                  />
                  {errors.confirmPassword ? (
                    <p className="text-overline text-destructive" role="alert">
                      {errors.confirmPassword}
                    </p>
                  ) : null}
                </div>

                <label className="flex w-full cursor-pointer items-start gap-2.5 text-caption text-muted-foreground">
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
              <Button type="submit" className="h-14 w-full rounded-lg text-lg font-medium">
                Activate Account
              </Button>
            </form>
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
