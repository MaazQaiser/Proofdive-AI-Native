"use client";

import { Ban, CheckCircle2, Pencil, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
        className="flex flex-col gap-0 overflow-hidden p-0"
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
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <p className="truncate text-h4 text-foreground">{bundle.name}</p>
                <BundleStatusPill status={bundle.status} />
              </div>
              {bundle.description ? (
                <div className="mt-3 flex min-w-0 flex-col gap-1">
                  <p className="text-overline text-muted-foreground">Description</p>
                  <p className="text-body-sm break-words font-normal text-text-primary">
                    {bundle.description}
                  </p>
                </div>
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
                <div className="flex flex-col gap-3">
                  {bundle.mockInterview.included ? (
                    <Card className="gap-0 py-0">
                      <CardContent className="px-4 py-3.5">
                        <p className="text-body-sm font-medium text-foreground">
                          Mock Interview × {bundle.mockInterview.quantity}
                        </p>
                        <p className="mt-1 text-caption text-muted-foreground">
                          {formatUsd(bundle.mockInterview.unitPrice)} each
                        </p>
                      </CardContent>
                    </Card>
                  ) : null}
                  {bundle.storyboard.included ? (
                    <Card className="gap-0 py-0">
                      <CardContent className="px-4 py-3.5">
                        <p className="text-body-sm font-medium text-foreground">
                          Storyboard × {bundle.storyboard.quantity}
                        </p>
                        <p className="mt-1 text-caption text-muted-foreground">
                          {formatUsd(bundle.storyboard.unitPrice)} each
                        </p>
                      </CardContent>
                    </Card>
                  ) : null}
                  {bundle.masterclass.included
                    ? bundle.masterclass.selections.map((sel) => {
                        const mc = getMasterclassById(sel.masterclassId);
                        return (
                          <Card key={sel.masterclassId} className="gap-0 py-0">
                            <CardContent className="px-4 py-3.5">
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-body-sm font-medium text-foreground">
                                  {mc?.name ?? sel.masterclassId}
                                </p>
                                <p className="shrink-0 text-body-sm font-medium text-foreground">
                                  {formatUsd(sel.price)}
                                </p>
                              </div>
                              {sel.selectedModuleIds.length > 0 ? (
                                <ul className="mt-3 flex flex-col divide-y divide-border border-t border-border">
                                  {sel.selectedModuleIds.map((id) => {
                                    const mod = mc?.modules.find((m) => m.id === id);
                                    return (
                                      <li
                                        key={id}
                                        className="py-2 text-caption text-muted-foreground first:pt-3 last:pb-0"
                                      >
                                        {mod?.name ?? id}
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : null}
                            </CardContent>
                          </Card>
                        );
                      })
                    : null}
                  {!bundle.mockInterview.included &&
                  !bundle.storyboard.included &&
                  !bundle.masterclass.included ? (
                    <p className="text-body-sm text-muted-foreground">No items included.</p>
                  ) : null}
                </div>
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
