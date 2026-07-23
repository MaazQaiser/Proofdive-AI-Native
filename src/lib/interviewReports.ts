"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import type { InterviewReport } from "@/lib/proofdiveTypes";

export function safeParseReportsMap(raw: string | null): Record<string, InterviewReport> {
  try {
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, InterviewReport>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function readReportsMap(): Record<string, InterviewReport> {
  if (typeof window === "undefined") return {};
  return safeParseReportsMap(window.localStorage.getItem(StorageKeys.reports));
}

export function pickLatestReport(map: Record<string, InterviewReport>): InterviewReport | null {
  const list = Object.values(map);
  if (list.length === 0) return null;
  return [...list].sort(
    (a, b) => new Date(b.meta.createdAt).getTime() - new Date(a.meta.createdAt).getTime(),
  )[0] ?? null;
}

/** Single source of truth for "look up a report by id" — replaces ad-hoc `map[id]` reads. */
export function getReportById(id: string | null | undefined): InterviewReport | null {
  if (!id) return null;
  return readReportsMap()[id] ?? null;
}

export function latestReportOverallForRole(roleTitle: string): number | null {
  if (typeof window === "undefined" || !roleTitle.trim()) return null;
  const list = Object.values(readReportsMap()).filter(
    (r) => (r.meta?.roleTitle ?? "").trim() === roleTitle.trim(),
  );
  if (!list.length) return null;
  return (
    [...list].sort(
      (a, b) => new Date(b.meta.createdAt).getTime() - new Date(a.meta.createdAt).getTime(),
    )[0]?.overallScore ?? null
  );
}

export function useLatestInterviewReport(): InterviewReport | null {
  const pathname = usePathname();
  const [latest, setLatest] = useState<InterviewReport | null>(null);

  const refresh = useCallback(() => {
    if (typeof window === "undefined") return;
    setLatest(pickLatestReport(readReportsMap()));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, pathname]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === StorageKeys.reports || e.key === null) refresh();
    };
    const onVis = () => {
      if (document.visibilityState === "visible") refresh();
    };
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  return latest;
}
