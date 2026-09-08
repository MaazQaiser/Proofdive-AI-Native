import { Suspense } from "react";

import { CoachHomeV2 } from "@/app/_client/CoachHomeV2";

/** Review-only route: the redesigned Home, side by side with `/coach`.
 *  Linked from the bottom of the current Home so the two can be compared. */
export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] w-full" aria-hidden />}>
      <CoachHomeV2 />
    </Suspense>
  );
}
