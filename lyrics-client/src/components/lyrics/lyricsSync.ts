import type { LyricsLineData } from "@/types/lyrics";

/** Returns whether a line timestamp can participate in synchronization. */
export function isValidLyricsTimestamp(
  timestamp: number | undefined
): timestamp is number {
  return (
    typeof timestamp === "number" &&
    Number.isFinite(timestamp) &&
    timestamp >= 0
  );
}

/**
 * Finds the latest valid line at or before the playback position.
 *
 * Returning the latest match makes duplicate timestamps deterministic. A
 * return value of `-1` means playback has not reached a valid timed line.
 */
export function getActiveLyricsLineIndex(
  lines: LyricsLineData[],
  currentTime: number
): number {
  if (!Number.isFinite(currentTime) || currentTime < 0) {
    return -1;
  }

  let activeIndex = -1;

  for (let index = 0; index < lines.length; index += 1) {
    const timestamp = lines[index].start_time;

    if (!isValidLyricsTimestamp(timestamp)) {
      continue;
    }

    if (timestamp > currentTime) {
      break;
    }

    activeIndex = index;
  }

  return activeIndex;
}
