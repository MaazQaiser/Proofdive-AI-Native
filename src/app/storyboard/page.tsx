import { Suspense } from "react";

import { StoryboardAgent } from "@/app/storyboard/ui/StoryboardAgent";

export default function Page() {
  return (
    <Suspense>
      <StoryboardAgent />
    </Suspense>
  );
}

