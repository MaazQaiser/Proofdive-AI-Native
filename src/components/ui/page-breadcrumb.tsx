import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { PageTitle } from "@/components/ui/page-title";
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
    <div className={cn("flex min-w-0 flex-wrap items-center gap-3", className)}>
      <Link
        href={parentHref}
        className="text-h5 font-medium text-primary transition-colors hover:underline"
      >
        {parentLabel}
      </Link>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden />
      <PageTitle className="min-w-0 truncate">{title}</PageTitle>
    </div>
  );
}
