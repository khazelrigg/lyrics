"use client";

import { useEffect, useRef, useState } from "react";
import { useLyricsStore } from "@/stores/lyricsStore";
import { useEstimatedProgress } from "@/hooks/useEstimatedProgress";
import LyricsLine from "./LyricsLine";
import { Button } from "@/components/ui/button";
import { play, seek } from "@/services/spotify/api";
import { ScrollTextIcon } from "lucide-react";
import { useFontSettings } from "@/hooks/useFontSettings";
import { cn } from "@/lib/utils";

export default function LyricsScroll() {
  const { lyrics } = useLyricsStore();
  const estimatedProgress = useEstimatedProgress();
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const { className, style, fontSettings } = useFontSettings();

  // Filter only lines with startTimeMs
  const validLines = (lyrics?.lines || []).filter(
    (line) => typeof line.start_time === "number"
  );

  const [currentlyOpenId, setCurrentlyOpenId] = useState<number | null>(null);

  // Find current active line
  const activeIndex = validLines.findIndex(
    (line, i, arr) =>
      estimatedProgress >= line.start_time! &&
      (i === arr.length - 1 || estimatedProgress < arr[i + 1].start_time!)
  );

  // Auto-scroll to center current line
  useEffect(() => {
    if (!autoScroll || activeIndex === -1 || !containerRef.current) return;

    const activeEl = containerRef.current.children[
      activeIndex
    ] as HTMLDivElement;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIndex, autoScroll]);

  if (!lyrics || validLines.length === 0) {
    return (
      <div
        className={cn(
          "h-full flex flex-col items-center justify-center text-base text-muted-foreground",
          className
        )}
        style={style}
      >
        No lyrics available.
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Auto-scroll toggle */}
      <div className="absolute top-2 right-4 z-20 \">
        <Button
          variant={autoScroll ? "default" : "outline"}
          size="sm"
          onClick={() => setAutoScroll((prev) => !prev)}
          className={`gap-1 ${autoScroll ? 'bg-ui-accent text-white' : ''} `}
        >
          <ScrollTextIcon className="w-4 h-4" />
          <span className="hidden sm:inline">
            {autoScroll ? "Auto-Scroll On" : "Auto-Scroll Off"}
          </span>
        </Button>
      </div>

      {/* Lyrics Lines */}
      <div
        ref={containerRef}
        className={cn(
          "overflow-y-auto h-full px-4 py-8 space-y-4 scroll-smooth z-0 transition",
          className
        )}
        style={{
          ...style,
          //fontSize: "20px", // Larger base font size
          textAlign: fontSettings.textAlignment, // Apply text alignment
          lineHeight: `${Math.max(1.5, fontSettings.fontSize / 10)}`,
        }}
      >
        {validLines.map((line, index) => (
          <LyricsLine
            id={index}
            key={index}
            text={line.text}
            startTimeMs={line.start_time!}
            nextStartTimeMs={validLines[index + 1]?.start_time ?? undefined}
            isActive={index === activeIndex}
            onClick={() => {
              seek(line.start_time!);
              play();
            }}
            currentlyOpenId={currentlyOpenId}
            setCurrentlyOpenId={setCurrentlyOpenId}
          />
        ))}
      </div>
    </div>
  );
}
