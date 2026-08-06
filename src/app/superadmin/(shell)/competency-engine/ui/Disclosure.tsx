"use client";

import { ChevronDown, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type DisclosureTone = "driver" | "competency" | "level";

export function Disclosure({
  title,
  subtitle,
  defaultOpen = false,
  children,
  className,
  tone = "competency",
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  tone?: DisclosureTone;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      data-slot={tone === "competency" ? "card" : undefined}
      className={cn(
        "overflow-hidden",
        tone === "driver" && "rounded-lg border border-border bg-muted/40",
        tone === "competency" && "rounded-[16px] bg-card text-card-foreground",
        tone === "level" && "border-b border-border bg-transparent last:border-b-0",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-full cursor-pointer items-center justify-between gap-3 text-left transition",
          tone === "driver" && "px-4 py-3.5 hover:bg-muted/50",
          tone === "competency" &&
            "bg-[linear-gradient(270deg,rgba(255,255,255,0.2)_50.11%,rgba(14,154,181,0.1)_110.8%),linear-gradient(#fff,#fff)] px-4 py-3 hover:brightness-[0.99]",
          tone === "level" && "px-0 py-3",
        )}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="min-w-0 flex-1">
          {tone === "driver" ? (
            <div className="text-body font-semibold tracking-tight text-foreground">
              {title}
            </div>
          ) : tone === "competency" ? (
            <div className="text-body-sm font-semibold text-foreground">{title}</div>
          ) : (
            <div className="text-body-sm font-medium text-foreground">{title}</div>
          )}
          {subtitle ? (
            <div className="mt-0.5 text-caption text-muted-foreground">{subtitle}</div>
          ) : null}
        </div>
        <button
          type="button"
          className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
          aria-expanded={open}
          aria-label={open ? "Collapse" : "Expand"}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((v) => !v);
          }}
        >
          <ChevronDown
            className={cn("h-4 w-4 transition", open && "rotate-180")}
            aria-hidden
          />
        </button>
      </div>
      {open ? (
        <div
          className={cn(
            tone === "driver" && "border-t border-border bg-background/80 px-4 py-4",
            tone === "competency" && "border-t border-border px-4 py-4",
            tone === "level" && "pb-4 pt-1",
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

/** Small uppercase section label + body text for read-only detail hierarchy. */
export function FieldBlock({
  label,
  icon: Icon,
  children,
  className,
}: {
  label: string;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="text-overline inline-flex items-center gap-1.5 font-medium tracking-wide text-muted-foreground uppercase">
        {Icon ? <Icon className="size-3.5 shrink-0" aria-hidden /> : null}
        {label}
      </div>
      <div className="text-body-sm leading-relaxed whitespace-pre-wrap text-foreground">
        {children}
      </div>
    </div>
  );
}

/** Compact label row with optional leading icon — for form labels in the editor. */
export function IconLabel({
  htmlFor,
  icon: Icon,
  children,
}: {
  htmlFor?: string;
  icon?: LucideIcon;
  children: ReactNode;
}) {
  return (
    <Label htmlFor={htmlFor} className="inline-flex items-center gap-1.5">
      {Icon ? <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden /> : null}
      {children}
    </Label>
  );
}
