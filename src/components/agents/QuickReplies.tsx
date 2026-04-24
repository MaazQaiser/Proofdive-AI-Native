"use client";

export type QuickReplyOption = { id: string; label: string; value: string; hint?: string };

export function QuickReplies({
  options,
  onPick,
}: {
  options: QuickReplyOption[];
  onPick: (value: string) => void;
}) {
  if (!options.length) return null;

  return (
    <div className="mx-auto mt-6 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => onPick(opt.value)}
          className="rounded-[16px] border border-[#E2E8F0]/90 bg-white/60 px-4 py-4 text-left shadow-[0_2px_12px_rgba(0,0,0,0.04)] transition hover:bg-white/70 active:bg-white/80"
        >
          <div className="text-sm font-extrabold tracking-tight">{opt.label}</div>
          {opt.hint ? (
            <div className="mt-1 text-xs text-[var(--app-muted)]">{opt.hint}</div>
          ) : null}
        </button>
      ))}
    </div>
  );
}

