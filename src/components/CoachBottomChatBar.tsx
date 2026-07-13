"use client";

import { ChatComposer } from "@/components/chat/ChatComposer";

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
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--app-bg)] px-6 py-5 print:hidden">
      <div className="mx-auto w-[800px] max-w-full">
        <ChatComposer
          key={prefillKey ?? "coach-bottom-chat-composer"}
          placeholder={placeholder ?? "Ask AI Coach"}
          onSend={onSend ?? (() => {})}
          disabled={disabled}
          prefill={prefill}
          showUploadButton={showUploadButton}
        />
      </div>
    </div>
  );
}
