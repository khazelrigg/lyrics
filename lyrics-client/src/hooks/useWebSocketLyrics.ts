// src/hooks/useWebSocketLyrics.ts
import { useEffect, useRef } from "react";
import { useActiveLyricLine } from "@/hooks/useActiveLyricLine";

/**
 * Sends the current lyric line as plain text each time the active line changes.
 * This mimics Textractor_websocket / Agent behavior (TextHooker-compatible).
 */
type Options = {
  enabled?: boolean;
  /**
   * If true, append a newline to each message (some pipelines prefer this).
   */
  appendNewline?: boolean;
  /**
   * Optional prefix to help GSM group/identify the source (e.g. "[Spotify] ").
   */
  prefix?: string;
};

export function useWebSocketLyrics(
  sendText: (text: string) => boolean,
  opts: Options = {}
) {
  const { enabled = true, appendNewline = false, prefix = "" } = opts;

  const { activeIndex, activeLine } = useActiveLyricLine();

  // Prevent spamming the same line repeatedly
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (!activeLine || activeIndex < 0) return;

    const key = `${activeIndex}:${activeLine.start_time ?? "nostart"}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;

    const text =
      prefix + activeLine.text + (appendNewline ? "\n" : "");

    sendText(text);
  }, [enabled, appendNewline, prefix, activeIndex, activeLine, sendText]);
}