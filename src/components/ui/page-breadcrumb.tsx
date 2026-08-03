import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * Reusable page breadcrumb: parent link (brand primary, bold, title size)
 * → chevron → current page title.
 */
export function PageBreadcrumb({
  parentHref,
  parentLabel,
  title,
  className,
}: {
  parentHref: string;
  parentLabel: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <Link
        href={parentHref}
        className="text-h4 font-bold text-primary transition-colors hover:underline"
      >
        {parentLabel}
      </Link>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <h1 className="text-h4 text-text-primary">{title}</h1>
    </div>
  );
}
