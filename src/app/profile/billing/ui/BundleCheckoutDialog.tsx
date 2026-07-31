"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BILLING_CYCLE_LABEL,
  formatUsd,
  type BillingCycle,
  type PaymentBundle,
} from "@/lib/superAdminPaymentsData";

type CheckoutStep = "cycle" | "review";

export function BundleCheckoutDialog({
  bundle,
  cycle,
  step,
  forceFail,
  pendingCancel,
  onCycleChange,
  onStepChange,
  onForceFailChange,
  onClose,
  onComplete,
}: {
  bundle: PaymentBundle | null;
  cycle: BillingCycle | null;
  step: CheckoutStep;
  forceFail: boolean;
  pendingCancel: boolean;
  onCycleChange: (cycle: BillingCycle) => void;
  onStepChange: (step: CheckoutStep) => void;
  onForceFailChange: (fail: boolean) => void;
  onClose: () => void;
  onComplete: () => void;
}) {
  return (
    <Dialog open={Boolean(bundle)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{step === "cycle" ? "Select Billing Cycle" : "Review & pay"}</DialogTitle>
          <DialogDescription>
            {bundle?.name}
            {pendingCancel ? " — switching clears your pending cancellation." : ""}
          </DialogDescription>
        </DialogHeader>
        {step === "cycle" && bundle ? (
          <div className="space-y-2" role="radiogroup" aria-label="Billing cycle">
            {bundle.cycles.map((c) => (
              <label
                key={c.cycle}
                className="flex cursor-pointer items-center justify-between rounded-xl border border-border px-3 py-2 text-caption transition-colors hover:bg-muted/50"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="cycle"
                    checked={cycle === c.cycle}
                    onChange={() => onCycleChange(c.cycle)}
                  />
                  {BILLING_CYCLE_LABEL[c.cycle]}
                </span>
                <span className="font-medium">{formatUsd(c.price)}</span>
              </label>
            ))}
          </div>
        ) : bundle && cycle ? (
          <div className="space-y-3 text-caption">
            <div className="flex justify-between">
              <span>Bundle</span>
              <span className="font-medium">{bundle.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Cycle</span>
              <span className="font-medium">{BILLING_CYCLE_LABEL[cycle]}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 font-medium">
              <span>Total</span>
              <span>
                {formatUsd(bundle.cycles.find((c) => c.cycle === cycle)?.price ?? 0)}
              </span>
            </div>
            <label className="flex items-center gap-2 text-overline text-muted-foreground">
              <Checkbox checked={forceFail} onCheckedChange={(c) => onForceFailChange(Boolean(c))} />
              Simulate payment failure
            </label>
          </div>
        ) : null}
        <DialogFooter>
          {step === "cycle" ? (
            <>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!cycle}
                onClick={() => {
                  if (!cycle) {
                    toast.error("Please select a billing cycle.");
                    return;
                  }
                  onStepChange("review");
                }}
              >
                Review
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={() => onStepChange("cycle")}>
                Back
              </Button>
              <Button type="button" onClick={onComplete}>
                Pay with Stripe (demo)
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
