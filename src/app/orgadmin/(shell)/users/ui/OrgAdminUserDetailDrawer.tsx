"use client";

import { Ban, CheckCircle2, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { OrgAdminUser } from "@/lib/orgAdminUsers";

import { OrgAdminUserStatusPill } from "./OrgAdminUserStatusPill";

type FieldErrors = Record<string, string>;

type FormState = {
  name: string;
  phone: string;
};

function buildForm(user: OrgAdminUser): FormState {
  return { name: user.name, phone: user.phone };
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-caption text-muted-foreground">{label}</span>
      <span className="text-body-sm text-foreground">{value || "—"}</span>
    </div>
  );
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
    const trimmedPhone = form.phone.trim();
    const nextErrors: FieldErrors = {};
    if (!trimmedName) nextErrors.name = "Name is required.";
    if (!trimmedPhone) nextErrors.phone = "Phone Number is required.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onUpdate(user.id, { name: trimmedName, phone: trimmedPhone });
    setIsEditing(false);
    toast.success("User updated successfully.");
  }

  return (
    <Sheet open={!!user} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>User Details</SheetTitle>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {!isEditing ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-h6 text-foreground">{user.name}</h2>
                  <p className="text-body-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <OrgAdminUserStatusPill status={user.status} />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsEditing(true)}
                    aria-label="Edit user details"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Phone Number" value={user.phone} />
                <DetailRow label="Invited Date" value={user.invitedDate} />
                <DetailRow label="Joined Date" value={user.joinedDate ?? "—"} />
              </div>

              <Button variant="outline" size="sm" className="w-fit" onClick={() => onRequestStatusChange(user)}>
                {user.status === "active" ? (
                  <>
                    <Ban className="h-4 w-4" />
                    Deactivate User
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Activate User
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-body-sm font-semibold text-foreground">Edit User Details</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-user-name">Name</Label>
                <Input
                  id="edit-user-name"
                  value={form.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-caption text-destructive">{errors.name}</p>}
              </div>

              <DetailRow label="Email" value={user.email} />

              <div className="flex flex-col gap-2">
                <Label htmlFor="edit-user-phone">Phone Number</Label>
                <Input
                  id="edit-user-phone"
                  value={form.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  aria-invalid={!!errors.phone}
                />
                {errors.phone && <p className="text-caption text-destructive">{errors.phone}</p>}
              </div>

              <Button onClick={handleSave} className="w-fit">
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
