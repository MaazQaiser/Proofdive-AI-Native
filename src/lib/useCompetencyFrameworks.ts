"use client";

import { useCallback, useMemo } from "react";

import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import {
  createDefaultCompetencyFramework,
  deepCloneFramework,
  ensureDefaultFramework,
  isFrameworkNameTaken,
  type CompetencyFrameworkSummary,
  type CompetencyFrameworkVersion,
  type FrameworkStatus,
  toFrameworkSummary,
} from "@/lib/superAdminCompetencyFrameworks";
import { useLocalStorageState } from "@/lib/useLocalStorageState";

export function useCompetencyFrameworks() {
  const [raw, setRaw, hydrated] = useLocalStorageState<CompetencyFrameworkVersion[]>(
    StorageKeys.superAdminCompetencyFrameworks,
    [createDefaultCompetencyFramework()],
  );

  const frameworks = useMemo(() => ensureDefaultFramework(raw ?? []), [raw]);

  const setFrameworks = useCallback(
    (
      updater:
        | CompetencyFrameworkVersion[]
        | ((prev: CompetencyFrameworkVersion[]) => CompetencyFrameworkVersion[]),
    ) => {
      setRaw((prev) => {
        const base = ensureDefaultFramework(prev ?? []);
        return typeof updater === "function" ? updater(base) : updater;
      });
    },
    [setRaw],
  );

  const summaries: CompetencyFrameworkSummary[] = useMemo(
    () => frameworks.map(toFrameworkSummary),
    [frameworks],
  );

  const getById = useCallback(
    (id: string) => frameworks.find((f) => f.id === id) ?? null,
    [frameworks],
  );

  const createCopy = useCallback(
    (sourceId: string, name: string): CompetencyFrameworkVersion | null => {
      const source = frameworks.find((f) => f.id === sourceId);
      if (!source) return null;
      if (isFrameworkNameTaken(frameworks, name)) return null;
      const copy = deepCloneFramework(source, name);
      setFrameworks((prev) => [copy, ...prev]);
      return copy;
    },
    [frameworks, setFrameworks],
  );

  const updateFramework = useCallback(
    (id: string, patch: Partial<CompetencyFrameworkVersion>) => {
      const now = new Date().toISOString();
      setFrameworks((prev) =>
        prev.map((f) =>
          f.id === id && !f.isDefault
            ? { ...f, ...patch, id: f.id, isDefault: false, updatedAt: now }
            : f,
        ),
      );
    },
    [setFrameworks],
  );

  const saveFrameworkContent = useCallback(
    (
      id: string,
      content: Pick<CompetencyFrameworkVersion, "name" | "competencies">,
      status: FrameworkStatus,
    ) => {
      const now = new Date().toISOString();
      setFrameworks((prev) =>
        prev.map((f) =>
          f.id === id && !f.isDefault
            ? {
                ...f,
                name: content.name.trim(),
                competencies: content.competencies,
                status,
                updatedAt: now,
              }
            : f,
        ),
      );
    },
    [setFrameworks],
  );

  const deleteFramework = useCallback(
    (id: string) => {
      setFrameworks((prev) => prev.filter((f) => f.id !== id || f.isDefault));
    },
    [setFrameworks],
  );

  return {
    frameworks,
    summaries,
    hydrated,
    getById,
    createCopy,
    updateFramework,
    saveFrameworkContent,
    deleteFramework,
    isNameTaken: (name: string, excludeId?: string) =>
      isFrameworkNameTaken(frameworks, name, excludeId),
  };
}
