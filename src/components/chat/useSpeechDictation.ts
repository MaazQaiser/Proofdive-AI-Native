"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives?: number;
  onresult: ((e: unknown) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: unknown) => void) | null;
  start: () => void;
  stop: () => void;
};

function getSpeechRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Chrome ends idle sessions with `no-speech` then `onend` — must keep listening. */
function isNonFatalSpeechError(code: string): boolean {
  return (
    code === "aborted" ||
    code === "no-speech" ||
    code === "audio-capture" ||
    code === "network"
  );
}

const RESTART_MS = 180;

export function useSpeechDictation({
  lang = "en-US",
  onFinalTranscript,
}: {
  lang?: string;
  onFinalTranscript?: (text: string) => void;
} = {}) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalRef = useRef(onFinalTranscript);
  onFinalRef.current = onFinalTranscript;
  const wantListeningRef = useRef(false);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startingRef = useRef(false);
  /** Incremented in `stop` so an in-flight `getUserMedia` cannot call `start()` after cancel. */
  const listenEpochRef = useRef(0);

  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current != null) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const ctor = getSpeechRecognitionCtor();
    setIsSupported(Boolean(ctor));
    if (!ctor) return;
    const recognition = new ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;
    try {
      recognition.maxAlternatives = 1;
    } catch {
      /* optional */
    }

    recognition.onresult = (event: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = event as any;
      const results = e?.results as SpeechRecognitionResultList | undefined;
      if (!results?.length) return;
      const resultIndex = Math.max(0, Number(e?.resultIndex ?? 0));
      let interimTranscript = "";
      for (let i = resultIndex; i < results.length; i++) {
        const result = results[i];
        const piece = result[0]?.transcript ?? "";
        const isFinal = Boolean(result.isFinal);
        if (isFinal) {
          const trimmed = String(piece).trim();
          if (trimmed) onFinalRef.current?.(trimmed);
        } else {
          interimTranscript += piece;
        }
      }
      setInterim(interimTranscript);
    };

    recognition.onerror = (event: unknown) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const code = String((event as any)?.error ?? "");
      if (code === "aborted") return;
      if (isNonFatalSpeechError(code)) {
        if (code !== "aborted") setInterim("");
        return;
      }
      wantListeningRef.current = false;
      listenEpochRef.current += 1;
      startingRef.current = false;
      clearRestartTimer();
      setIsListening(false);
      setInterim("");
      setVoiceError(
        code === "not-allowed" || code === "service-not-allowed"
          ? "Microphone or voice permission denied."
          : `Voice stopped (${code}).`,
      );
    };

    recognition.onend = () => {
      setInterim("");
      clearRestartTimer();
      if (wantListeningRef.current && recognitionRef.current) {
        restartTimerRef.current = setTimeout(() => {
          restartTimerRef.current = null;
          const rec = recognitionRef.current;
          if (!rec || !wantListeningRef.current) return;
          try {
            setIsListening(true);
            rec.start();
          } catch {
            wantListeningRef.current = false;
            setIsListening(false);
            setVoiceError("Could not restart voice — try the mic button again.");
          }
        }, RESTART_MS);
      } else {
        setIsListening(false);
      }
    };

    recognitionRef.current = recognition;
    return () => {
      listenEpochRef.current += 1;
      wantListeningRef.current = false;
      if (restartTimerRef.current != null) {
        clearTimeout(restartTimerRef.current);
        restartTimerRef.current = null;
      }
      recognition.onresult = null;
      recognition.onend = null;
      recognition.onerror = null;
      try {
        recognition.stop();
      } catch {
        /* already stopped */
      }
      recognitionRef.current = null;
    };
  }, [clearRestartTimer, lang]);

  const stop = useCallback(() => {
    listenEpochRef.current += 1;
    wantListeningRef.current = false;
    startingRef.current = false;
    if (restartTimerRef.current != null) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
    try {
      recognitionRef.current?.stop();
    } catch {
      /* noop */
    }
    setIsListening(false);
    setInterim("");
  }, []);

  const start = useCallback(async () => {
    const rec = recognitionRef.current;
    if (!rec || startingRef.current) return;
    const epoch = listenEpochRef.current;
    startingRef.current = true;
    setVoiceError(null);
    try {
      if (typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch {
      setVoiceError("Microphone access denied — allow the mic for this site.");
      startingRef.current = false;
      return;
    }

    if (epoch !== listenEpochRef.current) {
      startingRef.current = false;
      return;
    }

    wantListeningRef.current = true;
    setInterim("");
    try {
      setIsListening(true);
      rec.start();
    } catch {
      wantListeningRef.current = false;
      setIsListening(false);
      setVoiceError("Could not start voice — try again.");
    } finally {
      startingRef.current = false;
    }
  }, []);

  return { isSupported, isListening, interim, start, stop, voiceError };
}
