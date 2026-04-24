import { Suspense } from "react";

import { InterviewScreen } from "@/app/interview/ui/InterviewScreen";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] w-full" aria-hidden />
      }
    >
      <InterviewScreen />
    </Suspense>
  );
}

