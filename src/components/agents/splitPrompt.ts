export function splitPrompt(prompt: string): { heading: string; subtext: string } {
  const cleaned = prompt.trim();
  if (!cleaned) return { heading: "", subtext: "" };

  // Prefer author-controlled splits first.
  const byParagraph = cleaned
    .split(/\n{2,}/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (byParagraph.length >= 2) {
    return { heading: byParagraph[0] ?? "", subtext: byParagraph.slice(1).join("\n\n") };
  }

  // Common onboarding phrasing.
  const firstUpIdx = cleaned.toLowerCase().indexOf("first up:");
  if (firstUpIdx > 0) {
    return {
      heading: cleaned.slice(0, firstUpIdx).trim(),
      subtext: cleaned.slice(firstUpIdx).trim(),
    };
  }

  // Fallback: first sentence as heading.
  const sentenceMatch = cleaned.match(/^(.+?[.!?])\s+([\s\S]*)$/);
  if (sentenceMatch) {
    return { heading: sentenceMatch[1].trim(), subtext: sentenceMatch[2].trim() };
  }

  return { heading: cleaned, subtext: "" };
}

