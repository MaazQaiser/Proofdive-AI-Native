"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Card, CardBody } from "@/components/Card";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

const MIN_PASSWORD_LENGTH = 8;

type FieldErrors = {
  current?: string;
  next?: string;
  confirm?: string;
};

export function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!currentPassword.trim()) nextErrors.current = "Enter your current password.";
    if (!newPassword.trim()) {
      nextErrors.next = "Enter a new password.";
    } else if (newPassword.length < MIN_PASSWORD_LENGTH) {
      nextErrors.next = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (!confirmPassword.trim()) {
      nextErrors.confirm = "Confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirm = "Passwords don't match.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast.success("Password changed successfully.");
    router.push("/profile");
  }

  return (
    <>
      <CoachFloatingNav />
      <AppShell>
        <div className="mx-auto w-full max-w-md">
          <Card>
            <CardBody className="p-6">
              <div className="text-h6">Change password</div>
              <p className="mt-1 text-caption text-[var(--app-muted)]">
                Enter your current password, then choose a new one.
              </p>

              <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="current-password">Current password</Label>
                  <PasswordInput
                    id="current-password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    aria-invalid={!!errors.current}
                  />
                  {errors.current && <p className="text-caption text-red-500">{errors.current}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="new-password">New password</Label>
                  <PasswordInput
                    id="new-password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    aria-invalid={!!errors.next}
                  />
                  {errors.next && <p className="text-caption text-red-500">{errors.next}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <PasswordInput
                    id="confirm-password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    aria-invalid={!!errors.confirm}
                  />
                  {errors.confirm && <p className="text-caption text-red-500">{errors.confirm}</p>}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="submit"
                    className="rounded-full bg-[#0d6b60] px-4 py-2 text-caption font-semibold text-white transition hover:bg-[#0d6b60]/90"
                  >
                    Change password
                  </button>
                  <Link
                    href="/profile"
                    className="rounded-full border border-[var(--app-hairline)] bg-[var(--app-surface)] px-4 py-2 text-caption font-semibold shadow-sm transition hover:bg-black/[.03] active:bg-black/[.06]"
                  >
                    Cancel
                  </Link>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      </AppShell>
    </>
  );
}
