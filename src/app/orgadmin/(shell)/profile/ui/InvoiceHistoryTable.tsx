"use client";

import { Download, Receipt, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { INVOICE_STATUS_LABEL, SEED_INVOICES, type Invoice, type InvoiceStatus } from "@/lib/orgAdminBillingData";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { useLocalStorageState } from "@/lib/useLocalStorageState";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function InvoiceStatusPill({ status }: { status: InvoiceStatus }) {
  const tone =
    status === "paid"
      ? "border-scoring-green/20 bg-scoring-green/10 text-scoring-green"
      : status === "pending"
        ? "border-scoring-yellow/20 bg-scoring-yellow/10 text-scoring-yellow"
        : "border-scoring-red/20 bg-scoring-red/10 text-scoring-red";
  return (
    <span className={cn("text-overline inline-flex h-6 w-fit items-center rounded-full border px-2 whitespace-nowrap", tone)}>
      {INVOICE_STATUS_LABEL[status]}
    </span>
  );
}

function downloadInvoiceReceipt(invoice: Invoice) {
  const text = [
    "ProofDive — Payment Receipt",
    `Invoice Number: ${invoice.invoiceNumber}`,
    `Payment Date: ${invoice.paymentDate}`,
    `Amount: ${currencyFormatter.format(invoice.amountCents / 100)}`,
    `Status: ${INVOICE_STATUS_LABEL[invoice.status]}`,
  ].join("\n");
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${invoice.invoiceNumber}.txt`;
  link.click();
  URL.revokeObjectURL(url);
}

export function InvoiceHistoryTable() {
  const [invoices] = useLocalStorageState<Invoice[]>(StorageKeys.orgAdminInvoices, SEED_INVOICES);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      if (q && !inv.invoiceNumber.toLowerCase().includes(q)) return false;
      if (dateFrom && inv.paymentDate < dateFrom) return false;
      if (dateTo && inv.paymentDate > dateTo) return false;
      return true;
    });
  }, [invoices, search, dateFrom, dateTo]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice & Payment History</CardTitle>
        <CardDescription>View and download past invoices and payments.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Invoice Number"
              className="pl-9"
            />
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2 text-caption text-muted-foreground">
            <span>Date Range</span>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
            <span>to</span>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <Receipt className="h-8 w-8 text-muted-foreground" />
            <p className="text-body-sm font-medium text-foreground">
              {invoices.length === 0 ? "No invoices found for selected date range." : "No matching invoices found."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full caption-bottom text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-overline pl-4 text-muted-foreground">Invoice Number</TableHead>
                  <TableHead className="text-overline text-muted-foreground">Payment Date</TableHead>
                  <TableHead className="text-overline text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-overline text-muted-foreground">Status</TableHead>
                  <TableHead className="text-overline pr-4 text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="pl-4 font-medium text-foreground">{invoice.invoiceNumber}</TableCell>
                    <TableCell className="text-muted-foreground">{invoice.paymentDate}</TableCell>
                    <TableCell className="text-foreground">
                      {currencyFormatter.format(invoice.amountCents / 100)}
                    </TableCell>
                    <TableCell>
                      <InvoiceStatusPill status={invoice.status} />
                    </TableCell>
                    <TableCell className="pr-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => downloadInvoiceReceipt(invoice)}>
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
