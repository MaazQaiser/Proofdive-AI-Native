"use client";

import { CreditCard, MoreHorizontal, Plus } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SEED_PAYMENT_METHODS, type PaymentMethod } from "@/lib/orgAdminBillingData";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

type CardFormState = { name: string; number: string; expMonth: string; expYear: string };

const EMPTY_FORM: CardFormState = { name: "", number: "", expMonth: "", expYear: "" };

function detectBrand(digits: string): PaymentMethod["brand"] {
  if (digits.startsWith("4")) return "Visa";
  if (digits.startsWith("34") || digits.startsWith("37")) return "Amex";
  if (/^5[1-5]/.test(digits)) return "Mastercard";
  return "Visa";
}

export function PaymentMethodsCard() {
  const [methods, setMethods] = useLocalStorageState<PaymentMethod[]>(
    StorageKeys.orgAdminPaymentMethods,
    SEED_PAYMENT_METHODS,
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState<CardFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [removeTarget, setRemoveTarget] = useState<PaymentMethod | null>(null);

  function updateForm<K extends keyof CardFormState>(key: K, value: CardFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleAddCard() {
    const digits = form.number.replace(/\s+/g, "");
    const month = Number(form.expMonth);
    const year = Number(form.expYear);
    if (!/^\d{12,19}$/.test(digits) || !month || month < 1 || month > 12 || !year || !form.name.trim()) {
      setError("Please enter valid card details.");
      return;
    }

    const newMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      brand: detectBrand(digits),
      last4: digits.slice(-4),
      expMonth: month,
      expYear: year,
      isDefault: methods.length === 0,
    };
    setMethods((prev) => [...prev, newMethod]);
    setIsAddOpen(false);
    setForm(EMPTY_FORM);
    setError(null);
    toast.success("Payment method added successfully.");
  }

  function handleSetDefault(id: string) {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
    toast.success("Default payment method updated.");
  }

  function handleRemove() {
    if (!removeTarget) return;
    setMethods((prev) => {
      const next = prev.filter((m) => m.id !== removeTarget.id);
      if (removeTarget.isDefault && next.length > 0) next[0] = { ...next[0], isDefault: true };
      return next;
    });
    setRemoveTarget(null);
    toast.success("Payment method removed.");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Manage the cards used for your subscription and add-on purchases.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Card
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {methods.length === 0 ? (
          <p className="py-6 text-center text-caption text-muted-foreground">
            Unable to add payment method at the moment.
          </p>
        ) : (
          methods.map((m) => (
            <div key={m.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="text-body-sm text-foreground">
                  {m.brand} •••• {m.last4}
                </span>
                <span className="text-caption text-muted-foreground">
                  Expires {String(m.expMonth).padStart(2, "0")}/{m.expYear}
                </span>
                {m.isDefault && <Badge variant="secondary">Default</Badge>}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={`Actions for card ending ${m.last4}`}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!m.isDefault ? (
                    <DropdownMenuItem onClick={() => handleSetDefault(m.id)}>Set as Default</DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={() => setRemoveTarget(m)}>
                    Remove Card
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))
        )}
      </CardContent>

      <Dialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) {
            setForm(EMPTY_FORM);
            setError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              This is a demo form — no real card details are transmitted or stored anywhere.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="card-name">Name on Card</Label>
              <Input id="card-name" value={form.name} onChange={(e) => updateForm("name", e.target.value)} placeholder="Jane Doe" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input
                id="card-number"
                value={form.number}
                onChange={(e) => updateForm("number", e.target.value)}
                placeholder="4242 4242 4242 4242"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="card-exp-month">Expiry Month</Label>
                <Input id="card-exp-month" value={form.expMonth} onChange={(e) => updateForm("expMonth", e.target.value)} placeholder="MM" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="card-exp-year">Expiry Year</Label>
                <Input id="card-exp-year" value={form.expYear} onChange={(e) => updateForm("expYear", e.target.value)} placeholder="YYYY" />
              </div>
            </div>
            {error ? <p className="text-caption text-destructive">{error}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCard}>Add Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove payment method?</DialogTitle>
            <DialogDescription>
              {removeTarget
                ? `Remove the ${removeTarget.brand} card ending in ${removeTarget.last4}? This cannot be undone.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
