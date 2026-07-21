"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BASE_SUBSCRIPTION_MODULES,
  SEED_PAYMENT_METHODS,
  type BillingAddOnDeltas,
  type PaymentMethod,
} from "@/lib/orgAdminBillingData";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function PurchaseAddOnsCard() {
  const [moduleKey, setModuleKey] = useState(BASE_SUBSCRIPTION_MODULES[0].key);
  const [quantity, setQuantity] = useState("100");
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [, setDeltas] = useLocalStorageState<BillingAddOnDeltas>(StorageKeys.orgAdminBillingOverrides, {});
  const [methods] = useLocalStorageState<PaymentMethod[]>(StorageKeys.orgAdminPaymentMethods, SEED_PAYMENT_METHODS);

  const selectedModule = BASE_SUBSCRIPTION_MODULES.find((m) => m.key === moduleKey) ?? BASE_SUBSCRIPTION_MODULES[0];
  const qty = Number(quantity);
  const isQtyValid = quantity.trim() !== "" && Number.isInteger(qty) && qty > 0;
  const totalCents = isQtyValid ? qty * selectedModule.unitPriceCents : 0;
  const defaultCard = methods.find((m) => m.isDefault) ?? methods[0] ?? null;

  function handleRequestPurchase() {
    if (!isQtyValid) {
      setError("Please enter a valid quantity.");
      return;
    }
    setError(null);
    setConfirmOpen(true);
  }

  function handleConfirmPurchase() {
    setDeltas((prev) => ({ ...prev, [moduleKey]: (prev[moduleKey] ?? 0) + qty }));
    setConfirmOpen(false);
    toast.success(`${qty} additional ${selectedModule.label} credits added to your subscription.`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchase Module Add-Ons</CardTitle>
        <CardDescription>Purchase additional usage for core modules beyond your subscribed plan.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="addon-module">Select Module</Label>
            <Select value={moduleKey} onValueChange={setModuleKey}>
              <SelectTrigger id="addon-module" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BASE_SUBSCRIPTION_MODULES.map((m) => (
                  <SelectItem key={m.key} value={m.key}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="addon-quantity">Quantity Required</Label>
            <Input
              id="addon-quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setError(null);
              }}
              aria-invalid={!!error}
            />
            {error ? <p className="text-caption text-destructive">{error}</p> : null}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border p-4">
          <div>
            <p className="text-caption text-muted-foreground">Estimated Total</p>
            <p className="text-h6 tabular-nums text-foreground">{currencyFormatter.format(totalCents / 100)}</p>
          </div>
          <Button onClick={handleRequestPurchase} disabled={!defaultCard}>
            Purchase
          </Button>
        </div>
        {!defaultCard ? (
          <p className="text-caption text-muted-foreground">Add a payment method above before purchasing add-ons.</p>
        ) : null}
      </CardContent>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Purchase</DialogTitle>
            <DialogDescription>
              {defaultCard
                ? `Charge ${currencyFormatter.format(totalCents / 100)} to your ${defaultCard.brand} card ending in ${defaultCard.last4} for ${qty} additional ${selectedModule.label} credits?`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPurchase}>Confirm Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
