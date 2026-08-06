import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-[16px] py-6",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-cols-1 items-start gap-1.5 px-6 [.border-b]:pb-6",
        "@min-[36rem]/card-header:items-center @min-[36rem]/card-header:has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-h6 leading-none", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-caption", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-span-full justify-self-start",
        "@min-[36rem]/card-header:col-span-1 @min-[36rem]/card-header:col-start-2 @min-[36rem]/card-header:row-span-2 @min-[36rem]/card-header:row-start-1 @min-[36rem]/card-header:self-center @min-[36rem]/card-header:justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  );
}

/** Flat card-inside-card surface — for grouping content within a Card
 * without reaching for a shadow. Uses the muted `--surface` token so it
 * reads as a step down from `--card` on the base background. */
function CardNested({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-nested"
      className={cn("bg-surface rounded-[16px]", className)}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardNested,
};
