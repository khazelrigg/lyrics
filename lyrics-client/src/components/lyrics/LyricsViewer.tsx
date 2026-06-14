import { useEffect, useRef, useState } from "react";
import type { LyricsData } from "../../types/lyrics";
import { useEstimatedProgress } from "../../hooks/useEstimatedProgress";
import LyricsLine from "./LyricsLine";

import { useTokenizer } from "../../hooks/useTokenizer";
import { parseLyricsLine } from "../../utils/parseLyricsLine";

interface LyricsViewerProps {
  lyrics: LyricsData;
}

export default function LyricsViewer({ lyrics }: LyricsViewerProps) {
  const tokenizer = useTokenizer();

  const containerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLLIElement>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [userScrolled, setUserScrolled] = useState(false);

  const currentTime = useEstimatedProgress(100);
  const [parsedLyrics, setParsedLyrics] = useState<LyricsData>(lyrics);

  const activeIndex = parsedLyrics.lines.findIndex((line, i) => {
    const current = line.start_time || 0;
    const next = parsedLyrics.lines[i + 1]?.start_time ?? Infinity;
    return currentTime >= current && currentTime < next;
  });

  // 🛠 New: Parse missing parsedWords when lyrics first load
  useEffect(() => {
    if (!tokenizer) return; // Quit if tokenizer not ready

    async function parseAllLines() {
      const parsedLines = await Promise.all(
        lyrics.lines.map(async (line) => {
          if (!line.parsedWords && containsJapanese(line.text)) {
            console.log(line.text + " has japanese");
            const parsedWords = await parseLyricsLine(line.text, tokenizer);
            return { ...line, parsedWords };
          } else {
            return line;
          }
        })
      );
      setParsedLyrics({ ...lyrics, lines: parsedLines });
    }

    parseAllLines();
  }, [lyrics, tokenizer]);

  useEffect(() => {
    if (!isAutoScroll) return;
    if (!activeLineRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const line = activeLineRef.current;

    const lineOffsetTop = line.offsetTop;
    const lineHeight = line.offsetHeight;
    const containerHeight = container.offsetHeight;

    const scrollTop = lineOffsetTop - containerHeight / 2 + lineHeight / 2;

    const currentScroll = container.scrollTop;
    const scrollDiff = Math.abs(currentScroll - scrollTop);
    if (scrollDiff > 20) {
      container.scrollTo({ top: scrollTop, behavior: "smooth" });
    }
  }, [currentTime, isAutoScroll, activeIndex]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = () => setUserScrolled(true);
    const onTouchMove = () => setUserScrolled(true);

    container.addEventListener("wheel", onWheel);
    container.addEventListener("touchmove", onTouchMove);

    return () => {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchmove", onTouchMove);
    };
  }, []);

  useEffect(() => {
    if (userScrolled) {
      setIsAutoScroll(false);
      setUserScrolled(false);
    }
  }, [userScrolled]);

  if (!tokenizer) {
    return (
      <div className="p-4 text-center text-gray-400">Loading tokenizer...</div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full space-y-2 max-h-screen font-lyrics">
      <div
        ref={containerRef}
        className="w-[80vw] flex-1 overflow-y-auto rounded-xl p-4 bg-white/5 backdrop-blur scroll-smooth max-h-full"
      >
        <p className="text-2xl font-bold">
          Lyrics to {parsedLyrics.title} by {parsedLyrics.artist} from{" "}
          {parsedLyrics.source}
        </p>
        <p className="text-sm text-gray-400">
          Estimated playback: {currentTime}ms
        </p>
        <ul className="flex flex-col items-center w-full space-y-2">
          {parsedLyrics.lines.map((line, index) => {
            const isActive = index === activeIndex;
            const isPast = index < activeIndex;

            return (
              <LyricsLine
                key={index}
                text={line.text}
                parsedWords={line.parsedWords}
                start_time={line.start_time}
                isActive={isActive}
                isPast={isPast}
                onClick={() => {}}
                furiganaMode="hover"
                {...(isActive ? { ref: activeLineRef } : {})}
              />
            );
          })}
        </ul>
      </div>

      {!isAutoScroll && (
        <div className="sticky bottom-4 right-4 z-50 flex justify-end">
          <button
            onClick={() => setIsAutoScroll(true)}
            className="px-4 py-2 text-sm text-yellow-300 border border-yellow-300 bg-black/50 rounded-full backdrop-blur hover:bg-yellow-300 hover:text-black"
          >
            Resync
          </button>
        </div>
      )}
    </div>
  );
}

// Little helper: check if text contains any Japanese
function containsJapanese(text: string): boolean {
  return /[\u3000-\u30ff\u3400-\u4dbf\u4e00-\u9faf\uff66-\uff9f]/.test(text);
}
