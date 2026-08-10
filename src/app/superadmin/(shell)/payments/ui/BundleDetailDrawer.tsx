"use client";

import { Ban, CheckCircle2, SquarePen, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DetailField, DetailGrid, DetailSection } from "@/components/ui/detail-field";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { StatusPill, type StatusTone } from "@/components/ui/status-pill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BILLING_CYCLE_LABEL,
  BUNDLE_STATUS_LABEL,
  calculateBundleItemSubtotal,
  formatUsd,
  getMasterclassById,
  moduleShare,
  type BundleStatus,
  type PaymentBundle,
} from "@/lib/superAdminPaymentsData";

import { BundleSubscribersTable } from "./BundleSubscribersTable";

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
        <SheetHeader className="flex min-h-14 shrink-0 flex-row items-center justify-between gap-3 space-y-0 border-b border-border py-4 pl-6 pr-4">
          <SheetTitle className="min-w-0 flex-1 truncate text-left">{bundle.name}</SheetTitle>
          <div className="flex shrink-0 items-center gap-2">
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
              variant="ghost"
              onClick={() => {
                onOpenChange(false);
                router.push(`/superadmin/payments/bundles/${bundle.id}?edit=1`);
              }}
            >
              <SquarePen className="h-3.5 w-3.5" />
              Edit
            </Button>
            <SheetClose asChild>
              <Button size="sm" variant="ghost" className="size-8 shrink-0 p-0!" aria-label="Close">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
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

              <DetailSection
                title="Included items"
                end={
                  <p className="pr-4 text-right text-body-sm font-medium text-foreground tabular-nums">
                    Total {formatUsd(calculateBundleItemSubtotal(bundle))}
                  </p>
                }
              >
                <div className="flex flex-col gap-3">
                  {bundle.mockInterview.included ? (
                    <Card className="gap-0 py-0">
                      <CardContent className="px-4 py-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-body-sm font-medium text-foreground">Mock Interview</p>
                            <p className="mt-1 text-caption text-muted-foreground">
                              {formatUsd(bundle.mockInterview.unitPrice)} each
                            </p>
                          </div>
                          <p className="shrink-0 text-caption text-muted-foreground">
                            Qty: ×{bundle.mockInterview.quantity}
                          </p>
                          <p className="shrink-0 text-body-sm font-medium text-foreground tabular-nums">
                            {formatUsd(
                              bundle.mockInterview.quantity * bundle.mockInterview.unitPrice,
                            )}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                  {bundle.storyboard.included ? (
                    <Card className="gap-0 py-0">
                      <CardContent className="px-4 py-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-body-sm font-medium text-foreground">Storyboard</p>
                            <p className="mt-1 text-caption text-muted-foreground">
                              {formatUsd(bundle.storyboard.unitPrice)} each
                            </p>
                          </div>
                          <p className="shrink-0 text-caption text-muted-foreground">
                            Qty: ×{bundle.storyboard.quantity}
                          </p>
                          <p className="shrink-0 text-body-sm font-medium text-foreground tabular-nums">
                            {formatUsd(bundle.storyboard.quantity * bundle.storyboard.unitPrice)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                  {bundle.masterclass.included && bundle.masterclass.selections.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-body-sm font-semibold tracking-tight text-foreground">
                        Masterclass module(s) included
                      </h4>
                      {bundle.masterclass.selections.map((sel) => {
                        const mc = getMasterclassById(sel.masterclassId);
                        const modulePrice = moduleShare(sel.price, sel.selectedModuleIds.length);
                        return (
                          <Card key={sel.masterclassId} className="gap-0 py-0">
                            <CardContent className="px-4 py-3.5">
                              <div className="flex items-start justify-between gap-3">
                                <p className="min-w-0 flex-1 text-body-sm font-medium text-foreground">
                                  {mc?.name ?? sel.masterclassId}
                                </p>
                                <p className="shrink-0 text-body-sm font-medium text-foreground tabular-nums">
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
                                        className="flex items-center justify-between gap-3 py-2 first:pt-3 last:pb-0"
                                      >
                                        <span className="text-caption text-muted-foreground">
                                          {mod?.name ?? id}
                                        </span>
                                        <span className="shrink-0 text-caption font-medium text-foreground tabular-nums">
                                          {formatUsd(modulePrice)}
                                        </span>
                                      </li>
                                    );
                                  })}
                                </ul>
                              ) : null}
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : null}
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

          <TabsContent
            value="subscribers"
            className="mt-0 flex min-h-0 flex-1 flex-col overflow-hidden p-0"
          >
            <div className="flex shrink-0 flex-wrap items-center gap-2 px-6 pt-5 pb-2">
              <p className="truncate text-h4 text-foreground">Subscribers</p>
            </div>
            <BundleSubscribersTable subscribers={bundle.subscribers} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
