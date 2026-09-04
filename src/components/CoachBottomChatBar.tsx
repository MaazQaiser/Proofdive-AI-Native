"use client";

import type { CSSProperties, ReactNode } from "react";
import { MessageCircleQuestion } from "lucide-react";

import { ChatComposer } from "@/components/chat/ChatComposer";
import { COACH_NAV_CONTENT_INSET_CLASS } from "@/components/coachNavLayout";
import { FaqAssistantThread } from "@/components/faq/FaqAssistantThread";
import { useFaqAssistant } from "@/components/faq/useFaqAssistant";
import { cn } from "@/lib/utils";

type Props = {
  placeholder?: string;
  onSend?: (text: string) => void;
  /**
   * `faq-redirect` (default): every free-text send opens Ask and nudges the user
   * to pick a hardcoded FAQ option.
   * `host`: free-text progresses the host flow (e.g. storyboard); Ask free-text
   * still redirects to the FAQ menu.
   */
  freeTextMode?: "faq-redirect" | "host";
  /** Disables the composer (e.g. when the flow offers on-screen actions instead). */
  disabled?: boolean;
  prefill?: string;
  prefillKey?: string;
  /** Hides the attachment control when nothing in this flow is actually uploadable. Defaults to hidden (post-onboarding). */
  showUploadButton?: boolean;
  /**
   * When set (e.g. storyboard's flush right rail), reserves that width from the
   * viewport edge so the composer centers in the main Q&A column.
   */
  rightPanelMaxWidth?: number;
  /**
   * One quiet guiding line above the composer — helper text for the answer
   * being typed, so guidance sits where the typing happens instead of in a
   * side rail. Hidden in Ask mode, which takes over the same space.
   */
  hint?: ReactNode;
};

export function CoachBottomChatBar({
  placeholder,
  onSend,
  freeTextMode = "faq-redirect",
  disabled,
  prefill,
  prefillKey,
  showUploadButton = false,
  rightPanelMaxWidth,
  hint,
}: Props = {}) {
  const faq = useFaqAssistant();

  function handleComposerSend(text: string) {
    if (faq.isFaqMode) {
      faq.handleFreeText(text);
      return;
    }
    if (freeTextMode === "host" && onSend) {
      onSend(text);
      return;
    }
    faq.handleFreeText(text);
  }

  const composer = (
    <ChatComposer
      key={prefillKey ?? "coach-bottom-chat-composer"}
      placeholder={faq.isFaqMode ? "I am here to help you!" : (placeholder ?? "Ask AI Assistant")}
      onSend={handleComposerSend}
      disabled={disabled}
      prefill={prefill}
      showUploadButton={faq.isFaqMode ? false : showUploadButton}
      modeToggle={{
        isActive: faq.isFaqMode,
        icon: MessageCircleQuestion,
        activeLabel: "AI Assistant",
        onToggle: () => (faq.isFaqMode ? faq.exitFaqMode() : faq.enterFaqMode()),
      }}
      thread={
        faq.isFaqMode ? (
          <FaqAssistantThread
            screenData={faq.screenData}
            onSelectRootItem={faq.selectRootItem}
            onSelectFollowup={faq.selectFollowup}
            onBackToItemMenu={faq.backToItemMenu}
            onBackToRootMenu={faq.backToRootMenu}
          />
        ) : undefined
      }
      onThreadClose={faq.isFaqMode ? faq.exitFaqMode : undefined}
      threadHeaderTitle="AI Assistant"
    />
  );

  /* Field-helper position: aligned to the composer's own text inset (pl-6 =
     the Chatbox's leading padding) so it reads as belonging to the input
     rather than floating over the page. Clamped so a narrow column can never
     let a helper line push the composer up the screen. */
  /* The bar's own ground. The bar is fixed and the column now scrolls a full
     transcript beneath it, so without a backdrop the hint line and whatever
     turn is passing under it overprint each other. A solid block would work
     but would hard-crop the passing content; the gradient fades it out over
     the top 1.75rem instead — the same move every chat app makes at its
     composer. `--app-ground` is the exact colour the canvas paints, so the
     solid region is indistinguishable from the page it covers. */
  const composerBlock = (
    <div className="pt-7 pb-4 [background:linear-gradient(to_bottom,transparent,var(--app-ground)_1.75rem)]">
      {hint && !faq.isFaqMode ? (
        <div data-slot="coach-chat-hint" className="pb-2 pl-6 pr-4">
          {/* The clamp sits inside the padding wrapper: on a -webkit-box,
              padding-bottom leaks a sliver of the clipped line.

              Ink is `--text-primary/75`, not `--text-secondary`: measured on
              the real ground this line sits on (`--app-ground`, which
              `.app-canvas` paints), `--text-secondary` #6B7280 on #F5F5F3 is
              4.43:1 at `text-caption`'s 14px/400 — an AA fail by 0.07. /75
              composites to #484847 for 8.39:1 light and 9.44:1 dark. */}
          <div className="line-clamp-2 text-caption leading-5 text-text-primary/75">
            {hint}
          </div>
        </div>
      ) : null}
      {composer}
    </div>
  );

  return (
    <div
      data-slot="coach-bottom-chat"
      className="pointer-events-none fixed bottom-0 left-0 right-0 z-40 w-full print:hidden"
    >
      {/* Mirrors AppShell's frame so this fixed bar's centering axis matches
          the main content column. When a flush right panel is present, reserve
          its width from the viewport edge instead of capping at max-w-6xl. */}
      {rightPanelMaxWidth ? (
        <div className={cn("flex w-full", COACH_NAV_CONTENT_INSET_CLASS)}>
          <div className="pointer-events-auto min-w-0 flex-1 pr-4 sm:pr-6">
            <div className="mx-auto w-[800px] max-w-full">{composerBlock}</div>
          </div>
          <div
            className="w-[min(var(--coach-right-panel),42vw)] max-w-[var(--coach-right-panel)] shrink-0"
            style={
              {
                "--coach-right-panel": `${rightPanelMaxWidth}px`,
              } as CSSProperties
            }
            aria-hidden
          />
        </div>
      ) : (
        <div
          className={cn(
            "pointer-events-auto mx-auto max-w-6xl pr-6",
            COACH_NAV_CONTENT_INSET_CLASS,
          )}
        >
          <div className="mx-auto w-[800px] max-w-full">{composerBlock}</div>
        </div>
      )}
    </div>
  );
}
