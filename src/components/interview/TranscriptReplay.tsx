"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AudioLines, Captions, Mic, Pause, Play, RotateCcw, RotateCw, UserRound, Video } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { InterviewTranscriptLine } from "@/lib/proofdiveTypes";
import { cn } from "@/lib/utils";

type Props = {
  transcript: InterviewTranscriptLine[];
  /** Length of the recorded session — stated as a fact in the corner. */
  durationSeconds: number;
  hasAudio?: boolean;
  hasVideo?: boolean;
  className?: string;
};

const SPEEDS = [1, 1.5, 2] as const;
/** Breathing room after the last line so it is read, not cut off. */
const TAIL_SECONDS = 10;
const SEEK_SECONDS = 10;

function fmtClock(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * Transcript replay — the recording section's player, made real.
 *
 * The old block drew a Play button that opened `window.alert("Player is a v1
 * stub.")` and three chips (±10s, 1×, PiP) styled as transport controls that
 * did nothing. There is no media file to play, so this drives the one asset
 * the report DOES have: the timestamped transcript. Play advances a clock;
 * the line whose timestamp has passed is the current one, shown large in the
 * player surface and highlighted (and kept in view) in the list; seek, ±10s
 * and speed all act on that clock; a click on any line jumps to it. When a
 * recording exists, the same controls drive the media element and the clock
 * follows `currentTime` — nothing here has to change shape.
 */
export function TranscriptReplay({
  transcript,
  durationSeconds,
  hasAudio,
  hasVideo,
  className,
}: Props) {
  const span = useMemo(() => {
    const last = transcript.length ? transcript[transcript.length - 1]!.timeSeconds : 0;
    return Math.max(30, last + TAIL_SECONDS);
  }, [transcript]);

  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);
  const speed = SPEEDS[speedIdx]!;

  // rAF clock. `current` is committed on every frame so the progress track,
  // clock and highlight all move together; the loop stops itself at the end.
  const frameRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  useEffect(() => {
    if (!playing) {
      lastTsRef.current = null;
      return;
    }
    const tick = (ts: number) => {
      const last = lastTsRef.current ?? ts;
      lastTsRef.current = ts;
      const dt = ((ts - last) / 1000) * speed;
      setCurrent((c) => {
        const next = c + dt;
        if (next >= span) {
          setPlaying(false);
          return span;
        }
        return next;
      });
      frameRef.current = window.requestAnimationFrame(tick);
    };
    frameRef.current = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameRef.current);
  }, [playing, speed, span]);

  const activeIdx = useMemo(() => {
    let idx = -1;
    transcript.forEach((line, i) => {
      if (line.timeSeconds <= current) idx = i;
    });
    return idx;
  }, [transcript, current]);
  const active = activeIdx >= 0 ? transcript[activeIdx]! : null;

  const seek = useCallback(
    (to: number) => setCurrent(Math.min(span, Math.max(0, to))),
    [span],
  );
  const togglePlay = useCallback(() => {
    if (!playing && current >= span) setCurrent(0);
    setPlaying((p) => !p);
  }, [playing, current, span]);

  // Keep the current line in view inside the scrolling list — nearest edge,
  // never a jump, and never when the user is not replaying.
  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!playing || activeIdx < 0) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-line="${activeIdx}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIdx, playing]);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const onTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    seek(((e.clientX - rect.left) / rect.width) * span);
  };

  const progressPct = span === 0 ? 0 : (current / span) * 100;
  const isYou = active?.speaker === "Candidate";

  return (
    <div className={cn("grid gap-4 lg:grid-cols-2", className)}>
      {/* Player surface */}
      <div className="min-w-0">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3">
            <Badge variant="outline" className="bg-card">
              Transcript replay
            </Badge>
            <div className="flex items-center gap-1.5">
              {hasAudio ? (
                <Badge variant="outline" className="bg-card">
                  <AudioLines aria-hidden />
                  Audio
                </Badge>
              ) : null}
              {hasVideo ? (
                <Badge variant="outline" className="bg-card">
                  <Video aria-hidden />
                  Video
                </Badge>
              ) : null}
            </div>
          </div>

          {/* The current line, teleprompter-style. */}
          <div
            className="absolute inset-x-0 top-12 bottom-12 flex items-center justify-center px-6 sm:px-10"
            aria-live="polite"
            aria-atomic
          >
            {active ? (
              <div className="w-full max-w-[52ch] text-center">
                <div className="mb-2 inline-flex items-center gap-1.5 text-overline font-medium text-extended-cyan-green">
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-5 place-items-center rounded-full",
                      isYou ? "bg-primary text-primary-foreground" : "bg-extended-light-cyan text-extended-cyan-green",
                    )}
                  >
                    {isYou ? <UserRound className="size-3" /> : <Mic className="size-3" />}
                  </span>
                  {isYou ? "You" : active.speaker} · {fmtClock(active.timeSeconds)}
                </div>
                <p className="text-body-sm leading-relaxed text-text-primary">{active.text}</p>
                {active.flag ? (
                  <Badge variant="outline" className="mt-2 bg-scoring-red/15 text-scoring-red-fg">
                    {active.flag}
                  </Badge>
                ) : null}
              </div>
            ) : (
              <p className="max-w-[40ch] text-center text-caption text-text-secondary">
                Press play to read the conversation back at the pace it happened.
              </p>
            )}
          </div>

          {/* Clock + track */}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <div className="mb-2 flex items-center justify-between text-overline tabular-nums text-text-secondary">
              <span>
                {fmtClock(current)} / {fmtClock(span)}
              </span>
              <span>{fmtClock(durationSeconds)} recorded</span>
            </div>
            <div
              ref={trackRef}
              role="slider"
              aria-label="Replay position"
              aria-valuemin={0}
              aria-valuemax={Math.round(span)}
              aria-valuenow={Math.round(current)}
              aria-valuetext={fmtClock(current)}
              tabIndex={0}
              onClick={onTrackClick}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") seek(current - SEEK_SECONDS);
                if (e.key === "ArrowRight") seek(current + SEEK_SECONDS);
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  togglePlay();
                }
              }}
              className="relative h-1.5 w-full cursor-pointer rounded-full bg-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <div className="h-1.5 rounded-full bg-primary" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => seek(current - SEEK_SECONDS)} aria-label="Back 10 seconds">
            <RotateCcw aria-hidden />
            10s
          </Button>
          <Button type="button" size="sm" onClick={togglePlay} aria-pressed={playing} className="min-w-24">
            {playing ? <Pause aria-hidden /> : <Play aria-hidden />}
            {playing ? "Pause" : current >= span ? "Replay" : "Play"}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => seek(current + SEEK_SECONDS)} aria-label="Forward 10 seconds">
            <RotateCw aria-hidden />
            10s
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="ml-auto tabular-nums"
            onClick={() => setSpeedIdx((i) => (i + 1) % SPEEDS.length)}
            aria-label={`Playback speed ${speed}×, click to change`}
          >
            {speed}×
          </Button>
        </div>
      </div>

      {/* Transcript list */}
      <div className="min-w-0">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-2">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Captions className="size-4" aria-hidden />
            </span>
            <span className="text-overline text-extended-cyan-green">Full transcript</span>
          </div>
          <div ref={listRef} className="mt-3 max-h-[320px] divide-y divide-border overflow-auto pr-1">
            {transcript.map((line, idx) => {
              const isCandidate = line.speaker === "Candidate";
              const isActive = idx === activeIdx;
              return (
                <button
                  key={idx}
                  type="button"
                  data-line={idx}
                  onClick={() => seek(line.timeSeconds)}
                  aria-current={isActive ? "true" : undefined}
                  className={cn(
                    "-mx-2 block w-[calc(100%+1rem)] rounded-md px-2 py-3 text-left transition-colors first:pt-0 last:pb-0",
                    "hover:bg-[var(--hover-veil)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    isActive && "bg-brand-1000/60",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "grid size-7 shrink-0 place-items-center rounded-full",
                        isCandidate
                          ? "bg-primary text-primary-foreground"
                          : "bg-extended-light-cyan text-extended-cyan-green",
                      )}
                      aria-hidden
                    >
                      {isCandidate ? <UserRound className="size-3.5" /> : <Mic className="size-3.5" />}
                    </span>
                    <span className="text-overline font-medium text-extended-cyan-green">
                      {isCandidate ? "You" : line.speaker}
                    </span>
                    <span className="ml-auto text-overline tabular-nums text-text-secondary">
                      {fmtClock(line.timeSeconds)}
                    </span>
                  </div>
                  <p className="mt-2 text-caption leading-relaxed text-text-primary">{line.text}</p>
                  {line.flag ? (
                    <Badge
                      variant="outline"
                      className="mt-2 bg-scoring-red/15 text-scoring-red-fg"
                    >
                      {line.flag}
                    </Badge>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
