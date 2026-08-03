"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DISCOUNT_TYPE_LABEL,
  formatUsd,
  generateDiscountCodeString,
  isValidPrice,
  type ClientType,
  type DiscountCode,
  type DiscountType,
  type DiscountUsageLimit,
} from "@/lib/superAdminPaymentsData";
import { useDiscountCodes } from "@/lib/useDiscountCodes";

import { PaymentsShell } from "./PaymentsShell";

export function DiscountGenerateScreen() {
  const router = useRouter();
  const { upsert, codeTaken } = useDiscountCodes();

  const [code, setCode] = useState(() => generateDiscountCodeString());
  const [discountType, setDiscountType] = useState<DiscountType | undefined>(undefined);
  const [percentage, setPercentage] = useState("");
  const [fixedAmount, setFixedAmount] = useState("");
  const [appliesTo, setAppliesTo] = useState<ClientType[]>([]);
  const [usageLimit, setUsageLimit] = useState<DiscountUsageLimit>("unlimited");
  const [maxRedemptions, setMaxRedemptions] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().slice(0, 10);
  });
  const [step, setStep] = useState<"form" | "preview">("form");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function toggleApplies(type: ClientType, checked: boolean) {
    setAppliesTo((prev) =>
      checked ? [...new Set([...prev, type])] : prev.filter((t) => t !== type),
    );
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!code.trim()) next.code = "Code is required.";
    else if (codeTaken(code)) next.code = "This code already exists. Please choose a different code.";
    if (!discountType) next.discountType = "Please select a discount type.";
    if (discountType === "percentage") {
      const n = Number(percentage);
      if (!Number.isInteger(n) || n < 1 || n > 100) {
        next.percentage = "Please enter a valid percentage between 1 and 100.";
      }
    }
    if (discountType === "fixed") {
      if (!isValidPrice(Number(fixedAmount))) next.fixed = "Please enter a valid amount.";
    }
    if (appliesTo.length === 0) next.appliesTo = "Please select at least one client type.";
    if (usageLimit === "max") {
      const n = Number(maxRedemptions);
      if (!Number.isInteger(n) || n < 1) {
        next.max = "Please enter a valid redemption limit (minimum 1).";
      }
    }
    if (!startDate || !expiryDate) next.dates = "Start and expiry dates are required.";
    else if (expiryDate <= startDate) {
      next.expiry = "Expiry date must be later than the start date.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goPreview() {
    if (!validate()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }
    setStep("preview");
  }

  function generate() {
    if (!discountType) return;
    const record: DiscountCode = {
      id: `dc_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      code: code.trim().toUpperCase(),
      discountType,
      value:
        discountType === "percentage"
          ? Number(percentage)
          : discountType === "fixed"
            ? Number(fixedAmount)
            : null,
      appliesTo,
      usageLimit,
      maxRedemptions: usageLimit === "max" ? Number(maxRedemptions) : null,
      startDate,
      expiryDate,
      deactivated: false,
      createdAt: new Date().toISOString(),
      redemptions: [],
    };
    upsert(record);
    toast.success(`Code ${record.code} generated.`);
    router.push(`/superadmin/payments/discounts/${record.id}`);
  }

  if (step === "preview") {
    return (
      <PaymentsShell
        title="Preview discount code"
        actions={
          <Button type="button" variant="outline" onClick={() => setStep("form")}>
            Back
          </Button>
        }
      >
        <Card className="mx-auto w-full max-w-[800px]">
          <CardHeader>
            <CardTitle>{code.toUpperCase()}</CardTitle>
            <CardDescription>
              {discountType ? DISCOUNT_TYPE_LABEL[discountType] : ""} · Applies to{" "}
              {appliesTo.join(", ")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-caption text-muted-foreground">
            <p>
              Value:{" "}
              {discountType === "free"
                ? "Free Access (one cycle)"
                : discountType === "percentage"
                  ? `${percentage}%`
                  : formatUsd(Number(fixedAmount))}
            </p>
            <p>
              Usage:{" "}
              {usageLimit === "unlimited"
                ? "Unlimited"
                : usageLimit === "one_time"
                  ? "One-time use"
                  : `Max ${maxRedemptions} redemptions`}
            </p>
            <p>
              Validity: {startDate} → {expiryDate}
            </p>
            <Button className="mt-4" type="button" onClick={generate}>
              Generate Code
            </Button>
          </CardContent>
        </Card>
      </PaymentsShell>
    );
  }

  return (
    <PaymentsShell
      title="Generate Discount Code"
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/superadmin/payments/discounts")}
          >
            Cancel
          </Button>
          <Button type="button" onClick={goPreview}>
            Continue to preview
          </Button>
        </>
      }
    >
      <Card className="mx-auto w-full max-w-[800px]">
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="dc-code">Code</Label>
            <div className="flex gap-2">
              <Input
                id="dc-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                aria-invalid={Boolean(errors.code)}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => setCode(generateDiscountCodeString())}
              >
                Regenerate
              </Button>
            </div>
            {errors.code ? <p className="text-caption text-destructive">{errors.code}</p> : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Discount Type</Label>
            <Select
              value={discountType}
              onValueChange={(v) => setDiscountType(v as DiscountType)}
            >
              <SelectTrigger className="w-full" aria-invalid={Boolean(errors.discountType)}>
                <SelectValue placeholder="Select Discount Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed">Fixed Amount</SelectItem>
                <SelectItem value="free">Free Access</SelectItem>
              </SelectContent>
            </Select>
            {errors.discountType ? (
              <p className="text-caption text-destructive">{errors.discountType}</p>
            ) : null}
          </div>

          {discountType === "percentage" ? (
            <div className="flex flex-col gap-1.5">
              <Label>Percentage (1–100)</Label>
              <Input
                type="number"
                min={1}
                max={100}
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
              />
              {errors.percentage ? (
                <p className="text-caption text-destructive">{errors.percentage}</p>
              ) : null}
            </div>
          ) : null}

          {discountType === "fixed" ? (
            <div className="flex flex-col gap-1.5">
              <Label>Fixed Amount</Label>
              <Input
                type="number"
                min={0.01}
                step={0.01}
                value={fixedAmount}
                onChange={(e) => setFixedAmount(e.target.value)}
              />
              {errors.fixed ? <p className="text-caption text-destructive">{errors.fixed}</p> : null}
            </div>
          ) : null}

          {discountType === "free" || !discountType ? <div className="hidden sm:block" /> : null}

          <div className="flex flex-col gap-1.5">
            <Label>Applies To</Label>
            <div className="flex min-h-9 items-center gap-4">
              {(["B2C", "B2B"] as ClientType[]).map((t) => (
                <label key={t} className="flex items-center gap-2 text-caption">
                  <Checkbox
                    checked={appliesTo.includes(t)}
                    onCheckedChange={(c) => toggleApplies(t, Boolean(c))}
                  />
                  {t}
                </label>
              ))}
            </div>
            {errors.appliesTo ? (
              <p className="text-caption text-destructive">{errors.appliesTo}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Usage Limit</Label>
            <Select
              value={usageLimit}
              onValueChange={(v) => setUsageLimit(v as DiscountUsageLimit)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unlimited">Unlimited</SelectItem>
                <SelectItem value="max">Max Redemptions</SelectItem>
                <SelectItem value="one_time">One-time Use</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {usageLimit === "max" ? (
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Max Redemptions Count</Label>
              <Input
                type="number"
                min={1}
                value={maxRedemptions}
                onChange={(e) => setMaxRedemptions(e.target.value)}
                className="sm:max-w-[calc(50%-0.5rem)]"
              />
              {errors.max ? <p className="text-caption text-destructive">{errors.max}</p> : null}
            </div>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="start">Start Date</Label>
            <Input
              id="start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input
              id="expiry"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              aria-invalid={Boolean(errors.expiry)}
            />
            {errors.expiry ? <p className="text-caption text-destructive">{errors.expiry}</p> : null}
          </div>
        </CardContent>
      </Card>
    </PaymentsShell>
  );
}
