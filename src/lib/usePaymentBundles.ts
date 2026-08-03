"use client";

import { useCallback, useEffect } from "react";

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

/** Append missing seed bundles and sync demo B2C item quantities from seed. */
export function mergeMissingSeedBundles(stored: PaymentBundle[]): PaymentBundle[] {
  const seedById = new Map(SEED_BUNDLES.map((seed) => [seed.id, seed]));
  const ids = new Set(stored.map((b) => b.id));
  let changed = false;

  const next = stored.map((bundle) => {
    const seed = seedById.get(bundle.id);
    if (!seed || seed.type !== "B2C") return bundle;
    if (
      bundle.mockInterview.quantity === seed.mockInterview.quantity &&
      bundle.mockInterview.included === seed.mockInterview.included &&
      bundle.storyboard.quantity === seed.storyboard.quantity &&
      bundle.storyboard.included === seed.storyboard.included &&
      bundle.masterclass.included === seed.masterclass.included
    ) {
      return bundle;
    }
    changed = true;
    return {
      ...bundle,
      mockInterview: { ...seed.mockInterview },
      storyboard: { ...seed.storyboard },
      masterclass: { ...seed.masterclass },
    };
  });

  const missing = SEED_BUNDLES.filter((seed) => !ids.has(seed.id));
  if (missing.length === 0 && !changed) return stored;
  return [...next, ...missing];
}

export function usePaymentBundles() {
  const [bundles, setBundles, hydrated] = useLocalStorageState<PaymentBundle[]>(
    StorageKeys.superAdminPaymentBundles,
    SEED_BUNDLES,
  );

  useEffect(() => {
    if (!hydrated) return;
    setBundles((prev) => {
      const next = mergeMissingSeedBundles(prev);
      return next === prev ? prev : next;
    });
  }, [hydrated, setBundles]);

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
