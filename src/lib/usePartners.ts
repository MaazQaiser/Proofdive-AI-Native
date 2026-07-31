"use client";

import { useCallback, useMemo } from "react";

import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  SUPER_ADMIN_PARTNERS,
  type Partner,
} from "@/lib/superAdminPartners";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export function usePartners() {
  const [partners, setPartners, hydrated] = useLocalStorageState<Partner[]>(
    StorageKeys.superAdminPartners,
    SUPER_ADMIN_PARTNERS,
  );

  const list = partners ?? SUPER_ADMIN_PARTNERS;

  const existingEmails = useMemo(
    () => list.map((p) => p.email.toLowerCase()),
    [list],
  );

  const existingReferralCodes = useMemo(
    () => list.map((p) => p.referralCode.toUpperCase()),
    [list],
  );

  const addPartner = useCallback(
    (partner: Partner) => {
      setPartners((prev) => [partner, ...(prev ?? [])]);
    },
    [setPartners],
  );

  const updatePartner = useCallback(
    (id: string, patch: Partial<Partner>) => {
      setPartners((prev) =>
        (prev ?? []).map((p) => (p.id === id ? { ...p, ...patch } : p)),
      );
    },
    [setPartners],
  );

  return {
    partners: list,
    existingEmails,
    existingReferralCodes,
    hydrated,
    addPartner,
    updatePartner,
    setPartners,
  };
}
