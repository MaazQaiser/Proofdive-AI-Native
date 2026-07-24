/** Ambient teal/cyan glow — Figma "Background gradient" (node 4:513): a soft,
 * low-opacity blurred glow anchored to the bottom of the viewport. Rendered
 * from Figma's own flattened output (blur + opacity already baked in, and
 * its top edge already matches `--background` exactly) rather than
 * reconstructed from the source blur/rotation math, since that's the only
 * way to reproduce the exact soft falloff without approximating it. */
export function BackgroundGlow() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/onboarding-gradient.png"
      alt=""
      aria-hidden
      className="pointer-events-none fixed inset-x-0 bottom-0 h-auto w-full select-none"
    />
  );
}
