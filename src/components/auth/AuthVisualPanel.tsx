/**
 * Left-hand branding panel for auth pages.
 * Headline sits 128px below the navbar, left-aligned with the ProofDive logo.
 */
export function AuthVisualPanel() {
  return (
    <div className="relative hidden flex-1 items-start overflow-hidden px-8 pt-[128px] sm:px-12 lg:flex">
      <h1 className="max-w-[580px] font-gilroy text-[clamp(2.5rem,4vw,3.5rem)] font-bold leading-[1.04] tracking-[-0.037em]">
        <span className="block text-[#033B4F]">Stories that sell,</span>
        <span className="block text-primary">grounded in proof.</span>
      </h1>
    </div>
  );
}
