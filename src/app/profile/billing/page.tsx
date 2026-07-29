import { Suspense } from "react";

import { CandidateBillingScreen } from "./ui/CandidateBillingScreen";

export default function CandidateBillingPage() {
  return (
    <Suspense>
      <CandidateBillingScreen />
    </Suspense>
  );
}
