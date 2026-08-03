"use client";

import { useEffect } from "react";

import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  defaultCandidateEntitlements,
  defaultCandidateSubscription,
  defaultOrgAdminSubscription,
  type CandidateEntitlements,
  type CandidateSubscriptionState,
  type OrgAdminSubscriptionState,
} from "@/lib/superAdminPaymentsData";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

/** Demo: after cancel is requested, revert to Free after this delay. */
export const DEMO_CANCEL_REVERT_MS = 3000;

export function freeCandidateSubscription(): CandidateSubscriptionState {
  return {
    status: "free",
    bundleId: null,
    billingCycle: null,
    nextBillingDate: null,
    accessEndsAt: null,
  };
}

export function useOrgAdminSubscription() {
  return useLocalStorageState<OrgAdminSubscriptionState>(
    StorageKeys.orgAdminSubscription,
    defaultOrgAdminSubscription(),
  );
}

export function useCandidateSubscription() {
  const state = useLocalStorageState<CandidateSubscriptionState>(
    StorageKeys.candidateSubscription,
    defaultCandidateSubscription(),
  );
  const [subscription, setSubscription] = state;

  // Demo: pending cancellations revert to Free after a few seconds.
  useEffect(() => {
    if (subscription.status !== "pending_cancel") return;
    const id = window.setTimeout(() => {
      setSubscription(freeCandidateSubscription());
    }, DEMO_CANCEL_REVERT_MS);
    return () => window.clearTimeout(id);
  }, [subscription.status, setSubscription]);

  return state;
}

export function useCandidateEntitlements() {
  return useLocalStorageState<CandidateEntitlements>(
    StorageKeys.candidateEntitlements,
    defaultCandidateEntitlements(),
  );
}
