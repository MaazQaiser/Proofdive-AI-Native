"use client";

import { useEffect, useMemo, useState } from "react";

import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import type { StoryboardFromCraft } from "@/lib/proofdiveTypes";
import { readJson, writeJson } from "@/lib/storage";
import {
  createEmptyDiveStore,
  isDiveStore,
  migrateLegacyDraftStore,
  type StoryboardDiveStore,
  type StoryboardDraftStore,
} from "@/lib/storyboardDraft";

/**
 * Hydrates the Dive store from v2 storage, migrating legacy v1 draft + fromCraft once.
 */
export function useStoryboardDiveStore() {
  const [hydrated, setHydrated] = useState(false);
  const [store, setStore] = useState<StoryboardDiveStore>(() => createEmptyDiveStore());

  useEffect(() => {
    const existing = readJson<StoryboardDiveStore>(StorageKeys.storyboardDives);
    if (isDiveStore(existing)) {
      setStore(existing);
      setHydrated(true);
      return;
    }
    const legacy = readJson<StoryboardDraftStore>(StorageKeys.storyboardDraft);
    const fromCraft = readJson<StoryboardFromCraft>(StorageKeys.storyboardFromCraft);
    const migrated = migrateLegacyDraftStore(legacy, fromCraft?.role ?? null);
    writeJson(StorageKeys.storyboardDives, migrated);
    setStore(migrated);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeJson(StorageKeys.storyboardDives, store);
  }, [store, hydrated]);

  return useMemo(
    () =>
      [
        store,
        setStore,
        hydrated,
      ] as const,
    [store, hydrated],
  );
}
