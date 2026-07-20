"use client";

import { useCallback, useRef, useState } from "react";

import { Chatbox } from "@/components/ui/chatbox";
import { useSpeechDictation } from "@/components/chat/useSpeechDictation";

type OnboardingComposerProps = {
  onSend: (text: string) => void;
  onUpload?: (files: File[]) => void;
  uploadAccept?: string;
  showUploadButton?: boolean;
  disabled?: boolean;
  placeholder?: string;
};

/** Onboarding's reply box — wraps the design-system `Chatbox` with the same
 * text/voice/upload/send behavior the shared `ChatComposer` provides
 * elsewhere, restyled to the Figma onboarding spec without touching that
 * shared component (still used by Coach/Storyboard). */
export function OnboardingComposer({
  onSend,
  onUpload,
  uploadAccept,
  showUploadButton = true,
  disabled = false,
  placeholder = "Reply (type here or use voice)",
}: OnboardingComposerProps) {
  const [text, setText] = useState("");
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const appendFinalTranscript = useCallback((segment: string) => {
    setText((prev) => {
      if (!segment) return prev;
      if (!prev) return segment;
      const needsSpace = !prev.endsWith(" ") && !segment.startsWith(" ");
      return needsSpace ? `${prev} ${segment}` : `${prev}${segment}`;
    });
  }, []);

  const { isSupported, isListening, interim, start, stop, voiceError } = useSpeechDictation({
    onFinalTranscript: appendFinalTranscript,
  });

  const interimSpacer =
    interim && text && !text.endsWith(" ") && !interim.startsWith(" ") ? " " : "";
  const displayText = `${text}${interim ? `${interimSpacer}${interim}` : ""}`;

  function handleValueChange(next: string) {
    if (!interim) {
      setText(next);
      return;
    }
    const suffix = `${interimSpacer}${interim}`;
    if (next.endsWith(suffix)) {
      setText(next.slice(0, next.length - suffix.length));
      return;
    }
    setText(next);
    stop();
  }

  function send() {
    if (disabled) return;
    const payload = displayText.trim();
    if (!payload) return;
    onSend(payload);
    setText("");
    setAttachedFileName(null);
    stop();
  }

  return (
    <div className="flex w-full flex-col items-center gap-2">
      {showUploadButton && (
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={uploadAccept}
          onChange={(e) => {
            const files = Array.from(e.currentTarget.files ?? []);
            const file = files[0];
            if (file) {
              setAttachedFileName(file.name);
              onUpload?.(files);
            }
            e.currentTarget.value = "";
          }}
        />
      )}
      <Chatbox
        value={displayText}
        onValueChange={handleValueChange}
        onSend={send}
        placeholder={placeholder}
        disabled={disabled}
        attachedFileName={attachedFileName}
        onUploadClick={() => fileInputRef.current?.click()}
        onRemoveFile={() => setAttachedFileName(null)}
        onMicClick={() => (isListening ? stop() : void start())}
        showUploadAction={showUploadButton}
        textareaProps={{
          onKeyDown: (e) => {
            if (disabled) return;
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          },
        }}
      />
      {voiceError ? (
        <p className="text-caption text-destructive" role="status">
          {voiceError}
        </p>
      ) : !isSupported ? (
        <p className="text-caption text-text-secondary">
          Voice needs Chrome, Edge, or Safari (not Firefox).
        </p>
      ) : null}
    </div>
  );
}
