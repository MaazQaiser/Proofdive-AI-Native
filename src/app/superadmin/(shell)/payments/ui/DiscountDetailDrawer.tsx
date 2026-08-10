"use client";

import { Ban, CheckCircle2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DetailField, DetailGrid, DetailSection } from "@/components/ui/detail-field";
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
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusPill, type StatusTone } from "@/components/ui/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DISCOUNT_STATUS_LABEL,
  DISCOUNT_TYPE_LABEL,
  formatUsd,
  resolveDiscountStatus,
  type DiscountCode,
  type DiscountStatus,
} from "@/lib/superAdminPaymentsData";
import { useDiscountCodes } from "@/lib/useDiscountCodes";

import { DiscountRedemptionsTable } from "./DiscountRedemptionsTable";

function DiscountStatusPill({ status }: { status: DiscountStatus }) {
  const tone: StatusTone =
    status === "active"
      ? "success"
      : status === "scheduled"
        ? "warning"
        : status === "deactivated"
          ? "neutral"
          : "danger";
  return <StatusPill tone={tone}>{DISCOUNT_STATUS_LABEL[status]}</StatusPill>;
}

type Props = {
  code: DiscountCode | null;
  onOpenChange: (open: boolean) => void;
  onRequestDeactivate: (code: DiscountCode) => void;
};

export function DiscountDetailDrawer({ code, onOpenChange, onRequestDeactivate }: Props) {
  const { reactivate, upsert } = useDiscountCodes();
  const [confirmReactivate, setConfirmReactivate] = useState(false);
  const [extendExpiry, setExtendExpiry] = useState("");
  const [extendMax, setExtendMax] = useState("");
  const [blockReason, setBlockReason] = useState<"expiry" | "max" | "both" | null>(null);

  useEffect(() => {
    setConfirmReactivate(false);
    setExtendExpiry("");
    setExtendMax("");
    setBlockReason(null);
  }, [code?.id]);

  if (!code) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
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
    <>
      <Sheet open={!!code} onOpenChange={onOpenChange}>
        <SheetContent
          showCloseButton={false}
          className="flex flex-col gap-0 overflow-hidden p-0"
        >
          <SheetHeader className="flex min-h-14 shrink-0 flex-row items-center justify-between gap-3 space-y-0 border-b border-border py-4 pl-6 pr-4">
            <SheetTitle className="min-w-0 flex-1 truncate text-left">{code.code}</SheetTitle>
            <div className="flex shrink-0 items-center gap-2">
              {!code.deactivated && status !== "expired" ? (
                <Button size="sm" variant="destructive" onClick={() => onRequestDeactivate(code)}>
                  <Ban className="h-3.5 w-3.5" />
                  Deactivate
                </Button>
              ) : null}
              {code.deactivated ? (
                <Button size="sm" onClick={() => setConfirmReactivate(true)}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Reactivate
                </Button>
              ) : null}
              <SheetClose asChild>
                <Button size="sm" variant="ghost" className="size-8 shrink-0 p-0!" aria-label="Close">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetHeader>

          <Tabs defaultValue="details" className="flex min-h-0 flex-1 flex-col gap-0">
            <TabsList variant="underline" className="shrink-0 px-6">
              <TabsTrigger variant="underline" value="details">
                Details
              </TabsTrigger>
              <TabsTrigger variant="underline" value="redemptions">
                Redemptions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="mb-8 flex min-w-0 flex-col gap-1">
                <p className="text-overline text-muted-foreground">Discount code</p>
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <p className="truncate text-h4 text-foreground">{code.code}</p>
                  <DiscountStatusPill status={status} />
                </div>
              </div>

              <div className="flex flex-col gap-8">
                <DetailSection title="Configuration">
                  <DetailGrid>
                    <DetailField label="Type" value={DISCOUNT_TYPE_LABEL[code.discountType]} />
                    <DetailField
                      label="Value"
                      value={
                        code.discountType === "free"
                          ? "Free Access"
                          : code.discountType === "percentage"
                            ? `${code.value}%`
                            : formatUsd(code.value ?? 0)
                      }
                    />
                    <DetailField
                      label="Applies to"
                      value={
                        <div className="flex flex-wrap gap-1">
                          {code.appliesTo.map((t) => (
                            <Badge key={t} variant="secondary">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      }
                    />
                    <DetailField
                      label="Usage limit"
                      value={
                        code.usageLimit === "unlimited"
                          ? "Unlimited"
                          : code.usageLimit === "one_time"
                            ? "One-time"
                            : `Max ${code.maxRedemptions} (${code.redemptions.length} used)`
                      }
                    />
                    <DetailField label="Start date" value={code.startDate} />
                    <DetailField label="Expiry date" value={code.expiryDate} />
                    <DetailField
                      label="Created"
                      value={new Date(code.createdAt).toLocaleDateString()}
                    />
                    <DetailField label="Status" value={DISCOUNT_STATUS_LABEL[status]} />
                  </DetailGrid>
                </DetailSection>
              </div>
            </TabsContent>

            <TabsContent
              value="redemptions"
              className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden p-0"
            >
              <div className="flex shrink-0 flex-wrap items-center gap-2 px-6 pt-5 pb-2">
                <p className="truncate text-h4 text-foreground">Redemption log</p>
              </div>
              <DiscountRedemptionsTable redemptions={code.redemptions} />
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>

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
                placeholder="100"
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
                  upsert({
                    ...code,
                    expiryDate: extendExpiry || code.expiryDate,
                    maxRedemptions: extendMax ? Number(extendMax) : code.maxRedemptions,
                    deactivated: false,
                  });
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
                tryReactivate();
              }}
            >
              Reactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
