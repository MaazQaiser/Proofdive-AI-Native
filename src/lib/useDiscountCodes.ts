"use client";

import { useCallback } from "react";

import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  isDiscountCodeTaken,
  resolveDiscountStatus,
  SEED_DISCOUNT_CODES,
  type DiscountCode,
} from "@/lib/superAdminPaymentsData";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export function useDiscountCodes() {
  const [codes, setCodes, hydrated] = useLocalStorageState<DiscountCode[]>(
    StorageKeys.superAdminDiscountCodes,
    SEED_DISCOUNT_CODES,
  );

  const getById = useCallback(
    (id: string) => codes.find((c) => c.id === id) ?? null,
    [codes],
  );

  const upsert = useCallback(
    (code: DiscountCode) => {
      setCodes((prev) => {
        const idx = prev.findIndex((c) => c.id === code.id);
        if (idx === -1) return [...prev, code];
        const next = [...prev];
        next[idx] = code;
        return next;
      });
    },
    [setCodes],
  );

  const deactivate = useCallback(
    (id: string) => {
      setCodes((prev) => prev.map((c) => (c.id === id ? { ...c, deactivated: true } : c)));
    },
    [setCodes],
  );

  const reactivate = useCallback(
    (
      id: string,
      patch?: Partial<Pick<DiscountCode, "expiryDate" | "maxRedemptions">>,
    ): { ok: true } | { ok: false; reason: "expiry" | "max" | "both" | "missing" } => {
      const code = codes.find((c) => c.id === id);
      if (!code) return { ok: false, reason: "missing" };

      const next: DiscountCode = {
        ...code,
        ...patch,
        deactivated: false,
      };

      const now = new Date();
      const expiryPassed = new Date(next.expiryDate) <= now;
      const maxReached =
        next.usageLimit === "max" &&
        next.maxRedemptions != null &&
        next.redemptions.length >= next.maxRedemptions;

      if (expiryPassed && maxReached) return { ok: false, reason: "both" };
      if (expiryPassed) return { ok: false, reason: "expiry" };
      if (maxReached) return { ok: false, reason: "max" };

      setCodes((prev) => prev.map((c) => (c.id === id ? next : c)));
      return { ok: true };
    },
    [codes, setCodes],
  );

  const codeTaken = useCallback(
    (code: string, excludeId?: string) => isDiscountCodeTaken(code, codes, excludeId),
    [codes],
  );

  const withStatus = codes.map((c) => ({ ...c, status: resolveDiscountStatus(c) }));

  return {
    codes,
    withStatus,
    setCodes,
    hydrated,
    getById,
    upsert,
    deactivate,
    reactivate,
    codeTaken,
  };
}
