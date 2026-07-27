"use client";

import { MessageCircleQuestion } from "lucide-react";

import { ChatComposer } from "@/components/chat/ChatComposer";
import { FaqAssistantThread } from "@/components/faq/FaqAssistantThread";
import { useFaqAssistant } from "@/components/faq/useFaqAssistant";

type Props = {
  placeholder?: string;
  onSend?: (text: string) => void;
  /** Disables the composer (e.g. when the flow offers on-screen actions instead). */
  disabled?: boolean;
  prefill?: string;
  prefillKey?: string;
  /** Hides the attachment control when nothing in this flow is actually uploadable. Defaults to shown. */
  showUploadButton?: boolean;
  /**
   * When set (e.g. storyboard's flush 400px right rail), reserves that width on
   * xl+ from the viewport edge so the composer centers in the main Q&A column.
   */
  rightPanelMaxWidth?: number;
  /**
   * Rest as a compact pill; tap opens AI Assistant. Used on Coach / Interview /
   * Training. Storyboard keeps the full resting composer.
   */
  compactWhenIdle?: boolean;
};

export function CoachBottomChatBar({
  placeholder,
  onSend,
  disabled,
  prefill,
  prefillKey,
  showUploadButton,
  rightPanelMaxWidth,
  compactWhenIdle = false,
}: Props = {}) {
  const faq = useFaqAssistant();

  const composer = (
    <ChatComposer
      key={prefillKey ?? "coach-bottom-chat-composer"}
      placeholder={faq.isFaqMode ? "Select a question above" : (placeholder ?? "Ask AI Coach")}
      onSend={onSend ?? (() => {})}
      disabled={disabled || faq.isFaqMode}
      prefill={prefill}
      showUploadButton={faq.isFaqMode ? false : showUploadButton}
      compactWhenIdle={compactWhenIdle}
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

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 w-full print:hidden">
      {/* Mirrors AppShell's frame so this fixed bar's centering axis matches
          the main content column. When a flush right panel is present, reserve
          its width from the viewport edge instead of capping at max-w-6xl. */}
      {rightPanelMaxWidth ? (
        <div className="flex w-full pl-20">
          <div className="min-w-0 flex-1 pr-6">
            <div className="mx-auto w-[800px] max-w-full pb-4">{composer}</div>
          </div>
          <div
            className="hidden shrink-0 xl:block"
            style={{ width: rightPanelMaxWidth, maxWidth: rightPanelMaxWidth }}
            aria-hidden
          />
        </div>
      ) : (
        <div className="mx-auto max-w-6xl pr-6 pl-20">
          <div className="mx-auto w-[800px] max-w-full pb-4">{composer}</div>
        </div>
      )}
    </div>
  );
}
