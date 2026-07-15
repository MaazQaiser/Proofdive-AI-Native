"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/Button";
import { Logo } from "@/components/ui/logo";
import { StorageKeys } from "@/lib/proofdiveStorageKeys";
import { writeJson } from "@/lib/storage";

const card =
  "flex cursor-pointer items-start gap-3 rounded-[18px] border border-black/[0.12] bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition hover:bg-black/[0.015]";

const checkbox = "mt-0.5 h-4 w-4 shrink-0 rounded border-black/25 accent-black";

export default function ConsentPage() {
  const router = useRouter();
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const canContinue = termsChecked && privacyChecked;

  function handleAccept() {
    if (!canContinue) return;
    writeJson(StorageKeys.termsConsent, true);
    router.push("/onboarding");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[540px] flex-col justify-center px-6 py-12 sm:px-8">
      <Logo size="xs" />
      <h1 className="mt-6 text-2xl font-bold tracking-tight text-black">
        Before we get started
      </h1>
      <p className="mt-2 text-base font-medium leading-snug text-[var(--app-muted)]">
        Please review and accept these before we collect any information about you.
      </p>

      <div className="mt-8 space-y-3">
        <label className={card}>
          <input
            type="checkbox"
            checked={termsChecked}
            onChange={(e) => setTermsChecked(e.target.checked)}
            className={checkbox}
          />
          <span>
            <span className="block text-sm font-bold text-black">Terms of Service</span>
            <span className="mt-1 block text-sm text-black/60">
              I&apos;ve read and agree to the{" "}
              <Link
                href="/terms"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-black underline-offset-2 hover:underline"
              >
                Terms of Service
              </Link>
              .
            </span>
          </span>
        </label>

        <label className={card}>
          <input
            type="checkbox"
            checked={privacyChecked}
            onChange={(e) => setPrivacyChecked(e.target.checked)}
            className={checkbox}
          />
          <span>
            <span className="block text-sm font-bold text-black">Privacy Policy</span>
            <span className="mt-1 block text-sm text-black/60">
              I&apos;ve read and agree to the{" "}
              <Link
                href="/privacy"
                target="_blank"
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-black underline-offset-2 hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </span>
        </label>
      </div>

      <Button
        type="button"
        disabled={!canContinue}
        onClick={handleAccept}
        className="mt-8 !h-11 !w-full !rounded-md !px-4"
      >
        Accept &amp; continue
      </Button>
    </main>
  );
}
