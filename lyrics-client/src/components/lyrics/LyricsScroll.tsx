"use client";

import { useEffect, useRef, useState } from "react";
import { useLyricsStore } from "@/stores/lyricsStore";
import { useEstimatedProgress } from "@/hooks/useEstimatedProgress";
import LyricsLine from "./LyricsLine";
import { Button } from "@/components/ui/button";
import { seek } from "@/services/spotify/api";
import { ScrollTextIcon } from "lucide-react"; // optional icon

export default function LyricsScroll() {
  const { lyrics } = useLyricsStore();
  const estimatedProgress = useEstimatedProgress();
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Filter only lines with startTimeMs
  const validLines = (lyrics?.lines || []).filter(
    (line) => typeof line.start_time === "number"
  );

  // Find current active line
  const activeIndex = validLines.findIndex((line, i, arr) =>
    estimatedProgress >= line.start_time! &&
    (i === arr.length - 1 || estimatedProgress < arr[i + 1].start_time!)
  );

  // Auto-scroll to center current line
  useEffect(() => {
    if (!autoScroll || activeIndex === -1 || !containerRef.current) return;

    const activeEl = containerRef.current.children[activeIndex] as HTMLDivElement;
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeIndex, autoScroll]);

  if (!lyrics || validLines.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-sm text-muted-foreground">
        No lyrics available.
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Auto-scroll toggle */}
      <div className="absolute top-2 right-4 z-10">
        <Button
          variant={autoScroll ? "default" : "outline"}
          size="sm"
          onClick={() => setAutoScroll((prev) => !prev)}
          className="gap-1"
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
        className="overflow-y-auto h-full px-4 py-8 space-y-2 scroll-smooth"
      >
        {validLines.map((line, index) => (
          <LyricsLine
            key={index}
            text={line.text}
            startTimeMs={line.start_time!}
            isActive={index === activeIndex}
            onClick={() => {
              // Optional: hook up seeking here
              seek(line.start_time!)
            }}
          />
        ))}
      </div>
    </div>
  );
}
