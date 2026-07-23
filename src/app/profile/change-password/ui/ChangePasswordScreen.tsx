"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { CoachFloatingNav } from "@/components/CoachFloatingNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>Enter your current password, then choose a new one.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="current-password">Current password</Label>
                  <PasswordInput
                    id="current-password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    aria-invalid={!!errors.current}
                  />
                  {errors.current && <p className="text-caption text-destructive">{errors.current}</p>}
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
                  {errors.next && <p className="text-caption text-destructive">{errors.next}</p>}
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
                  {errors.confirm && <p className="text-caption text-destructive">{errors.confirm}</p>}
                </div>

                <div className="mt-2 flex items-center gap-2">
                  <Button type="submit">Change password</Button>
                  <Button variant="outline" asChild>
                    <Link href="/profile">Cancel</Link>
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    </>
  );
}
