"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CompetencyFrameworkVersion } from "@/lib/superAdminCompetencyFrameworks";

type Props = {
  open: boolean;
  source: CompetencyFrameworkVersion | null;
  isNameTaken: (name: string) => boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => void;
};

export function CreateFrameworkCloneDialog({
  open,
  source,
  isNameTaken,
  onOpenChange,
  onConfirm,
}: Props) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open || !source) return;
    setName(`${source.name} (Clone)`);
  }, [open, source]);

  function handleConfirm() {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Enter a name for this framework version.");
      return;
    }
    if (isNameTaken(trimmed)) {
      toast.error("A framework with that name already exists.");
      return;
    }
    onConfirm(trimmed);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create framework clone</DialogTitle>
          <DialogDescription>
            Duplicate{" "}
            <span className="font-medium text-foreground">
              {source?.name ?? "this framework"}
            </span>{" "}
            as a draft you can edit. The original stays unchanged.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5 py-2">
          <Label htmlFor="framework-clone-name">Version name</Label>
          <Input
            id="framework-clone-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Acme Custom Framework"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleConfirm();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Create clone
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
