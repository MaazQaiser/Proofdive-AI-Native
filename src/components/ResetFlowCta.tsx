"use client";

import { usePathname, useRouter } from "next/navigation";

import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { readJson, removeKey } from "@/lib/storage";

const linkClassName =
  "text-overline text-gray-500 underline decoration-black/30 underline-offset-4 transition hover:text-gray-600";

/**
 * Testing scaffolding — one quiet fixed row, bottom-left, out of the product
 * UI: the "Reset flow" control plus, on the login screen only, the role
 * quick-logins (Super Admin / Org Admin / Partner). Grouped here so
 * demo/testing shortcuts never sit inside real product screens.
 */
export function ResetFlowCta() {
  const router = useRouter();
  const pathname = usePathname();
  const showRoleLinks = pathname === "/login";

  function reset() {
    removeKey(StorageKeys.roleProfile);
    removeKey(StorageKeys.experiences);
    removeKey(StorageKeys.trainingProgress);
    removeKey(StorageKeys.coachJourneyView);
    removeKey(StorageKeys.coachFinalReadinessReportId);
    removeKey(StorageKeys.storyboardDraft);
    removeKey(StorageKeys.storyboardFromCraft);
    removeKey(StorageKeys.storyboardCraftEditing);
    removeKey(StorageKeys.storyboardDives);
    removeKey(StorageKeys.reports);
    removeKey(StorageKeys.interviewSessionPrefs);
    removeKey(StorageKeys.candidateAccessedReportIds);
    removeKey(StorageKeys.candidatePostInterviewUpgradeNudgeSeen);
    removeKey(StorageKeys.orgAdminAccountActivated);
    removeKey(StorageKeys.partnerAccountActivated);

    // Hard reload guarantees a full remount so onboarding state re-reads the
    // now-cleared storage — a client-side push to the same route wouldn't.
    window.location.href = "/onboarding";
  }

  function goOrgAdminDemo() {
    if (readJson<boolean>(StorageKeys.orgAdminAccountActivated) === true) {
      router.push("/orgadmin/overview");
      return;
    }
    router.push("/orgadmin/accept-invite");
  }

  function goPartnerDemo() {
    if (readJson<boolean>(StorageKeys.partnerAccountActivated) === true) {
      router.push("/partner/overview");
      return;
    }
    router.push("/partner/accept-invite");
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-wrap items-center gap-x-4 gap-y-1 print:hidden">
      <button type="button" onClick={reset} className={linkClassName} aria-label="Reset flow">
        Reset flow
      </button>
      {showRoleLinks ? (
        <>
          <button
            type="button"
            onClick={() => router.push("/superadmin/overview")}
            className={linkClassName}
          >
            Super Admin login →
          </button>
          <button type="button" onClick={goOrgAdminDemo} className={linkClassName}>
            Organization Admin login →
          </button>
          <button type="button" onClick={goPartnerDemo} className={linkClassName}>
            Partner login →
          </button>
        </>
      ) : null}
    </div>
  );
}
