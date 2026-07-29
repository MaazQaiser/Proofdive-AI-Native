"use client";

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

export function useOrgAdminSubscription() {
  return useLocalStorageState<OrgAdminSubscriptionState>(
    StorageKeys.orgAdminSubscription,
    defaultOrgAdminSubscription(),
  );
}

export function useCandidateSubscription() {
  return useLocalStorageState<CandidateSubscriptionState>(
    StorageKeys.candidateSubscription,
    defaultCandidateSubscription(),
  );
}

export function useCandidateEntitlements() {
  return useLocalStorageState<CandidateEntitlements>(
    StorageKeys.candidateEntitlements,
    defaultCandidateEntitlements(),
  );
}
