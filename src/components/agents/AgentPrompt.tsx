"use client";

import { useState } from "react";

import { TypingText } from "@/components/TypingText";
import { splitPrompt } from "@/components/agents/splitPrompt";

type AgentPromptProps = {
  promptKey: string;
  prompt: string;
  ariaLabel?: string;
};

function AgentPromptInner({
  promptKey,
  prompt,
  ariaLabel = "Agent prompt",
}: AgentPromptProps) {
  const { heading: promptHeading, subtext: promptSubtext } = splitPrompt(prompt);
  const [revealPrompt, setRevealPrompt] = useState(false);
  const [headingDone, setHeadingDone] = useState(false);

  const headingText = promptHeading || prompt;

  return (
    <div className="relative w-full">
      {/* Height sizer: reserve final layout so typing doesn't reflow */}
      <div aria-hidden="true" className="pointer-events-none opacity-0">
        <div className="whitespace-pre-wrap text-left text-[48px] font-extrabold leading-[1.05] tracking-tight">
          {headingText}
        </div>
        {promptSubtext ? (
          <div className="mt-4 whitespace-pre-wrap text-left text-[34px] font-semibold leading-[48px] tracking-tight text-black/80">
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
        <div className="whitespace-pre-wrap text-left text-[48px] font-extrabold leading-[1.05] tracking-tight">
          <TypingText
            key={`heading-${promptKey}`}
            text={headingText}
            reveal={revealPrompt}
            cursor={!revealPrompt}
            baseCharDelayMs={52}
            onDone={() => setHeadingDone(true)}
          />
        </div>
        {promptSubtext && headingDone ? (
          <div className="mt-4 whitespace-pre-wrap text-left text-[34px] font-semibold leading-[48px] tracking-tight text-black/80">
            <TypingText
              key={`subtext-${promptKey}`}
              text={promptSubtext}
              reveal={revealPrompt}
              cursor={!revealPrompt}
              baseCharDelayMs={52}
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

