const ASSET_BASE = "/brand/login-signup%20assets";

/** Natural width/height (px) the composition below was authored at — used as
 * the scale reference so it can shrink/grow to fill whatever space the
 * flexible left panel actually has, instead of clipping at a fixed size.
 * Height spans from the panel top to the bottom of the "lines" graphic
 * (524 + 596), which is where the source design's canvas bottom fell too. */
const NATURAL_WIDTH = 1019;
const NATURAL_HEIGHT = 1120;

/**
 * Left-hand decorative panel for the auth split-screen layout (Login/Signup).
 * Positions are pixel-exact against the Figma spec (1920w canvas); the banner
 * asset already excludes the portion that bleeds past the page's left edge.
 *
 * The whole composition scales as one rigid unit — never independently, or
 * the banner and the "lines" graphic can drift apart (leaving a gap) or
 * toward each other (overlapping) depending on panel proportions. The scale
 * factor is capped by both the panel's width AND height (like `object-fit:
 * contain`), so it never needs more vertical space than is actually
 * available, and the whole group is anchored to the panel's bottom so any
 * leftover space appears above it instead of below — matching how the
 * "lines" graphic's bottom edge sits flush with the canvas bottom in the
 * source design.
 */
export function AuthVisualPanel() {
  return (
    <div
      className="relative hidden flex-1 overflow-hidden lg:block"
      style={{ containerType: "size" }}
      aria-hidden
    >
      <div
        className="absolute bottom-0 left-0"
        style={{
          width: NATURAL_WIDTH,
          height: NATURAL_HEIGHT,
          transformOrigin: "bottom left",
          transform: `scale(min(calc(100cqw / ${NATURAL_WIDTH}px), calc(100cqh / ${NATURAL_HEIGHT}px)))`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${ASSET_BASE}/rectangle.svg`}
          alt=""
          className="absolute top-12 left-0 h-auto w-[1019px] max-w-none"
        />
        <p
          className="absolute top-[113px] left-[82px] w-[603px] text-[72px] leading-[1.25] text-black"
          style={{ fontFamily: "var(--font-gilroy)", fontWeight: 400 }}
        >
          Stories that sell,
          <br />
          grounded in proof.
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${ASSET_BASE}/lines.svg`}
          alt=""
          className="absolute top-[524px] left-4 h-auto w-[650px] max-w-none"
        />
      </div>
    </div>
  );
}
