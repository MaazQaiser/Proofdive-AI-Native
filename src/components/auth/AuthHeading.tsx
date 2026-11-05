import type { ReactNode } from "react";

/**
 * The title block every auth page opens with, centred on the page's centre
 * line with the logo and the pane above it. Shared so the five pages cannot
 * drift apart. Only the heading is centred: labels and fields below stay
 * left-aligned, where they are read fastest.
 */
export function AuthHeading({
  icon,
  title,
  children,
}: {
  /** A tile above the title (forgot-password's "sent" check). */
  icon?: ReactNode;
  title: string;
  /** The subtitle. */
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {icon ? <div className="mb-4">{icon}</div> : null}
      <h1 className="font-gilroy text-[2rem] font-bold leading-tight tracking-[-0.03em] text-extended-green-blue [text-wrap:balance]">
        {title}
      </h1>
      {children ? <p className="text-body-sm text-muted-foreground">{children}</p> : null}
    </div>
  );
}
