import * as React from "react";
import { ArrowUp, FileText, Mic, Paperclip, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/icon-button";

type ChatboxProps = {
  className?: string;
  value: string;
  onValueChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  attachedFileName?: string | null;
  onUploadClick?: () => void;
  onRemoveFile?: () => void;
  onMicClick?: () => void;
  disabled?: boolean;
  /** Hides the "Upload" affordance for steps that don't accept attachments. */
  showUploadAction?: boolean;
  textareaProps?: Omit<
    React.ComponentProps<"textarea">,
    "value" | "onChange" | "placeholder" | "disabled" | "className"
  >;
};

/** AI reply textbox — Figma "Chatbox" (node 38:305): empty/upload/filled
 * states are driven here by `value`/`attachedFileName` rather than a static
 * variant prop, so the box reflects real input as the user types. */
function Chatbox({
  className,
  value,
  onValueChange,
  onSend,
  placeholder = "Reply (paste here or upload)",
  attachedFileName,
  onUploadClick,
  onRemoveFile,
  onMicClick,
  disabled,
  showUploadAction = true,
  textareaProps,
}: ChatboxProps) {
  const canSend = !disabled && (value.trim().length > 0 || !!attachedFileName);

  return (
    <div
      data-slot="chatbox"
      className={cn(
        "bg-(--base)/60 relative flex w-full max-w-[800px] flex-col gap-2.5 rounded-[20px] border border-border px-5 py-4 backdrop-blur-[42px]",
        className,
      )}
    >
      {attachedFileName && (
        <div className="flex w-fit min-w-16 shrink-0 items-center gap-1 rounded-lg border border-border bg-muted/70 px-1.5 py-1 backdrop-blur-[16px]">
          <FileText className="size-4 shrink-0" />
          <span className="text-text-primary px-1 text-overline font-medium leading-6 whitespace-nowrap">
            {attachedFileName}
          </span>
          <button
            type="button"
            onClick={onRemoveFile}
            aria-label="Remove attached file"
            className="flex size-4 shrink-0 items-center justify-center"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      <div className="flex min-h-[87px] w-full flex-col justify-between">
        <textarea
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={2}
          className="text-text-primary placeholder:text-text-secondary w-full flex-1 resize-none bg-transparent text-body-sm leading-[1.25] outline-none disabled:opacity-50"
          {...textareaProps}
        />

        <div className="flex h-7 w-full items-center">
          {showUploadAction && (
            <button
              type="button"
              onClick={onUploadClick}
              disabled={disabled}
              className="text-text-primary hover:bg-muted flex min-w-16 shrink-0 items-center justify-center gap-1 rounded-full px-2 py-0.5 disabled:pointer-events-none disabled:opacity-50"
            >
              <Paperclip className="size-4 shrink-0" />
              <span className="px-1 text-overline font-medium leading-6 whitespace-nowrap">
                Upload
              </span>
            </button>
          )}

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <IconButton
              variant="ghost"
              onClick={onMicClick}
              disabled={disabled}
              aria-label="Record voice reply"
            >
              <Mic />
            </IconButton>
            <IconButton
              variant="solid"
              onClick={onSend}
              disabled={!canSend}
              aria-label="Send reply"
            >
              <ArrowUp />
            </IconButton>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Chatbox };
