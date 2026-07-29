"use client";

import { useCallback } from "react";

import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  SEED_ADD_ON_RATES,
  SEED_GLOBAL_RATES,
  type RateMap,
} from "@/lib/superAdminPaymentsData";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export function useGlobalRates() {
  const [rates, setRates, hydrated] = useLocalStorageState<RateMap>(
    StorageKeys.superAdminGlobalRates,
    SEED_GLOBAL_RATES,
  );

  const saveRates = useCallback(
    (next: RateMap) => {
      setRates(next);
    },
    [setRates],
  );

  return { rates, setRates, saveRates, hydrated };
}

export function useAddOnRates() {
  const [rates, setRates, hydrated] = useLocalStorageState<RateMap>(
    StorageKeys.superAdminAddOnRates,
    SEED_ADD_ON_RATES,
  );

  const saveRates = useCallback(
    (next: RateMap) => {
      setRates(next);
    },
    [setRates],
  );

  return { rates, setRates, saveRates, hydrated };
}
