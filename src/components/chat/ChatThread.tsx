"use client";

import type { ChatMessage } from "@/components/chat/chatTypes";
import { cn } from "@/components/cn";

export function ChatThread({ messages }: { messages: ChatMessage[] }) {
  return (
    <div className="flex flex-col gap-3">
      {messages.map((m) => (
        <div
          key={m.id}
          className={cn(
            "flex",
            m.role === "user" ? "justify-end" : "justify-start",
          )}
        >
          <div
            className={cn(
              "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-body-sm leading-6",
              m.role === "user"
                ? "bg-foreground text-background"
                : "border border-border bg-card text-text-primary",
            )}
          >
            {m.content}
          </div>
        </div>
      ))}
    </div>
  );
}

