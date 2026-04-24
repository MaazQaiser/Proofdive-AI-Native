/** Exact UX copy for /training (coach-led flow). */

export function entryIntro(name: string) {
  const n = name.trim();
  return `Hey${n ? ` ${n}` : ""} — I'm your training agent. I'll help you get interview-ready.

Let's start with the basics, then you can go deeper once you're comfortable.`;
}

export const OPTION_INTERVIEW_ESSENTIALS_TITLE = "Interview Essentials";
export const OPTION_INTERVIEW_ESSENTIALS_DESC =
  "Build speed on estimation questions with a clear, repeatable approach.";

export const OPTION_COMPETENCY_PILLARS_TITLE = "Competency Pillars";
export const OPTION_COMPETENCY_PILLARS_DESC =
  "Work on each core skill and strengthen them one by one.";

export const COURSE_ENTRY_HEADING = "Here's what we'll cover in this course.";

export const CH1_VIDEO_INTRO = `Let's start with Chapter 1.

Start with a quick video to get the core idea.
Take your time with it—you'll need it for what's coming next.`;

export const CTA_PLAY_VIDEO = "Play video";

export const AFTER_VIDEO = `Alright—now let's work with what you just saw.

This next part will help you check how well it's sticking.
If anything feels unclear, you can always jump back to the video.`;

export const CTA_START_QUIZ = "Start quiz";

export const AFTER_QUIZ =
  "Nice—that's a good sign. You're starting to connect the dots.";

export const CASE_INTRO = `Let's take it a step further.

Try applying this in a real scenario and see how you approach it.`;

export const CTA_START_CASE = "Start case";

export const AFTER_CASE =
  "That's solid work. You're not just understanding it—you're using it.";

export const FINAL_ASSESSMENT = `You're almost there.

This is the final step for this chapter—complete this assessment to wrap it up.`;

export const CTA_START_ASSESSMENT = "Start assessment";

export function chapterComplete(name: string) {
  const n = name.trim();
  return `Good work${n ? `, ${n}` : ""}. You've wrapped up Chapter 1.

Want to keep going while it's fresh, or take a break?`;
}

export const CTA_CONTINUE_CH2 = "Continue to Chapter 2";
export const CTA_TAKE_A_BREAK = "Take a break";
