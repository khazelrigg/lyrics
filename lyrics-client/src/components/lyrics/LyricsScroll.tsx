"use client";

import { useEffect, useRef, useState } from "react";
import LyricsLine from "./LyricsLine";
import { Button } from "@/components/ui/button";
import { play, seek } from "@/services/spotify/api";
import { ScrollTextIcon } from "lucide-react";
import { useFontSettings } from "@/hooks/useFontSettings";
import { cn } from "@/lib/utils";

import { useActiveLyricLine } from "@/hooks/useActiveLyricLine";
import { ActiveLyricProvider } from "@/components/lyrics/ActiveLyricContext";

export default function LyricsScroll() {
  const { validLines, activeIndex } = useActiveLyricLine();
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const { className, style, fontSettings } = useFontSettings();

  const [currentlyOpenId, setCurrentlyOpenId] = useState<number | null>(null);

  const activeStartTimeMs =
    activeIndex >= 0 ? (validLines[activeIndex]?.start_time ?? null) : null;

  // Auto-scroll to center current line
  useEffect(() => {
    if (!autoScroll || activeIndex === -1 || !containerRef.current) return;

    const activeEl = containerRef.current.children[activeIndex] as HTMLDivElement;
    activeEl?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeIndex, autoScroll]);

  if (!validLines || validLines.length === 0) {
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
      <div className="absolute top-2 right-4 z-20">
        <Button
          variant={autoScroll ? "default" : "outline"}
          size="sm"
          onClick={() => setAutoScroll((prev) => !prev)}
          className={cn("gap-1", autoScroll && "bg-ui-accent text-white")}
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
          textAlign: fontSettings.textAlignment,
          lineHeight: `${Math.max(1.5, fontSettings.fontSize / 10)}`,
        }}
      >
        <ActiveLyricProvider value={{ activeIndex, activeStartTimeMs }}>
          {validLines.map((line, index) => (
            <LyricsLine
              id={index}
              key={index}
              text={line.text}
              startTimeMs={line.start_time!}
              nextStartTimeMs={validLines[index + 1]?.start_time ?? undefined}
              onClick={() => {
                seek(line.start_time!);
                play();
              }}
              currentlyOpenId={currentlyOpenId}
              setCurrentlyOpenId={setCurrentlyOpenId}
            />
          ))}
        </ActiveLyricProvider>
      </div>
    </div>
  );
}