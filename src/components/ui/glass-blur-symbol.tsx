import { cn } from "@/lib/utils";

type GlassBlurSymbolProps = {
  /** Brand mark path, e.g. `/brand/illustration-1.svg`. */
  src: string;
  /** `primary` → white blur on teal; `gray` → teal blur on frosted white. */
  variant?: "primary" | "gray";
  className?: string;
};

/** Large blurred corner symbol + left readability wash + film grain.
 * Shared by CardButton and training module CTAs. */
function GlassBlurSymbol({
  src,
  variant = "primary",
  className,
}: GlassBlurSymbolProps) {
  const isPrimary = variant === "primary";

  return (
    <>
      <div
        className={cn(
          "pointer-events-none absolute -right-20 top-[58%] size-[12rem] -translate-y-1/2 select-none sm:-right-24 sm:size-[14rem]",
          className,
        )}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          className={cn(
            "size-full object-contain [mask-image:linear-gradient(to_left,black_35%,transparent_92%)]",
            isPrimary
              ? "opacity-40 [filter:brightness(0)_invert(1)_blur(28px)]"
              : "opacity-40 [filter:brightness(0)_invert(42%)_sepia(55%)_saturate(650%)_hue-rotate(152deg)_blur(28px)]",
          )}
        />
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 z-[1] w-[72%]",
          isPrimary
            ? "bg-[linear-gradient(90deg,color-mix(in_srgb,var(--brand-100)_72%,transparent)_0%,color-mix(in_srgb,var(--brand-100)_28%,transparent)_55%,transparent_100%)]"
            : "bg-[linear-gradient(90deg,color-mix(in_srgb,white_78%,transparent)_0%,color-mix(in_srgb,white_35%,transparent)_55%,transparent_100%)]",
        )}
        aria-hidden
      />

      <div className="success-driver-noise absolute inset-0 z-[1]" aria-hidden />
    </>
  );
}

/** Shared glass surface classes for primary / gray module CTAs. */
function glassCardSurfaceClasses(variant: "primary" | "gray" = "primary") {
  return variant === "primary"
    ? [
        "bg-[linear-gradient(160deg,color-mix(in_srgb,var(--brand-100)_88%,white)_0%,color-mix(in_srgb,var(--brand-300)_92%,white)_100%)]",
        "shadow-[0_10px_24px_rgba(14,154,181,0.2),inset_0_1px_0_rgba(255,255,255,0.45)]",
        "hover:shadow-[0_14px_28px_rgba(14,154,181,0.26),inset_0_1px_0_rgba(255,255,255,0.5)]",
      ]
    : [
        "bg-[color-mix(in_srgb,var(--extended-cyan-green)_8%,white)]",
        "shadow-[0_8px_20px_rgba(14,154,181,0.08),inset_0_1px_0_rgba(255,255,255,0.72)]",
        "hover:bg-[color-mix(in_srgb,var(--extended-cyan-green)_12%,white)] hover:shadow-[0_12px_24px_rgba(14,154,181,0.12),inset_0_1px_0_rgba(255,255,255,0.8)]",
      ];
}

export { GlassBlurSymbol, glassCardSurfaceClasses };
