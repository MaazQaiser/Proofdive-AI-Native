"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  SUPER_ADMIN_DEMO_PROFILE,
  type SuperAdminProfile,
} from "@/lib/superAdminProfileData";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export function SuperAdminProfileDetailsSection() {
  const [overrides, setOverrides] = useLocalStorageState<Partial<SuperAdminProfile>>(
    StorageKeys.superAdminProfileOverrides,
    {},
  );
  const profile: SuperAdminProfile = { ...SUPER_ADMIN_DEMO_PROFILE, ...overrides };

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(profile.fullName);
  const [error, setError] = useState<string | null>(null);

  function startEditing() {
    setFullName(profile.fullName);
    setError(null);
    setIsEditing(true);
  }

  function handleSave() {
    if (!fullName.trim()) {
      setError("Full Name is required.");
      return;
    }
    setOverrides((prev) => ({ ...prev, fullName: fullName.trim() }));
    setIsEditing(false);
    toast.success("Profile updated successfully.");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Account Info</CardTitle>
            <CardDescription>View and update your Super Admin account details.</CardDescription>
          </div>
          {!isEditing ? (
            <Button size="sm" variant="outline" onClick={startEditing}>
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isEditing ? (
          <div className="flex max-w-sm flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sa-full-name">Full Name</Label>
              <Input
                id="sa-full-name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  setError(null);
                }}
                aria-invalid={!!error}
              />
              {error ? <p className="text-caption text-destructive">{error}</p> : null}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email Address</Label>
              <Input value={profile.email} disabled readOnly />
              <p className="text-caption text-muted-foreground">Email address is read-only.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        ) : (
          <div className="grid max-w-lg gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-0.5">
              <span className="text-caption text-muted-foreground">Full Name</span>
              <span className="text-body-sm text-foreground">{profile.fullName}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-caption text-muted-foreground">Email Address</span>
              <span className="text-body-sm text-foreground">{profile.email}</span>
            </div>
          </div>
        )}

        <div className="rounded-md border border-border p-4">
          <p className="text-body-sm font-medium text-foreground">Security</p>
          <p className="mt-1 text-caption text-muted-foreground">
            Change your password from Password and Auth, or use Forgot Password on the login screen if you
            cannot sign in.
          </p>
          <Button size="sm" variant="outline" className="mt-3" asChild>
            <Link href="/superadmin/profile/password">Change Password</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
