"use client";

import { useRouter } from "next/navigation";

import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { removeKey } from "@/lib/storage";

export function ResetFlowCta() {
  const router = useRouter();

  function reset() {
    removeKey(StorageKeys.roleProfile);
    removeKey(StorageKeys.experiences);
    removeKey(StorageKeys.trainingProgress);
    removeKey(StorageKeys.coachJourneyView);
    removeKey(StorageKeys.coachFinalReadinessReportId);
    removeKey(StorageKeys.storyboardDraft);
    removeKey(StorageKeys.storyboardFromCraft);

    router.push("/onboarding");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={reset}
      className="fixed bottom-4 left-4 z-50 text-xs font-semibold text-gray-500 underline decoration-black/30 underline-offset-4 transition hover:text-gray-600 print:hidden"
      aria-label="Reset flow"
    >
      Reset flow
    </button>
  );
}

