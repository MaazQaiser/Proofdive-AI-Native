"use client";

import { type FormEvent, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

const PASSWORD_RULE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

type FieldErrors = {
  current?: string;
  next?: string;
  confirm?: string;
};

export function PartnerPasswordSection() {
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
    } else if (!PASSWORD_RULE.test(newPassword)) {
      nextErrors.next =
        "Password must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.";
    }
    if (!confirmPassword.trim()) {
      nextErrors.confirm = "Confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirm = "Password and Confirm Password do not match.";
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
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password and Auth</CardTitle>
        <CardDescription>Update the password used to sign in to your partner account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="flex max-w-sm flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <div className="flex flex-col gap-2">
            <Label htmlFor="partner-current-password">Current Password</Label>
            <PasswordInput
              id="partner-current-password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              aria-invalid={!!errors.current}
            />
            {errors.current && <p className="text-caption text-destructive">{errors.current}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="partner-new-password">New Password</Label>
            <PasswordInput
              id="partner-new-password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              aria-invalid={!!errors.next}
            />
            {errors.next && <p className="text-caption text-destructive">{errors.next}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="partner-confirm-password">Confirm New Password</Label>
            <PasswordInput
              id="partner-confirm-password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              aria-invalid={!!errors.confirm}
            />
            {errors.confirm && <p className="text-caption text-destructive">{errors.confirm}</p>}
          </div>

          <Button type="submit" className="w-fit">
            Update Password
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
