import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Registers our custom `text-{style}` typography utilities (globals.css'
// @utility blocks) as their own font-size class group. Without this,
// tailwind-merge's default heuristics classify e.g. `text-h1` as a text-color
// utility (it doesn't recognize the suffix as a font-size keyword), which
// makes it silently collide with — and get dropped by — color utilities like
// `text-foreground` when both are passed to the same cn() call.
const customTwMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6",
            "subheading",
            "body-lg",
            "body",
            "body-sm",
            "caption",
            "overline",
            "agent-heading",
            "agent-question",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
