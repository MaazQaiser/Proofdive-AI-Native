"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrgAdminUser } from "@/lib/orgAdminUsers";

type EditUserDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: OrgAdminUser | null;
  onUpdate: (id: string, patch: Partial<OrgAdminUser>) => void;
};

export function EditUserDialog({ open, onOpenChange, user, onUpdate }: EditUserDialogProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (!open || !user) return;
    setName(user.name);
    setError(undefined);
  }, [open, user]);

  function handleDiscard() {
    if (!user) return;
    setName(user.name);
    setError(undefined);
  }

  function handleSave() {
    if (!user) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required.");
      return;
    }
    onUpdate(user.id, { name: trimmed });
    toast.success("User updated successfully.");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex w-full max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between space-y-0 border-b border-border px-6 py-4 text-left">
          <DialogTitle>Edit User</DialogTitle>
          <DialogClose className="rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>

        <div className="flex flex-col gap-4 px-6 py-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="edit-user-name">Name</Label>
            <Input
              id="edit-user-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(undefined);
              }}
              placeholder="Jane Doe"
              aria-invalid={!!error}
            />
            {error ? <p className="text-caption text-destructive">{error}</p> : null}
          </div>
          <div className="flex flex-col gap-1">
            <Label>Email</Label>
            <p className="text-body-sm text-muted-foreground">{user?.email ?? "—"}</p>
          </div>
        </div>

        <DialogFooter className="shrink-0 border-t border-border px-6 py-4 sm:justify-end">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleDiscard} disabled={!user}>
            Discard Changes
          </Button>
          <Button onClick={handleSave} disabled={!user}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
