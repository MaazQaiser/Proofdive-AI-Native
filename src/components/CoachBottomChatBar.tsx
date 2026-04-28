"use client";

import { ChatComposer } from "@/components/chat/ChatComposer";

type Props = {
  placeholder?: string;
  onSend?: (text: string) => void;
  /** Disables the composer (e.g. when the flow offers on-screen actions instead). */
  disabled?: boolean;
  prefill?: string;
  prefillKey?: string;
};

export function CoachBottomChatBar({
  placeholder,
  onSend,
  disabled,
  prefill,
  prefillKey,
}: Props = {}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--app-bg)] px-6 py-5">
      <div className="mx-auto w-full max-w-[840px]">
        <ChatComposer
          key={prefillKey ?? "coach-bottom-chat-composer"}
          placeholder={placeholder ?? "Ask AI Coach"}
          onSend={onSend ?? (() => {})}
          disabled={disabled}
          prefill={prefill}
        />
      </div>
    </div>
  );
}
