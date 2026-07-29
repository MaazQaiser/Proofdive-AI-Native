/** Lightweight markdown ↔ HTML helpers for the onboarding JD draft editor.
 * Supports headings (# / ##), paragraphs, `- ` lists, **bold**, and <u>underline</u>.
 * Also accepts legacy plain "Section:" headings from older mock drafts.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function unescapeHtml(s: string): string {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Inline: escape, then restore **bold** and <u>…</u> (or ++underline++). */
export function jdInlineToHtml(raw: string): string {
  const placeholders: string[] = [];
  const stash = (html: string) => {
    const i = placeholders.length;
    placeholders.push(html);
    return `\u0000${i}\u0000`;
  };

  let s = raw.replace(/<u>([\s\S]*?)<\/u>/gi, (_, inner: string) =>
    stash(`<u>${escapeHtml(inner)}</u>`),
  );
  s = s.replace(/\+\+([\s\S]+?)\+\+/g, (_, inner: string) =>
    stash(`<u>${escapeHtml(inner)}</u>`),
  );
  s = s.replace(/\*\*([\s\S]+?)\*\*/g, (_, inner: string) =>
    stash(`<strong>${escapeHtml(inner)}</strong>`),
  );
  s = escapeHtml(s);
  return s.replace(/\u0000(\d+)\u0000/g, (_, i: string) => placeholders[Number(i)] ?? "");
}

function inlineHtmlToMarkdown(html: string): string {
  let s = html;
  s = s.replace(/<strong>([\s\S]*?)<\/strong>/gi, (_, inner: string) => `**${inlineHtmlToMarkdown(inner)}**`);
  s = s.replace(/<b>([\s\S]*?)<\/b>/gi, (_, inner: string) => `**${inlineHtmlToMarkdown(inner)}**`);
  s = s.replace(/<u>([\s\S]*?)<\/u>/gi, (_, inner: string) => `<u>${inlineHtmlToMarkdown(inner)}</u>`);
  s = s.replace(/<em>([\s\S]*?)<\/em>/gi, "$1");
  s = s.replace(/<i>([\s\S]*?)<\/i>/gi, "$1");
  s = s.replace(/<br\s*\/?>/gi, "\n");
  s = s.replace(/<[^>]+>/g, "");
  return unescapeHtml(s);
}

function isSectionHeadingLine(line: string): boolean {
  const t = line.trim();
  if (!t.endsWith(":")) return false;
  if (t.length > 56) return false;
  if (/[.!?]/.test(t.slice(0, -1))) return false;
  return true;
}

/** Convert JD markdown (or legacy plain text) to HTML for view/edit. */
export function jdMarkdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const parts: string[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (!listItems.length) return;
    parts.push(`<ul>${listItems.join("")}</ul>`);
    listItems = [];
  };

  for (const line of lines) {
    if (/^\s*[-*]\s+/.test(line)) {
      const item = line.replace(/^\s*[-*]\s+/, "");
      listItems.push(`<li>${jdInlineToHtml(item)}</li>`);
      continue;
    }
    flushList();

    if (/^#\s+/.test(line)) {
      parts.push(`<h2>${jdInlineToHtml(line.replace(/^#\s+/, ""))}</h2>`);
      continue;
    }
    if (/^##\s+/.test(line)) {
      parts.push(`<h3>${jdInlineToHtml(line.replace(/^##\s+/, ""))}</h3>`);
      continue;
    }
    if (!line.trim()) continue;

    if (isSectionHeadingLine(line)) {
      parts.push(`<h3>${jdInlineToHtml(line.trim().replace(/:$/, ""))}</h3>`);
      continue;
    }

    parts.push(`<p>${jdInlineToHtml(line)}</p>`);
  }
  flushList();
  return parts.join("");
}

function blockToMarkdown(el: Element): string {
  const tag = el.tagName.toLowerCase();
  if (tag === "h1" || tag === "h2") {
    return `# ${inlineHtmlToMarkdown(el.innerHTML).trim()}`;
  }
  if (tag === "h3" || tag === "h4") {
    return `## ${inlineHtmlToMarkdown(el.innerHTML).trim()}`;
  }
  if (tag === "p" || tag === "div") {
    return inlineHtmlToMarkdown(el.innerHTML).trim();
  }
  if (tag === "ul" || tag === "ol") {
    return Array.from(el.children)
      .filter((c) => c.tagName.toLowerCase() === "li")
      .map((li) => `- ${inlineHtmlToMarkdown((li as HTMLElement).innerHTML).trim()}`)
      .join("\n");
  }
  if (tag === "li") {
    return `- ${inlineHtmlToMarkdown((el as HTMLElement).innerHTML).trim()}`;
  }
  if (tag === "br") return "";
  return inlineHtmlToMarkdown((el as HTMLElement).innerHTML || el.textContent || "").trim();
}

/** Serialize a contenteditable root back to JD markdown. */
export function jdHtmlRootToMarkdown(root: HTMLElement): string {
  const blocks: string[] = [];
  for (const child of Array.from(root.childNodes)) {
    if (child.nodeType === Node.TEXT_NODE) {
      const t = (child.textContent ?? "").trim();
      if (t) blocks.push(t);
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const md = blockToMarkdown(child as Element);
    if (md) blocks.push(md);
  }
  return blocks.join("\n\n").trim();
}
