"use client";

import { useMemo, useState } from "react";

import type { ChatMessage } from "@/components/chat/chatTypes";
import { makeId } from "@/lib/id";
import { splitPrompt } from "@/components/agents/splitPrompt";

export function useScriptedChat(initialMessages: ChatMessage[]) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => initialMessages);

  function push(role: "assistant" | "user", content: string) {
    setMessages((prev) => [
      ...prev,
      { id: makeId(), role, content, createdAt: new Date().toISOString() },
    ]);
  }

  const lastAssistantMessage = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant"),
    [messages],
  );

  const prompt = lastAssistantMessage?.content ?? "";
  const { heading: promptHeading, subtext: promptSubtext } = splitPrompt(prompt);
  const promptKey = lastAssistantMessage?.id ?? "initial";

  return {
    messages,
    setMessages,
    push,
    lastAssistantMessage,
    prompt,
    promptHeading,
    promptSubtext,
    promptKey,
  };
}

