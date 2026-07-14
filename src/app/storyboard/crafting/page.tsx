import { Suspense } from "react";

import { CraftingScreen } from "@/app/storyboard/crafting/ui/CraftingScreen";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] w-full" aria-hidden />
      }
    >
      <CraftingScreen />
    </Suspense>
  );
}

