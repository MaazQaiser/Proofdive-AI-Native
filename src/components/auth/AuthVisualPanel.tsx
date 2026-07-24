const ASSET_BASE = "/brand";

/**
 * Left-hand decorative panel for the auth split-screen layout (Login/Signup).
 * Matches Figma's "leftpanel" (node 148:207 in the Login frame): it and the
 * form column are equal `flex-1` siblings — not a fixed-width form pinned to
 * the screen edge — so the whitespace on either side of the form stays
 * balanced at any viewport width. `max-w-[1027px]` mirrors Figma's cap so
 * this panel doesn't keep growing past its designed size on ultrawide
 * screens (see the form column's matching `min-w` in login/signup pages).
 *
 * Per the source frame's raw geometry (leftpanel 960×1120 @ 1920w): the
 * rectangle sits ~5% down from the top and the lines graphic sits flush
 * against the bottom, with the gap between them absorbing whatever vertical
 * space is left — `justify-between` on a full-height column reproduces that
 * without hard-coding a gap that would only be correct at one exact height.
 *
 * The headline ("Stories that sell, grounded in proof.") is baked into the
 * rectangle asset as a flattened export — there's no separate live text
 * layer in the source design.
 */
export function AuthVisualPanel() {
  return (
    <div
      className="relative hidden max-w-[1027px] flex-1 overflow-hidden lg:flex lg:flex-col"
      aria-hidden
    >
      <div className="flex flex-1 flex-col justify-between pt-[5%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${ASSET_BASE}/stories%20that%20sell%20rectangle.png`}
          alt=""
          className="h-auto w-[97%]"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${ASSET_BASE}/login%20lines.png`}
          alt=""
          className="ml-[4%] h-auto w-[63%]"
        />
      </div>
    </div>
  );
}
