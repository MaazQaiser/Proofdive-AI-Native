"use client";

import { Download, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { formatNumber } from "@/components/dashboard/format";
import { KpiCard, KpiRow } from "@/components/dashboard/KpiCard";
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
import { PageHeader } from "@/components/ui/page-header";
import { PageTitle } from "@/components/ui/page-title";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { PaymentMethod } from "@/lib/orgAdminBillingData";
import {
  SEED_PARTNER_COMMISSION_INVOICES,
  SEED_PARTNER_TOTAL_EARNINGS_CENTS,
  SEED_PARTNER_TOTAL_WITHDRAWN_CENTS,
  SEED_PARTNER_WITHDRAWALS,
  formatCents,
  type PartnerCommissionInvoice,
  type PartnerWithdrawal,
} from "@/lib/partnerMockData";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

import { PartnerPaymentMethodsCard, usePartnerPaymentMethods } from "../../profile/ui/PartnerPaymentMethodsCard";

type DateFilter = "monthly" | "all_time";

function paymentMethodLabel(m: PaymentMethod): string {
  return `${m.brand} •••• ${m.last4}`;
}

export function PartnerCommissionsScreen() {
  const [invoices] = useLocalStorageState<PartnerCommissionInvoice[]>(
    StorageKeys.partnerCommissionInvoices,
    SEED_PARTNER_COMMISSION_INVOICES,
  );
  const [withdrawals, setWithdrawals] = useLocalStorageState<PartnerWithdrawal[]>(
    StorageKeys.partnerWithdrawals,
    SEED_PARTNER_WITHDRAWALS,
  );
  const [totalWithdrawnCents, setTotalWithdrawnCents] = useLocalStorageState<number>(
    StorageKeys.partnerTotalWithdrawnCents,
    SEED_PARTNER_TOTAL_WITHDRAWN_CENTS,
  );
  const [methods, setMethods] = usePartnerPaymentMethods();

  const [dateFilter, setDateFilter] = useState<DateFilter>("monthly");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amountDollars, setAmountDollars] = useState("");
  const [selectedMethodId, setSelectedMethodId] = useState<string>("");
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const totalEarnings = SEED_PARTNER_TOTAL_EARNINGS_CENTS;
  const availableBalance = Math.max(0, totalEarnings - totalWithdrawnCents);
  const lastWithdrawalDate =
    withdrawals.length > 0
      ? [...withdrawals].sort((a, b) => b.requestDate.localeCompare(a.requestDate))[0].requestDate
      : null;

  const filteredInvoices = useMemo(() => {
    if (dateFilter === "all_time") return invoices;
    const currentMonth = "2026-07";
    return invoices.filter((inv) => inv.date.startsWith(currentMonth));
  }, [invoices, dateFilter]);

  function simulateDownload(label: string) {
    toast.success(`${label} download started.`);
  }

  function openWithdraw() {
    const defaultMethod = methods.find((m) => m.isDefault) ?? methods[0];
    setSelectedMethodId(defaultMethod?.id ?? "");
    setAmountDollars("");
    setWithdrawError(null);
    setWithdrawOpen(true);
  }

  function handleWithdraw() {
    const amount = Number(amountDollars);
    if (!amountDollars.trim() || Number.isNaN(amount) || amount <= 0) {
      setWithdrawError("Please enter an amount greater than zero.");
      return;
    }
    const amountCents = Math.round(amount * 100);
    if (amountCents > availableBalance) {
      setWithdrawError("Requested amount exceeds your available balance.");
      return;
    }
    const method = methods.find((m) => m.id === selectedMethodId);
    if (!method) {
      setWithdrawError("Please select or add a payment method to continue.");
      return;
    }

    const entry: PartnerWithdrawal = {
      id: `pwd_${Date.now()}`,
      requestDate: new Date().toISOString().slice(0, 10),
      amountCents,
      paymentMethodLabel: paymentMethodLabel(method),
    };
    setWithdrawals((prev) => [entry, ...prev]);
    setTotalWithdrawnCents((prev) => prev + amountCents);
    setWithdrawOpen(false);
    toast.success(`Withdrew ${formatCents(amountCents)} successfully.`);
  }

  return (
    <div className="-m-6 flex h-full flex-col overflow-hidden">
      <PageHeader>
        <PageTitle>Commissions &amp; Payouts</PageTitle>
        <Button onClick={openWithdraw} disabled={availableBalance <= 0}>
          <Wallet className="h-4 w-4" />
          Withdraw Funds
        </Button>
      </PageHeader>

      <div className="shrink-0 border-b border-border px-6">
        <KpiRow>
          <KpiCard label="Total Earnings" value={formatCents(totalEarnings)} />
          <KpiCard label="Available Balance" value={formatCents(availableBalance)} />
          <KpiCard label="Total Withdrawn" value={formatCents(totalWithdrawnCents)} />
          <KpiCard label="Last Withdrawal Date" value={lastWithdrawalDate ?? "Not available"} />
        </KpiRow>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-3">
          <div>
            <h2 className="text-body-sm font-medium text-foreground">Monthly Invoices</h2>
            <p className="text-caption text-muted-foreground">Commission invoices by billing period.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateFilter} onValueChange={(v) => setDateFilter(v as DateFilter)}>
              <SelectTrigger size="sm" variant="filter" active={dateFilter !== "all_time"}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="all_time">Lifetime</SelectItem>
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              disabled={filteredInvoices.length === 0}
              onClick={() => simulateDownload("Bulk invoices")}
            >
              <Download className="h-4 w-4" />
              Bulk Download
            </Button>
          </div>
        </div>

        {filteredInvoices.length === 0 ? (
          <p className="px-6 py-10 text-center text-caption text-muted-foreground">
            {invoices.length === 0
              ? "No commission or invoice history found."
              : "No matching periods found for the selected filters."}
          </p>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <TableHeader sticky>
              <TableRow>
                <TableHead className="text-overline pl-6 text-muted-foreground">Invoice #</TableHead>
                <TableHead className="text-overline text-muted-foreground">Date</TableHead>
                <TableHead className="text-overline text-muted-foreground">Amount</TableHead>
                <TableHead className="text-overline text-muted-foreground">Month/Period</TableHead>
                <TableHead className="text-overline pr-6 text-right text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="pl-6 font-medium text-foreground">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-caption text-muted-foreground">{inv.date}</TableCell>
                  <TableCell className="text-body-sm text-foreground">{formatCents(inv.amountCents)}</TableCell>
                  <TableCell className="text-caption text-muted-foreground">{inv.period}</TableCell>
                  <TableCell className="pr-6 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => simulateDownload(inv.invoiceNumber)}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </table>
        )}

        <div className="flex shrink-0 flex-col gap-0.5 border-y border-border px-6 py-3">
          <h2 className="text-body-sm font-medium text-foreground">Withdrawal History</h2>
          <p className="text-caption text-muted-foreground">Completed withdrawals submitted from this account.</p>
        </div>

        {withdrawals.length === 0 ? (
          <p className="px-6 py-10 text-center text-caption text-muted-foreground">No withdrawals found.</p>
        ) : (
          <table className="w-full caption-bottom text-sm">
            <TableHeader sticky>
              <TableRow>
                <TableHead className="text-overline pl-6 text-muted-foreground">Request Date</TableHead>
                <TableHead className="text-overline text-muted-foreground">Amount</TableHead>
                <TableHead className="text-overline pr-6 text-muted-foreground">Payment Method</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="pl-6 text-caption text-muted-foreground">{w.requestDate}</TableCell>
                  <TableCell className="text-body-sm text-foreground">{formatCents(w.amountCents)}</TableCell>
                  <TableCell className="pr-6 text-caption text-muted-foreground">{w.paymentMethodLabel}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </table>
        )}
      </div>

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Available balance: {formatCents(availableBalance)} ({formatNumber(availableBalance / 100)} USD).
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="withdraw-amount">Amount (USD)</Label>
              <Input
                id="withdraw-amount"
                type="number"
                min={0.01}
                step="0.01"
                value={amountDollars}
                onChange={(e) => {
                  setAmountDollars(e.target.value);
                  setWithdrawError(null);
                }}
                placeholder="100.00"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Payment Method</Label>
              {methods.length === 0 ? (
                <p className="text-caption text-muted-foreground">
                  No saved payment method. Add one below to continue.
                </p>
              ) : (
                <Select value={selectedMethodId} onValueChange={setSelectedMethodId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {methods.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {paymentMethodLabel(m)}
                        {m.isDefault ? " (Default)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <PartnerPaymentMethodsCard
              embedded
              methods={methods}
              onMethodsChange={setMethods}
            />
            {withdrawError ? <p className="text-caption text-destructive">{withdrawError}</p> : null}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setWithdrawOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleWithdraw}>Withdraw</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
