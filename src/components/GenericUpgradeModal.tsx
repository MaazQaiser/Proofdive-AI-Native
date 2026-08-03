"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Shared upgrade modal for Free-plan usage limits and feature gates (story 3.2).
 * Content is intentionally generic and identical at every touchpoint.
 */
export function GenericUpgradeModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade your plan</DialogTitle>
          <DialogDescription>
            Upgrading gives you more room to practice with the tools you already rely on, so you can
            keep building momentum in your preparation.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Not now
          </Button>
          <Button asChild>
            <Link href="/profile/pricing" onClick={() => onOpenChange(false)}>
              Upgrade Plan
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
