import { Suspense } from "react";

import { ProfileScreen } from "@/app/profile/ui/ProfileScreen";

export default function Page() {
  return (
    <Suspense>
      <ProfileScreen />
    </Suspense>
  );
}
