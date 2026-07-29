"use client";

import { useCallback, useMemo } from "react";

import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  SUPER_ADMIN_ORGANIZATIONS,
  type Organization,
} from "@/lib/superAdminOrganizations";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export function useOrganizations() {
  const [organizations, setOrganizations, hydrated] = useLocalStorageState<
    Organization[]
  >(StorageKeys.superAdminOrganizations, SUPER_ADMIN_ORGANIZATIONS);

  const existingNames = useMemo(
    () => (organizations ?? []).map((o) => o.name),
    [organizations],
  );

  const addOrganization = useCallback(
    (organization: Organization) => {
      setOrganizations((prev) => [organization, ...(prev ?? [])]);
    },
    [setOrganizations],
  );

  const updateOrganization = useCallback(
    (id: string, patch: Partial<Organization>) => {
      setOrganizations((prev) =>
        (prev ?? []).map((o) => (o.id === id ? { ...o, ...patch } : o)),
      );
    },
    [setOrganizations],
  );

  return {
    organizations: organizations ?? SUPER_ADMIN_ORGANIZATIONS,
    existingNames,
    hydrated,
    addOrganization,
    updateOrganization,
    setOrganizations,
  };
}
