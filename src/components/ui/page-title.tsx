import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/** Canonical page heading for shell listing + breadcrumb titles. Change styles here to update every page title. */
export function PageTitle({ className, ...props }: ComponentProps<"h1">) {
  return <h1 className={cn("text-h5 font-medium text-text-primary", className)} {...props} />;
}
