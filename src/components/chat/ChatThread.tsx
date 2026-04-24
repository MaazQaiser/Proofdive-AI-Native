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
              "max-w-[85%] whitespace-pre-wrap rounded-[22px] px-4 py-3 text-sm leading-6",
              m.role === "user"
                ? "bg-black text-white"
                : "bg-white text-black shadow-[0_12px_30px_rgba(0,0,0,0.08)]",
            )}
          >
            {m.content}
          </div>
        </div>
      ))}
    </div>
  );
}

