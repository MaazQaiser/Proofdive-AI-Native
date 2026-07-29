import type { HTMLAttributes } from "react";

import { cn } from "@/components/cn";

/** Report/section cards — solid white surface on `--background` (#F5F5F3).
 * Borderless to keep the canvas clutter-free. */
const glassCardClassName =
  "relative overflow-hidden rounded-[16px] bg-card text-card-foreground";

const glassCardSectionClassName =
  "relative overflow-x-clip overflow-y-visible rounded-[16px] bg-card text-card-foreground";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[16px] bg-[var(--app-surface)]",
        className,
      )}
      {...props}
    />
  );
}

export function GlassCard({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(glassCardClassName, className)} {...props} />
  );
}

export function GlassCardSection({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(glassCardSectionClassName, className)} {...props} />
  );
}

export function CardBody({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const hasAnyPaddingUtility =
    typeof className === "string" && /\b(p|px|py|pt|pr|pb|pl)-/.test(className);

  return <div className={cn(hasAnyPaddingUtility ? undefined : "p-6", className)} {...props} />;
}

/** Flat card-inside-card surface for the custom app Card system — a step
 * down from `--app-surface` (white) on the base background. Use to group
 * content inside a `Card` (e.g. a sub-section, a quoted block, a nested list). */
export function NestedCard({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[16px] bg-[var(--app-surface-nested)]",
        className,
      )}
      {...props}
    />
  );
}

