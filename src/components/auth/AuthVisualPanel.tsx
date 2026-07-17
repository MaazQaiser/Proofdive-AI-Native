const ASSET_BASE = "/brand/login-signup%20assets";

/** Natural width (px) the composition below was authored at — used as the
 * scale reference so it can shrink/grow to fill whatever width the flexible
 * left panel actually has, instead of clipping at a fixed size. */
const NATURAL_WIDTH = 1019;

/**
 * Left-hand decorative panel for the auth split-screen layout (Login/Signup).
 * Positions are pixel-exact against the Figma spec (1920w canvas); the banner
 * asset already excludes the portion that bleeds past the page's left edge.
 * The whole composition is scaled uniformly to the panel's actual width via
 * container query units, so it stays proportional at any window size instead
 * of overflowing/clipping once the panel is narrower than the design canvas.
 */
export function AuthVisualPanel() {
  return (
    <div
      className="relative hidden flex-1 overflow-hidden lg:block"
      style={{ containerType: "inline-size" }}
      aria-hidden
    >
      <div
        className="absolute top-0 left-0"
        style={{
          width: NATURAL_WIDTH,
          transformOrigin: "top left",
          transform: `scale(calc(100cqw / ${NATURAL_WIDTH}px))`,
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
