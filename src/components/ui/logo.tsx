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

function Logo({
  size = "xs",
  className,
  ...props
}: Omit<React.ComponentProps<"img">, "src" | "alt" | "width" | "height"> & {
  size?: LogoSize;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/logo.svg"
      alt="ProofDive"
      data-slot="logo"
      className={cn("w-auto", className)}
      style={{ height: LOGO_SIZE_VAR[size] }}
      {...props}
    />
  );
}

export { Logo, LOGO_SIZE_VAR };
export type { LogoSize };
