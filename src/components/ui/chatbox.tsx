import * as React from "react";
import { ArrowUp, FileText, Mic, Paperclip, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { IconButton } from "@/components/ui/icon-button";

export type ChatboxAttachedFile = {
  id: string;
  name: string;
};

type ChatboxProps = {
  className?: string;
  value: string;
  onValueChange: (value: string) => void;
  onSend: () => void;
  placeholder?: string;
  /**
   * Single-file convenience API (design-system demos / simple hosts).
   * Prefer `attachedFiles` when multiple chips are needed.
   */
  attachedFileName?: string | null;
  onRemoveFile?: () => void;
  /** Multi-file chips rendered above the textarea (Figma attachment placement). */
  attachedFiles?: ChatboxAttachedFile[];
  onRemoveAttachedFile?: (id: string) => void;
  onUploadClick?: () => void;
  onMicClick?: () => void;
  /** Highlights the mic control while voice dictation is active. */
  isListening?: boolean;
  disabled?: boolean;
  /** Hides the "Upload" affordance for steps that don't accept attachments. */
  showUploadAction?: boolean;
  /** Optional content above attachments/textarea (e.g. FAQ / coach thread). */
  leading?: React.ReactNode;
  /** Actions rendered before mic/send (e.g. FAQ mode toggle). */
  footerTrailing?: React.ReactNode;
  /** Status / helper copy below the toolbar (voice errors, unsupported browser). */
  status?: React.ReactNode;
  textareaProps?: Omit<
    React.ComponentProps<"textarea">,
    "value" | "onChange" | "placeholder" | "disabled" | "className"
  >;
  textareaRef?: React.Ref<HTMLTextAreaElement>;
};

/** AI reply textbox — Figma "Chatbox" (node 38:305): empty/upload/filled
 * states are driven here by `value`/`attachedFileName` rather than a static
 * variant prop, so the box reflects real input as the user types.
 *
 * Border matches the selection chip's "linear1" stroke paint (node
 * 152:370): a top-to-bottom gradient stopping at #F2F2F2 (0%), the
 * extended-light-cyan token (41%), then white (100%). With a translucent
 * glass fill the double-background border trick bleeds the ring into the
 * surface, so the gradient lives on a 1px outer shell and the frosted fill
 * is a separate inner layer that fully covers the center.
 *
 * When `leading` is set (thread/FAQ), horizontal padding is applied only to
 * the composer body so the leading region's bottom rule can run edge-to-edge. */
function Chatbox({
  className,
  value,
  onValueChange,
  onSend,
  placeholder = "Reply (paste here or upload)",
  attachedFileName,
  onRemoveFile,
  attachedFiles,
  onRemoveAttachedFile,
  onUploadClick,
  onMicClick,
  isListening = false,
  disabled,
  showUploadAction = true,
  leading,
  footerTrailing,
  status,
  textareaProps,
  textareaRef,
}: ChatboxProps) {
  const files: ChatboxAttachedFile[] =
    attachedFiles ??
    (attachedFileName
      ? [{ id: attachedFileName, name: attachedFileName }]
      : []);

  const canSend = !disabled && (value.trim().length > 0 || files.length > 0);
  const hasLeading = Boolean(leading);

  const composerBody = (
    <>
      {files.length > 0 ? (
        <div className="flex flex-col gap-2">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex w-fit min-w-16 shrink-0 items-center gap-1 rounded-lg border border-border bg-muted/70 px-1.5 py-1 backdrop-blur-[16px]"
            >
              <FileText className="size-4 shrink-0" />
              <span className="text-text-primary px-1 text-overline font-medium leading-6 whitespace-nowrap">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  if (attachedFiles) onRemoveAttachedFile?.(file.id);
                  else onRemoveFile?.();
                }}
                aria-label={`Remove ${file.name}`}
                className="flex size-4 shrink-0 items-center justify-center"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex min-h-[87px] w-full flex-col justify-between">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={2}
          className="text-text-primary placeholder:text-text-secondary w-full flex-1 resize-none bg-transparent text-body-sm leading-[1.25] outline-none disabled:cursor-not-allowed disabled:opacity-50"
          {...textareaProps}
        />

        <div className="flex flex-col gap-1">
          {status ? <div className="min-h-0">{status}</div> : null}
          <div className="flex h-7 w-full items-center">
            {showUploadAction && (
              <button
                type="button"
                onClick={onUploadClick}
                disabled={disabled}
                className="text-text-primary hover:bg-muted -ml-2 flex min-w-16 shrink-0 items-center justify-center gap-1 rounded-full px-2 py-0.5 disabled:pointer-events-none disabled:opacity-50"
              >
                <Paperclip className="size-4 shrink-0" />
                <span className="px-1 text-overline font-medium leading-6 whitespace-nowrap">
                  Upload
                </span>
              </button>
            )}

            <div className="ml-auto flex shrink-0 items-center gap-2">
              {footerTrailing}
              <IconButton
                variant="ghost"
                onClick={onMicClick}
                disabled={disabled}
                aria-label={isListening ? "Stop voice" : "Record voice reply"}
                className={isListening ? "bg-primary text-primary-foreground" : undefined}
              >
                <Mic />
              </IconButton>
              <IconButton
                variant="solid"
                onClick={onSend}
                disabled={!canSend}
                aria-label="Send reply"
                className="-mr-1 disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100"
              >
                <ArrowUp />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div
      data-slot="chatbox"
      className={cn(
        "relative w-full max-w-[800px] rounded-[20px] p-px [background:linear-gradient(180deg,#f2f2f2,var(--extended-light-cyan)_41%,#fff)]",
        hasLeading && "flex min-h-0 flex-col",
        className,
      )}
    >
      <div
        className={cn(
          "flex w-full flex-col rounded-[19px] backdrop-blur-[42px] [background:linear-gradient(90deg,rgba(255,255,255,0.4)_0%,rgba(255,255,255,0.72)_100%)]",
          hasLeading
            ? "min-h-0 flex-1 gap-0 overflow-hidden"
            : "gap-2.5 px-5 py-4",
        )}
      >
        {hasLeading ? (
          <div className="min-h-0 w-full shrink-0">{leading}</div>
        ) : null}

        <div
          className={cn(
            "flex w-full flex-col gap-2.5",
            hasLeading ? "px-5 pt-3 pb-4" : null,
          )}
        >
          {composerBody}
        </div>
      </div>
    </div>
  );
}

export { Chatbox };
