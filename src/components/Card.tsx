import type { HTMLAttributes } from "react";

import { cn } from "@/components/cn";

const glassCardClassName =
  "relative overflow-hidden rounded-[24px] border border-white bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] backdrop-blur-[21px]";

const glassCardSectionClassName =
  "relative overflow-x-clip overflow-y-visible rounded-[24px] border border-white bg-[linear-gradient(90deg,rgba(255,255,255,0.24)_0%,rgba(255,255,255,0.6)_99.92%)] backdrop-blur-[21px]";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-[var(--app-hairline)] bg-[var(--app-surface)]",
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
 * down from `--app-surface` (white), separated by a hairline border instead
 * of a shadow. Use to group content inside a `Card` (e.g. a sub-section,
 * a quoted block, a nested list item). */
export function NestedCard({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-[var(--app-hairline)] bg-[var(--app-surface-nested)]",
        className,
      )}
      {...props}
    />
  );
}

