"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type OrgAdminPasswordPolicy } from "@/lib/orgAdminUsers";

const MIN_ALLOWED_LENGTH = 8;

type PasswordRulesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  policy: OrgAdminPasswordPolicy;
  onSave: (policy: OrgAdminPasswordPolicy) => void;
};

export function PasswordRulesDialog({ open, onOpenChange, policy, onSave }: PasswordRulesDialogProps) {
  const [draft, setDraft] = useState<OrgAdminPasswordPolicy>(policy);
  const [minLengthInput, setMinLengthInput] = useState(String(policy.minLength));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setDraft(policy);
    setMinLengthInput(String(policy.minLength));
    setError("");
  }, [open, policy]);

  function handleSave() {
    const parsed = Number(minLengthInput);
    if (!Number.isInteger(parsed) || parsed < MIN_ALLOWED_LENGTH) {
      setError(`Minimum length must be at least ${MIN_ALLOWED_LENGTH} characters.`);
      return;
    }
    onSave({ ...draft, minLength: parsed });
    onOpenChange(false);
    toast.success("Password rules updated.");
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Password Rules Management</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password-min-length">Minimum Password Length</Label>
            <Input
              id="password-min-length"
              type="number"
              min={MIN_ALLOWED_LENGTH}
              value={minLengthInput}
              onChange={(e) => {
                setMinLengthInput(e.target.value);
                setError("");
              }}
              aria-invalid={!!error}
            />
            {error && <p className="text-caption text-destructive">{error}</p>}
          </div>

          <div className="flex flex-col gap-3">
            <label className="flex cursor-pointer items-center gap-2.5">
              <Checkbox
                checked={draft.requireUppercase}
                onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, requireUppercase: !!checked }))}
              />
              <span className="text-body-sm text-foreground">Require one uppercase letter</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5">
              <Checkbox
                checked={draft.requireLowercase}
                onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, requireLowercase: !!checked }))}
              />
              <span className="text-body-sm text-foreground">Require one lowercase letter</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5">
              <Checkbox
                checked={draft.requireNumber}
                onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, requireNumber: !!checked }))}
              />
              <span className="text-body-sm text-foreground">Require one number</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2.5">
              <Checkbox
                checked={draft.requireSpecialChar}
                onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, requireSpecialChar: !!checked }))}
              />
              <span className="text-body-sm text-foreground">Require one special character</span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
