/** Place `proofdive-intro.mp4` in `public/onboarding/` or set `NEXT_PUBLIC_ONBOARDING_INTRO_VIDEO`. */
export const ONBOARDING_INTRO_VIDEO_SRC =
  process.env.NEXT_PUBLIC_ONBOARDING_INTRO_VIDEO?.trim() ||
  "/onboarding/proofdive-intro.mp4";
