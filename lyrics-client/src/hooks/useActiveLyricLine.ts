import { useMemo } from "react";
import { useLyricsStore } from "@/stores/lyricsStore";
import { useEstimatedProgress } from "@/hooks/useEstimatedProgress";

export function useActiveLyricLine() {
  const { lyrics } = useLyricsStore();
  const estimatedProgress = useEstimatedProgress();

  const validLines = useMemo(
    () => (lyrics?.lines || []).filter((l) => typeof l.start_time === "number"),
    [lyrics]
  );

  const activeIndex = useMemo(() => {
    if (validLines.length === 0) return -1;

    // Simple linear scan (fine for normal lyric sizes)
    return validLines.findIndex((line, i, arr) => {
      const start = line.start_time as number;
      const nextStart = arr[i + 1]?.start_time as number | undefined;
      return (
        estimatedProgress >= start &&
        (i === arr.length - 1 || (nextStart != null && estimatedProgress < nextStart))
      );
    });
  }, [validLines, estimatedProgress]);

  const activeLine = activeIndex >= 0 ? validLines[activeIndex] : null;

  return { validLines, activeIndex, activeLine, estimatedProgress };
}