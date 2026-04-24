import { Suspense } from "react";

import { CoachHome } from "@/app/_client/CoachHome";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] w-full" aria-hidden />
      }
    >
      <CoachHome />
    </Suspense>
  );
}
