"use client";

import { SubscriptionPlanChart } from "@/app/orgadmin/(shell)/overview/ui/SubscriptionPlanChart";
import { Badge } from "@/components/ui/badge";
import {
  applyAddOnDeltas,
  BASE_SUBSCRIPTION_MODULES,
  SUBSCRIPTION_PLAN_NAME,
  type BillingAddOnDeltas,
} from "@/lib/orgAdminBillingData";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

import { InvoiceHistoryTable } from "./InvoiceHistoryTable";
import { PaymentMethodsCard } from "./PaymentMethodsCard";
import { PurchaseAddOnsCard } from "./PurchaseAddOnsCard";

export function BillingSection() {
  const [deltas] = useLocalStorageState<BillingAddOnDeltas>(StorageKeys.orgAdminBillingOverrides, {});
  const modules = applyAddOnDeltas(BASE_SUBSCRIPTION_MODULES, deltas);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-end">
        <Badge variant="secondary">{SUBSCRIPTION_PLAN_NAME} Plan</Badge>
      </div>
      <SubscriptionPlanChart data={modules} />
      <PaymentMethodsCard />
      <PurchaseAddOnsCard />
      <InvoiceHistoryTable />
    </div>
  );
}
