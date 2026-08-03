"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DISCOUNT_STATUS_LABEL,
  DISCOUNT_TYPE_LABEL,
  formatUsd,
  resolveDiscountStatus,
} from "@/lib/superAdminPaymentsData";
import { useDiscountCodes } from "@/lib/useDiscountCodes";

import { PaymentsShell } from "./PaymentsShell";

export function DiscountDetailScreen({ codeId }: { codeId: string }) {
  const router = useRouter();
  const { getById, deactivate, reactivate, upsert, hydrated } = useDiscountCodes();
  const code = getById(codeId);

  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [confirmReactivate, setConfirmReactivate] = useState(false);
  const [extendExpiry, setExtendExpiry] = useState("");
  const [extendMax, setExtendMax] = useState("");
  const [blockReason, setBlockReason] = useState<"expiry" | "max" | "both" | null>(null);

  if (!hydrated) {
    return (
      <PaymentsShell title="Discount Code">
        <p className="text-caption text-muted-foreground">Loading…</p>
      </PaymentsShell>
    );
  }

  if (!code) {
    return (
      <PaymentsShell title="Not found">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-caption text-muted-foreground">This discount code does not exist.</p>
            <Button className="mt-4" onClick={() => router.push("/superadmin/payments/discounts")}>
              Back
            </Button>
          </CardContent>
        </Card>
      </PaymentsShell>
    );
  }

  const status = resolveDiscountStatus(code);

  function tryReactivate() {
    const patch: { expiryDate?: string; maxRedemptions?: number } = {};
    if (extendExpiry) patch.expiryDate = extendExpiry;
    if (extendMax) patch.maxRedemptions = Number(extendMax);
    const result = reactivate(code!.id, patch);
    if (!result.ok) {
      setBlockReason(result.reason === "missing" ? null : result.reason);
      if (result.reason === "expiry" || result.reason === "both") {
        setExtendExpiry(code!.expiryDate);
      }
      if (result.reason === "max" || result.reason === "both") {
        setExtendMax(String(code!.maxRedemptions ?? code!.redemptions.length + 1));
      }
      setConfirmReactivate(true);
      return;
    }
    setConfirmReactivate(false);
    setBlockReason(null);
    toast.success("Discount code reactivated.");
  }

  return (
    <PaymentsShell
      title={code.code}
      actions={
        <div className="flex flex-wrap gap-2">
          {!code.deactivated && status !== "expired" ? (
            <Button type="button" variant="destructive" onClick={() => setConfirmDeactivate(true)}>
              Deactivate
            </Button>
          ) : null}
          {code.deactivated ? (
            <Button type="button" onClick={() => setConfirmReactivate(true)}>
              Reactivate
            </Button>
          ) : null}
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-caption">
            <Row label="Type" value={DISCOUNT_TYPE_LABEL[code.discountType]} />
            <Row
              label="Value"
              value={
                code.discountType === "free"
                  ? "Free Access"
                  : code.discountType === "percentage"
                    ? `${code.value}%`
                    : formatUsd(code.value ?? 0)
              }
            />
            <div className="flex items-center justify-between gap-4 py-1">
              <span className="text-muted-foreground">Applies To</span>
              <div className="flex gap-1">
                {code.appliesTo.map((t) => (
                  <Badge key={t} variant="secondary">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
            <Row
              label="Usage Limit"
              value={
                code.usageLimit === "unlimited"
                  ? "Unlimited"
                  : code.usageLimit === "one_time"
                    ? "One-time"
                    : `Max ${code.maxRedemptions} (${code.redemptions.length} used)`
              }
            />
            <Row label="Validity" value={`${code.startDate} → ${code.expiryDate}`} />
            <Row label="Status" value={DISCOUNT_STATUS_LABEL[status]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Redemption Log</CardTitle>
            <CardDescription>{code.redemptions.length} redemptions</CardDescription>
          </CardHeader>
          <CardContent>
            {code.redemptions.length === 0 ? (
              <p className="py-6 text-center text-caption text-muted-foreground">
                No redemptions yet.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {code.redemptions.map((r) => (
                  <li key={r.id} className="flex justify-between gap-4 py-2 text-caption">
                    <span>{r.organizationOrUser}</span>
                    <span className="text-muted-foreground">
                      {new Date(r.dateRedeemed).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirmDeactivate} onOpenChange={setConfirmDeactivate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate discount code?</DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate this discount code?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmDeactivate(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                deactivate(code.id);
                setConfirmDeactivate(false);
                toast.success("Discount code deactivated.");
              }}
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmReactivate} onOpenChange={setConfirmReactivate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reactivate discount code?</DialogTitle>
            <DialogDescription>
              {blockReason === "expiry"
                ? "This code’s expiry date has passed. Please extend the expiry date to reactivate."
                : blockReason === "max"
                  ? "This code has reached its redemption limit. Please increase the limit to reactivate."
                  : blockReason === "both"
                    ? "Extend the expiry date and increase the redemption limit to reactivate."
                    : "Are you sure you want to reactivate this discount code?"}
            </DialogDescription>
          </DialogHeader>
          {(blockReason === "expiry" || blockReason === "both") && (
            <div className="space-y-2">
              <Label>New Expiry Date</Label>
              <Input
                type="date"
                value={extendExpiry}
                onChange={(e) => setExtendExpiry(e.target.value)}
              />
            </div>
          )}
          {(blockReason === "max" || blockReason === "both") && (
            <div className="space-y-2">
              <Label>New Max Redemptions</Label>
              <Input
                type="number"
                min={code.redemptions.length + 1}
                value={extendMax}
                onChange={(e) => setExtendMax(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmReactivate(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (blockReason && (extendExpiry || extendMax)) {
                  if (extendExpiry || extendMax) {
                    upsert({
                      ...code,
                      expiryDate: extendExpiry || code.expiryDate,
                      maxRedemptions: extendMax ? Number(extendMax) : code.maxRedemptions,
                      deactivated: false,
                    });
                    // Still need validity — try reactivate path
                    const result = reactivate(code.id, {
                      expiryDate: extendExpiry || undefined,
                      maxRedemptions: extendMax ? Number(extendMax) : undefined,
                    });
                    if (result.ok) {
                      setConfirmReactivate(false);
                      setBlockReason(null);
                      toast.success("Discount code reactivated.");
                    } else {
                      toast.error("Still unable to reactivate. Check dates and limits.");
                    }
                    return;
                  }
                }
                tryReactivate();
              }}
            >
              Reactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PaymentsShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
