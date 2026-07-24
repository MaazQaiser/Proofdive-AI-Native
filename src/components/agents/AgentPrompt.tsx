"use client";

import { useState } from "react";

import { TypingText } from "@/components/TypingText";
import { splitPrompt } from "@/components/agents/splitPrompt";
import { cn } from "@/lib/utils";

type AgentPromptProps = {
  promptKey: string;
  prompt: string;
  ariaLabel?: string;
  headingClassName?: string;
  subtextClassName?: string;
  /** Reveal one character at a time (default) or one whole word at a time. */
  mode?: "char" | "word";
};

function AgentPromptInner({
  promptKey,
  prompt,
  ariaLabel = "Agent prompt",
  headingClassName = "text-h3 leading-[1.05]",
  subtextClassName = "mt-4 text-h4 leading-[48px] text-[var(--app-fg)]/80",
  mode = "char",
}: AgentPromptProps) {
  const { heading: promptHeading, subtext: promptSubtext } = splitPrompt(prompt);
  const [revealPrompt, setRevealPrompt] = useState(false);
  const [headingDone, setHeadingDone] = useState(false);

  const headingText = promptHeading || prompt;
  const charDelay = mode === "word" ? undefined : 22;
  const wordDelay = mode === "word" ? 55 : undefined;

  return (
    <div className="relative w-full">
      {/* Height sizer: reserve final layout so typing doesn't reflow */}
      <div aria-hidden="true" className="pointer-events-none opacity-0">
        <div className={cn("whitespace-pre-wrap text-left", headingClassName)}>
          {headingText}
        </div>
        {promptSubtext ? (
          <div className={cn("whitespace-pre-wrap text-left", subtextClassName)}>
            {promptSubtext}
          </div>
        ) : null}
      </div>

      {/* Visible typing layer */}
      <div
        className="absolute inset-0"
        onClick={() => setRevealPrompt(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") setRevealPrompt(true);
        }}
        aria-label={ariaLabel}
      >
        <div className={cn("whitespace-pre-wrap text-left", headingClassName)}>
          <TypingText
            key={`heading-${promptKey}`}
            text={headingText}
            reveal={revealPrompt}
            cursor={!revealPrompt}
            mode={mode}
            baseCharDelayMs={charDelay}
            baseWordDelayMs={wordDelay}
            onDone={() => setHeadingDone(true)}
          />
        </div>
        {promptSubtext && headingDone ? (
          <div className={cn("whitespace-pre-wrap text-left", subtextClassName)}>
            <TypingText
              key={`subtext-${promptKey}`}
              text={promptSubtext}
              reveal={revealPrompt}
              cursor={!revealPrompt}
              mode={mode}
              baseCharDelayMs={charDelay}
              baseWordDelayMs={wordDelay}
              startDelayMs={260}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Remounts when `promptKey` changes so typing state doesn’t carry over between prompts. */
export function AgentPrompt(props: AgentPromptProps) {
  return <AgentPromptInner key={props.promptKey} {...props} />;
}

