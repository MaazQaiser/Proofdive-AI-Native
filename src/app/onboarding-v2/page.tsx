import { Suspense } from "react";

import { OnboardingAgent } from "@/app/onboarding-v2/ui/OnboardingAgent";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full" aria-hidden />}>
      <OnboardingAgent />
    </Suspense>
  );
}

