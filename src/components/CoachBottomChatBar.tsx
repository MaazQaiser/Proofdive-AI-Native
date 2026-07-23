"use client";

import { CircleHelp } from "lucide-react";

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
};

export function CoachBottomChatBar({
  placeholder,
  onSend,
  disabled,
  prefill,
  prefillKey,
  showUploadButton,
}: Props = {}) {
  const faq = useFaqAssistant();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 w-full print:hidden">
      {/* Mirrors AppShell's frame (max-w-6xl, pl-20/pr-6 reserved for the nav
          rail) so this fixed-position bar's centering axis matches the main
          content column's — otherwise the two drift apart since this bar
          lives outside AppShell's DOM tree and centers on the viewport.
          No background here (matches CoachConversationalDock) — the
          ChatComposer card itself is translucent/blurred and should float
          over the page content, not sit inside an opaque footer strip. */}
      <div className="mx-auto max-w-6xl pr-6 pl-20">
        <div className="mx-auto w-[800px] max-w-full pb-4">
          <ChatComposer
            key={prefillKey ?? "coach-bottom-chat-composer"}
            placeholder={faq.isFaqMode ? "Select a question above" : (placeholder ?? "Ask AI Coach")}
            onSend={onSend ?? (() => {})}
            disabled={disabled || faq.isFaqMode}
            prefill={prefill}
            showUploadButton={faq.isFaqMode ? false : showUploadButton}
            modeToggle={{
              isActive: faq.isFaqMode,
              icon: CircleHelp,
              activeLabel: "FAQ Assistant",
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
            threadHeaderTitle="FAQ Assistant"
          />
        </div>
      </div>
    </div>
  );
}
