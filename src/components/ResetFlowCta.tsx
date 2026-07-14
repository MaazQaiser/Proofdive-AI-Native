"use client";

import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { removeKey } from "@/lib/storage";

export function ResetFlowCta() {
  function reset() {
    removeKey(StorageKeys.roleProfile);
    removeKey(StorageKeys.experiences);
    removeKey(StorageKeys.trainingProgress);
    removeKey(StorageKeys.coachJourneyView);
    removeKey(StorageKeys.coachFinalReadinessReportId);
    removeKey(StorageKeys.storyboardDraft);
    removeKey(StorageKeys.storyboardFromCraft);

    // Hard reload guarantees a full remount so onboarding state re-reads the
    // now-cleared storage — a client-side push to the same route wouldn't.
    window.location.href = "/onboarding";
  }

  return (
    <button
      type="button"
      onClick={reset}
      className="fixed bottom-4 left-4 z-50 text-xs font-semibold text-gray-500 underline decoration-black/30 underline-offset-4 transition hover:text-gray-600"
      aria-label="Reset flow"
    >
      Reset flow
    </button>
  );
}

