"use client";

import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export function PartnerDeleteAccountSection() {
  const [isRequested, setIsRequested] = useLocalStorageState<boolean>(
    StorageKeys.partnerAccountDeletionRequested,
    false,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleConfirm() {
    setIsRequested(true);
    setConfirmOpen(false);
    toast.success("Your account deletion request has been submitted.");
  }

  return (
    <Card className="border-destructive/30">
      <CardHeader>
        <CardTitle className="text-destructive">Revoke Consent / Delete Account</CardTitle>
        <CardDescription>
          Request account deletion and revoke consent for data processing. Once confirmed, your account will be
          marked for deletion and access disabled.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isRequested ? (
          <div className="flex items-start gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-4">
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
            <p className="text-body-sm text-destructive">Your account is already scheduled for deletion.</p>
          </div>
        ) : (
          <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
            Request Account Deletion
          </Button>
        )}
      </CardContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              Please confirm account deletion to proceed. This action schedules your partner account for removal.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirm}>
              Confirm Deletion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
