"use client";

import { useCallback } from "react";

import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  duplicateBundle,
  isBundleNameTaken,
  SEED_BUNDLES,
  validateBundleForReactivation,
  type BundleStatus,
  type PaymentBundle,
  type RateMap,
} from "@/lib/superAdminPaymentsData";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export function usePaymentBundles() {
  const [bundles, setBundles, hydrated] = useLocalStorageState<PaymentBundle[]>(
    StorageKeys.superAdminPaymentBundles,
    SEED_BUNDLES,
  );

  const getById = useCallback(
    (id: string) => bundles.find((b) => b.id === id) ?? null,
    [bundles],
  );

  const upsert = useCallback(
    (bundle: PaymentBundle) => {
      setBundles((prev) => {
        const idx = prev.findIndex((b) => b.id === bundle.id);
        if (idx === -1) return [...prev, bundle];
        const next = [...prev];
        next[idx] = { ...bundle, updatedAt: new Date().toISOString() };
        return next;
      });
    },
    [setBundles],
  );

  const setStatus = useCallback(
    (id: string, status: BundleStatus) => {
      setBundles((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, status, updatedAt: new Date().toISOString() } : b,
        ),
      );
    },
    [setBundles],
  );

  const deactivate = useCallback(
    (id: string) => {
      setStatus(id, "inactive");
    },
    [setStatus],
  );

  const reactivate = useCallback(
    (id: string, globalRates: RateMap): { ok: true } | { ok: false; errors: string[] } => {
      const bundle = bundles.find((b) => b.id === id);
      if (!bundle) return { ok: false, errors: ["Bundle not found."] };
      const errors = validateBundleForReactivation(bundle, globalRates);
      if (errors.length > 0) return { ok: false, errors };
      setStatus(id, "active");
      return { ok: true };
    },
    [bundles, setStatus],
  );

  const duplicate = useCallback(
    (id: string): PaymentBundle | null => {
      const source = bundles.find((b) => b.id === id);
      if (!source) return null;
      const copy = duplicateBundle(source, bundles);
      setBundles((prev) => [...prev, copy]);
      return copy;
    },
    [bundles, setBundles],
  );

  const nameTaken = useCallback(
    (name: string, excludeId?: string) => isBundleNameTaken(name, bundles, excludeId),
    [bundles],
  );

  return {
    bundles,
    setBundles,
    hydrated,
    getById,
    upsert,
    deactivate,
    reactivate,
    duplicate,
    nameTaken,
  };
}
