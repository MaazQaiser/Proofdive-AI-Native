import { cn } from "@/lib/utils";

const LOGO_SIZE_VAR = {
  xxl: "var(--logo-xxl)",
  xl: "var(--logo-xl)",
  lg: "var(--logo-lg)",
  md: "var(--logo-md)",
  sm: "var(--logo-sm)",
  xs: "var(--logo-xs)",
  xxs: "var(--logo-xxs)",
} as const;

type LogoSize = keyof typeof LOGO_SIZE_VAR;

/** Wordmark aspect ratio, from the asset's own viewBox (600 x 106). */
const LOGO_ASPECT = 600 / 106;

/**
 * ProofDive wordmark.
 *
 * Painted as a MASK over `currentColor` rather than served as an `<img>`:
 * the asset is a single flat fill (#062C35), which is invisible on a dark
 * page and cannot be recoloured through an img tag. As a mask it inherits
 * the surrounding text color, so it is correct in both themes with no second
 * asset, no filter hack, and no client-side theme check — which also means
 * it still works in a server component.
 *
 * Colour comes from `text-*` on the element (default: the brand ink token,
 * which is the light-mode asset colour and a light tint on dark).
 */
function Logo({
  size = "xs",
  className,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  size?: LogoSize;
}) {
  return (
    <span
      role="img"
      aria-label="ProofDive"
      data-slot="logo"
      className={cn("block shrink-0 text-logo-ink", className)}
      style={{
        height: LOGO_SIZE_VAR[size],
        aspectRatio: `${LOGO_ASPECT}`,
        backgroundColor: "currentColor",
        maskImage: "url(/brand/logo.svg)",
        WebkitMaskImage: "url(/brand/logo.svg)",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
        maskSize: "contain",
        WebkitMaskSize: "contain",
      }}
      {...props}
    />
  );
}

export { Logo, LOGO_SIZE_VAR };
export type { LogoSize };
