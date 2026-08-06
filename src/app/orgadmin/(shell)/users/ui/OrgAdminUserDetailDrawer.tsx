"use client";

import { Ban, CheckCircle2, Pencil, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DetailField, DetailGrid } from "@/components/ui/detail-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { OrgAdminUser } from "@/lib/orgAdminUsers";

import { OrgAdminUserStatusPill } from "./OrgAdminUserStatusPill";

type FieldErrors = Record<string, string>;

type FormState = {
  name: string;
};

function buildForm(user: OrgAdminUser): FormState {
  return { name: user.name };
}

type OrgAdminUserDetailDrawerProps = {
  user: OrgAdminUser | null;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, patch: Partial<OrgAdminUser>) => void;
  onRequestStatusChange: (user: OrgAdminUser) => void;
};

export function OrgAdminUserDetailDrawer({
  user,
  onOpenChange,
  onUpdate,
  onRequestStatusChange,
}: OrgAdminUserDetailDrawerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!user) return;
    setIsEditing(false);
    setForm(buildForm(user));
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  if (!user || !form) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    );
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleSave() {
    if (!form || !user) return;
    const trimmedName = form.name.trim();
    const nextErrors: FieldErrors = {};
    if (!trimmedName) nextErrors.name = "Name is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onUpdate(user.id, { name: trimmedName });
    setIsEditing(false);
    toast.success("User updated successfully.");
  }

  return (
    <Sheet open={!!user} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="flex flex-col gap-0 overflow-hidden p-0"
      >
        <SheetHeader className="flex min-h-14 shrink-0 flex-row flex-wrap items-center justify-end gap-2 space-y-0 border-b border-border py-4 pl-6 pr-4">
          <SheetTitle className="sr-only">{user.name}</SheetTitle>
          <Button
            size="sm"
            variant={user.status === "active" ? "destructive" : "default"}
            onClick={() => onRequestStatusChange(user)}
          >
            {user.status === "active" ? (
              <>
                <Ban className="h-3.5 w-3.5" />
                Deactivate
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Activate
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsEditing(true)}
            disabled={isEditing}
            aria-label="Edit user details"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Details
          </Button>
          <SheetClose asChild>
            <Button size="sm" variant="ghost" className="size-8 shrink-0 p-0!" aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-8 flex min-w-0 flex-col gap-0.5">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate text-h4 leading-none text-foreground">{user.name}</p>
              <OrgAdminUserStatusPill status={user.status} />
            </div>
            <p className="truncate text-caption text-muted-foreground">{user.email}</p>
          </div>
          {!isEditing ? (
            <div className="flex flex-col gap-8">
              <DetailGrid>
                <DetailField label="Invited Date" value={user.invitedDate} />
                <DetailField label="Joined Date" value={user.joinedDate} />
              </DetailGrid>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-body font-semibold tracking-tight text-foreground">Edit User Details</h3>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    Save Changes
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-user-name">Name</Label>
                <Input
                  id="edit-user-name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Jane Doe"
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-caption text-destructive">{errors.name}</p>}
              </div>

              <DetailField label="Email" value={user.email} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
