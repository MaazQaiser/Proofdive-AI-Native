"use client";

import Link from "next/link";
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
import { StatusPill, type StatusTone } from "@/components/ui/status-pill";
import {
  BILLING_CYCLE_LABEL,
  BUNDLE_STATUS_LABEL,
  formatUsd,
  getMasterclassById,
  type BundleStatus,
} from "@/lib/superAdminPaymentsData";
import { usePaymentBundles } from "@/lib/usePaymentBundles";
import { useGlobalRates } from "@/lib/usePaymentRates";

import { BundleFormScreen } from "./BundleFormScreen";
import { BundleSubscribersTable } from "./BundleSubscribersTable";
import { PaymentsShell } from "./PaymentsShell";

function BundleStatusPill({ status }: { status: BundleStatus }) {
  const tone: StatusTone =
    status === "active" ? "success" : status === "draft" ? "warning" : "neutral";
  return <StatusPill tone={tone}>{BUNDLE_STATUS_LABEL[status]}</StatusPill>;
}

export function BundleDetailScreen({
  bundleId,
  initialEditing = false,
}: {
  bundleId: string;
  initialEditing?: boolean;
}) {
  const router = useRouter();
  const { getById, deactivate, reactivate, hydrated } = usePaymentBundles();
  const { rates: globalRates } = useGlobalRates();
  const bundle = getById(bundleId);

  const [editing, setEditing] = useState(initialEditing);
  const [confirmDeactivate, setConfirmDeactivate] = useState(false);
  const [reactivateErrors, setReactivateErrors] = useState<string[] | null>(null);

  if (!hydrated) {
    return (
      <PaymentsShell title="Bundle">
        <p className="text-caption text-muted-foreground">Loading…</p>
      </PaymentsShell>
    );
  }

  if (!bundle) {
    return (
      <PaymentsShell title="Bundle not found">
        <Card>
          <CardContent className="py-10 text-center">
            <p className="text-caption text-muted-foreground">This bundle does not exist.</p>
            <Button className="mt-4" onClick={() => router.push("/superadmin/payments")}>
              Back to listing
            </Button>
          </CardContent>
        </Card>
      </PaymentsShell>
    );
  }

  if (editing) {
    return <BundleFormScreen mode="edit" bundleId={bundleId} />;
  }

  function handleReactivate() {
    if (!bundle) return;
    const result = reactivate(bundle.id, globalRates);
    if (!result.ok) {
      setReactivateErrors(result.errors);
      return;
    }
    toast.success("Bundle reactivated.");
  }

  return (
    <PaymentsShell
      title={bundle.name}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => router.push("/superadmin/payments")}>
            Back
          </Button>
          {bundle.status === "active" ? (
            <Button type="button" variant="destructive" onClick={() => setConfirmDeactivate(true)}>
              Deactivate
            </Button>
          ) : null}
          {bundle.status === "inactive" ? (
            <Button type="button" variant="outline" onClick={handleReactivate}>
              Reactivate
            </Button>
          ) : null}
          <Button type="button" onClick={() => setEditing(true)}>
            Edit Bundle
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              <Badge variant="secondary">{bundle.type}</Badge>{" "}
              <BundleStatusPill status={bundle.status} />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-caption">
            <section>
              <div className="font-medium text-foreground">Included items</div>
              <ul className="mt-2 space-y-2 text-muted-foreground">
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
                        <li key={sel.masterclassId}>
                          <div>
                            {mc?.name}: {formatUsd(sel.price)}
                          </div>
                          <ul className="mt-1 list-disc pl-5">
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
                  <li>No items included.</li>
                ) : null}
              </ul>
            </section>
            <section>
              <div className="font-medium text-foreground">Billing cycles</div>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {bundle.cycles.map((c) => (
                  <li key={c.cycle}>
                    {BILLING_CYCLE_LABEL[c.cycle]}: {formatUsd(c.price)}
                  </li>
                ))}
              </ul>
            </section>
          </CardContent>
        </Card>

        <Card className="flex min-h-[420px] flex-col overflow-hidden lg:col-span-2">
          <CardHeader className="shrink-0">
            <CardTitle>Subscribers</CardTitle>
            <CardDescription>{bundle.subscribers.length} total</CardDescription>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0 pb-4">
            <BundleSubscribersTable subscribers={bundle.subscribers} />
          </CardContent>
        </Card>
      </div>

      <Dialog open={confirmDeactivate} onOpenChange={setConfirmDeactivate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate bundle?</DialogTitle>
            <DialogDescription>
              Existing subscribers keep access until their current cycle ends. New purchases will be
              blocked.
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
                deactivate(bundle.id);
                setConfirmDeactivate(false);
                toast.success("Bundle deactivated.");
              }}
            >
              Deactivate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(reactivateErrors)} onOpenChange={(o) => !o && setReactivateErrors(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot reactivate</DialogTitle>
            <DialogDescription>Fix these issues, then try again:</DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-1 pl-5 text-caption">
            {reactivateErrors?.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
          <DialogFooter>
            <Button asChild>
              <Link href={`/superadmin/payments/bundles/${bundle.id}`} onClick={() => setEditing(true)}>
                Edit bundle
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PaymentsShell>
  );
}
