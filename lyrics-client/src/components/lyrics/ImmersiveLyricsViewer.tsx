// src/components/lyrics/ImmersiveLyricsViewer.tsx

import {  useRef } from "react";

import type { LyricsData } from "@/types/lyrics";
import { useEstimatedProgress } from "@/hooks/useEstimatedProgress";
import { formatTimestamp } from "@/lib/utils";

type Props = {
  lyrics: LyricsData;
};

export function ImmersiveLyricsViewer({ lyrics }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLLIElement>(null);

  const currentTime = useEstimatedProgress(100);

  const activeIndex = lyrics.lines.findIndex((line, index) => {
    const current = line.start_time || 0;
    const next = lyrics.lines[index + 1]?.start_time ?? Infinity;

    return currentTime >= current && currentTime < next;
  });


  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <div
        ref={containerRef}
        className="lyric-gradient-mask scrolling-container flex-1 overflow-y-auto scroll-smooth py-8"
      >
        <ul className="space-y-5 pr-2">
          {lyrics.lines.map((line, index) => {
            const isActive = lyrics.synced ? index === activeIndex : true;
            const isPast = lyrics.synced ? index < activeIndex : false;

            return (
              <li
                key={`${line.start_time}-${index}`}
                ref={isActive ? activeLineRef : null}
                className={[
                  lyrics.synced
                    ? "grid grid-cols-[3.25rem_1fr] gap-3 transition-all duration-500"
                    : isActive
                      ? "py-2"
                      : "",
                ].join(" ")}
              >
                {lyrics.synced && (
                  <span
                    className={[
                      "pt-1 font-mono text-xs tabular-nums transition-colors duration-500",
                      isActive
                        ? "text-green-400"
                        : isPast
                          ? "text-black/20"
                          : "text-black/30",
                    ].join(" ")}
                  >
                    {formatTimestamp(line.start_time)}
                  </span>
                )}

                <div className="relative">
                  { isActive && (
                    <div className="absolute -left-4 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.9)] animate-pulse-dot" />
                  )}

                  <p
                    className={[
                      "text-3xl font-bold leading-tight tracking-tight transition-all duration-500",
                      isActive
                        ? "origin-left scale-105"
                        : isPast
                          ? "text-black/50"
                          : "text-black/95",
                    ].join(" ")}
                  >
                    {line.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
