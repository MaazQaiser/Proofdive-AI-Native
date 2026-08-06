"use client";

import { Ban, CheckCircle2, Pencil, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DetailField, DetailGrid, DetailSection } from "@/components/ui/detail-field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusPill, type StatusTone } from "@/components/ui/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BILLING_CYCLE_LABEL,
  BUNDLE_STATUS_LABEL,
  formatUsd,
  getMasterclassById,
  ITEM_KIND_LABEL,
  type BundleStatus,
  type PaymentBundle,
} from "@/lib/superAdminPaymentsData";

function BundleStatusPill({ status }: { status: BundleStatus }) {
  const tone: StatusTone =
    status === "active" ? "success" : status === "draft" ? "warning" : "neutral";
  return <StatusPill tone={tone}>{BUNDLE_STATUS_LABEL[status]}</StatusPill>;
}

type Props = {
  bundle: PaymentBundle | null;
  onOpenChange: (open: boolean) => void;
  onRequestDeactivate: (bundle: PaymentBundle) => void;
  onRequestReactivate: (bundle: PaymentBundle) => void;
};

export function BundleDetailDrawer({
  bundle,
  onOpenChange,
  onRequestDeactivate,
  onRequestReactivate,
}: Props) {
  const router = useRouter();
  const [subscriberSearch, setSubscriberSearch] = useState("");

  useEffect(() => {
    setSubscriberSearch("");
  }, [bundle?.id]);

  const filteredSubscribers = useMemo(() => {
    if (!bundle) return [];
    const q = subscriberSearch.trim().toLowerCase();
    if (!q) return bundle.subscribers;
    return bundle.subscribers.filter(
      (s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q),
    );
  }, [bundle, subscriberSearch]);

  if (!bundle) {
    return (
      <Sheet open={false} onOpenChange={onOpenChange}>
        <SheetContent />
      </Sheet>
    );
  }

  return (
    <Sheet open={!!bundle} onOpenChange={onOpenChange}>
      <SheetContent
        showCloseButton={false}
        className="flex w-1/2 max-w-[50vw] flex-col gap-0 overflow-hidden p-0 sm:max-w-[50vw]"
      >
        <SheetHeader className="flex min-h-14 shrink-0 flex-row flex-wrap items-center justify-end gap-2 space-y-0 border-b border-border py-4 pl-6 pr-4">
          <SheetTitle className="sr-only">{bundle.name}</SheetTitle>
          {bundle.status === "active" ? (
            <Button size="sm" variant="destructive" onClick={() => onRequestDeactivate(bundle)}>
              <Ban className="h-3.5 w-3.5" />
              Deactivate
            </Button>
          ) : null}
          {bundle.status === "inactive" ? (
            <Button size="sm" onClick={() => onRequestReactivate(bundle)}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Reactivate
            </Button>
          ) : null}
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              router.push(`/superadmin/payments/bundles/${bundle.id}?edit=1`);
            }}
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Bundle
          </Button>
          <SheetClose asChild>
            <Button size="sm" variant="ghost" className="size-8 shrink-0 p-0!" aria-label="Close">
              <X className="h-4 w-4" />
            </Button>
          </SheetClose>
        </SheetHeader>

        <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col gap-0">
          <TabsList variant="underline" className="shrink-0 px-6">
            <TabsTrigger variant="underline" value="overview">
              Overview
            </TabsTrigger>
            <TabsTrigger variant="underline" value="subscribers">
              Subscribers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="mb-8 flex min-w-0 flex-col gap-1">
              <p className="text-overline text-muted-foreground">{bundle.type}</p>
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="truncate text-h4 text-foreground">{bundle.name}</p>
                <BundleStatusPill status={bundle.status} />
              </div>
              {bundle.description ? (
                <p className="mt-1 text-body-sm text-muted-foreground">{bundle.description}</p>
              ) : null}
            </div>

            <div className="flex flex-col gap-8">
              <DetailSection title="Bundle">
                <DetailGrid>
                  <DetailField label="Type" value={bundle.type} />
                  <DetailField label="Status" value={BUNDLE_STATUS_LABEL[bundle.status]} />
                  <DetailField
                    label="Created"
                    value={new Date(bundle.createdAt).toLocaleDateString()}
                  />
                  <DetailField
                    label="Last updated"
                    value={new Date(bundle.updatedAt).toLocaleDateString()}
                  />
                </DetailGrid>
              </DetailSection>

              <Separator />

              <DetailSection title="Included items">
                <ul className="flex flex-col gap-3 text-body-sm text-foreground">
                  {bundle.mockInterview.included ? (
                    <li>
                      Mock Interview × {bundle.mockInterview.quantity} @{" "}
                      {formatUsd(bundle.mockInterview.unitPrice)}
                    </li>
                  ) : null}
                  {bundle.storyboard.included ? (
                    <li>
                      Storyboard × {bundle.storyboard.quantity} @{" "}
                      {formatUsd(bundle.storyboard.unitPrice)}
                    </li>
                  ) : null}
                  {bundle.masterclass.included
                    ? bundle.masterclass.selections.map((sel) => {
                        const mc = getMasterclassById(sel.masterclassId);
                        return (
                          <li key={sel.masterclassId} className="flex flex-col gap-1">
                            <span>
                              {mc?.name}: {formatUsd(sel.price)}
                            </span>
                            <ul className="list-disc pl-5 text-caption text-muted-foreground">
                              {sel.selectedModuleIds.map((id) => {
                                const mod = mc?.modules.find((m) => m.id === id);
                                return <li key={id}>{mod?.name ?? id}</li>;
                              })}
                            </ul>
                          </li>
                        );
                      })
                    : null}
                  {!bundle.mockInterview.included &&
                  !bundle.storyboard.included &&
                  !bundle.masterclass.included ? (
                    <li className="text-muted-foreground">No items included.</li>
                  ) : null}
                </ul>
              </DetailSection>

              <Separator />

              <DetailSection title="Billing cycles">
                <DetailGrid>
                  {bundle.cycles.length === 0 ? (
                    <DetailField label="Cycles" value="None" muted />
                  ) : (
                    bundle.cycles.map((c) => (
                      <DetailField
                        key={c.cycle}
                        label={BILLING_CYCLE_LABEL[c.cycle]}
                        value={formatUsd(c.price)}
                      />
                    ))
                  )}
                </DetailGrid>
              </DetailSection>
            </div>
          </TabsContent>

          <TabsContent value="subscribers" className="mt-0 min-h-0 flex-1 overflow-y-auto px-6 py-5">
            <div className="mb-6 flex min-w-0 flex-col gap-1">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="truncate text-h4 text-foreground">Subscribers</p>
                <span className="text-caption text-muted-foreground">
                  {bundle.subscribers.length} total
                </span>
              </div>
            </div>

            <div className="relative mb-4">
              <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by name or email…"
                value={subscriberSearch}
                onChange={(e) => setSubscriberSearch(e.target.value)}
              />
            </div>

            {filteredSubscribers.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/30 px-3 py-6 text-center text-caption text-muted-foreground">
                {bundle.subscribers.length === 0
                  ? "No subscribers yet."
                  : "No matching subscribers found."}
              </p>
            ) : (
              <ul className="flex flex-col divide-y divide-border">
                {filteredSubscribers.map((sub) => (
                  <li key={sub.id} className="py-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-body-sm font-medium text-foreground">{sub.name}</p>
                        <p className="text-caption text-muted-foreground">{sub.email}</p>
                      </div>
                      <div className="text-right text-caption text-muted-foreground">
                        <p>{BILLING_CYCLE_LABEL[sub.billingCycle]}</p>
                        <p className="capitalize">{sub.status}</p>
                        <p>{new Date(sub.purchasedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {sub.addOns.length > 0 ? (
                      <ul className="mt-2 space-y-1 border-l-2 border-border pl-3 text-caption text-muted-foreground">
                        {sub.addOns.map((ao) => (
                          <li key={ao.id}>
                            {ITEM_KIND_LABEL[ao.item]}
                            {ao.quantity != null ? ` × ${ao.quantity}` : ""} ·{" "}
                            {formatUsd(ao.pricePaid)} ·{" "}
                            {new Date(ao.datePurchased).toLocaleDateString()}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
