import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

import { SyncedLyricsLine } from "@/components/lyrics/SyncedLyricsLine";
import {
  getActiveLyricsLineIndex,
  isValidLyricsTimestamp,
} from "@/components/lyrics/lyricsSync";
import { Button } from "@/components/ui/button";
import { useEstimatedProgress } from "@/hooks/useEstimatedProgress";
import { seek } from "@/services/spotifyApi";
import type { LyricsData } from "@/types/lyrics";
import { ListStart } from "lucide-react";

/** Lyrics payload rendered by the canonical viewer. */
type Props = {
  lyrics: LyricsData;
};

/**
 * Displays synchronized lyrics as seekable lines and unsynchronized lyrics as
 * plain selectable text. Synced mode owns its scroll container and temporarily
 * stops following playback whenever the user navigates the lyrics manually.
 */
export function ImmersiveLyricsViewer({ lyrics }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef(new Map<number, HTMLLIElement>());
  const [isFollowing, setIsFollowing] = useState(true);
  const [seekError, setSeekError] = useState<string | null>(null);

  const currentTime = useEstimatedProgress(100);
  const activeIndex = useMemo(
    () =>
      lyrics.synced
        ? getActiveLyricsLineIndex(lyrics.lines, currentTime)
        : -1,
    [currentTime, lyrics.lines, lyrics.synced]
  );

  const prefersReducedMotion = useCallback(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  const centerLine = useCallback(
    (index: number, force = false) => {
      const container = containerRef.current;
      const line = lineRefs.current.get(index);

      if (!container || !line) {
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const lineRect = line.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;
      const lineCenter = lineRect.top + lineRect.height / 2;

      // Avoid repeated tiny scroll corrections while the line is near center.
      const centeredZone = Math.min(containerRect.height * 0.18, 96);

      if (!force && Math.abs(lineCenter - containerCenter) <= centeredZone) {
        return;
      }

      container.scrollTo({
        top: container.scrollTop + lineCenter - containerCenter,
        behavior: prefersReducedMotion() ? "auto" : "smooth",
      });
    },
    [prefersReducedMotion]
  );

  useEffect(() => {
    setIsFollowing(true);
    setSeekError(null);
  }, [lyrics.track_id]);

  useEffect(() => {
    if (!isFollowing || activeIndex < 0) {
      return;
    }

    centerLine(activeIndex);
  }, [activeIndex, centerLine, isFollowing, lyrics.track_id]);

  const pauseFollowing = useCallback(() => {
    if (lyrics.synced) {
      setIsFollowing(false);
    }
  }, [lyrics.synced]);

  const handleNavigationKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(
        event.key
      )
    ) {
      pauseFollowing();
    }
  };

  const resumeFollowing = () => {
    setIsFollowing(true);

    if (activeIndex >= 0) {
      centerLine(activeIndex, true);
    }
  };

  const handleSeek = async (index: number, timestamp: number) => {
    const selection = window.getSelection()?.toString().trim();

    // Preserve text selection for Yomitan, copying, and other browser tools.
    if (selection) {
      return;
    }

    setSeekError(null);
    setIsFollowing(true);
    centerLine(index, true);

    try {
      const response = await seek(timestamp);

      if (!response.ok) {
        throw new Error(`Spotify returned ${response.status}`);
      }
    } catch (error) {
      console.warn("Unable to seek Spotify playback:", error);
      setSeekError("Could not seek Spotify. Playback was left unchanged.");
    }
  };

  if (lyrics.lines.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center text-primary">
        No lyric lines available.
      </div>
    );
  }

  return (
    <section
      aria-label={`Lyrics for ${lyrics.title}`}
      className="relative flex min-h-0 flex-1 flex-col overflow-hidden"
    >
      <div
        ref={containerRef}
        onWheel={pauseFollowing}
        onTouchStart={pauseFollowing}
        onPointerDown={pauseFollowing}
        onKeyDown={handleNavigationKey}
        className={[
          "min-h-0 flex-1 overflow-y-auto overscroll-contain px-1",
          lyrics.synced ? "py-[35vh] [mask-image:linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]" : "py-8",
        ].join(" ")}
      >
        {lyrics.synced ? (
          <ul className="space-y-3 pr-2">
            {lyrics.lines.map((line, index) => {
              if (!isValidLyricsTimestamp(line.start_time)) {
                return (
                  <li
                    key={`untimed-${index}`}
                    className="px-14 py-2 text-xl font-bold text-primary leading-tight sm:text-2xl lg:text-3xl"
                  >
                    {line.text || "♪"}
                  </li>
                );
              }

              const timestamp = line.start_time;

              return (
                <SyncedLyricsLine
                  key={`${timestamp}-${index}`}
                  ref={(element) => {
                    if (element) {
                      lineRefs.current.set(index, element);
                    } else {
                      lineRefs.current.delete(index);
                    }
                  }}
                  text={line.text}
                  timestamp={timestamp}
                  isActive={index === activeIndex}
                  isPast={activeIndex >= 0 && index < activeIndex}
                  onSeek={() => void handleSeek(index, timestamp)}
                />
              );
            })}
          </ul>
        ) : (
          <div className="space-y-5 px-2 sm:px-6">
            {lyrics.lines.map((line, index) => (
              <p
                key={index}
                className="select-text text-xl font-semibold leading-relaxed"
              >
                {line.text || "\u00a0"}
              </p>
            ))}
          </div>
        )}
      </div>

      {!isFollowing && lyrics.synced && (
        <div className="pointer-events-none absolute items-end right-10 bottom-20">
          <Button
            type="button"
            aria-label="Resume sync"
            onClick={resumeFollowing}
            className="pointer-events-auto rounded-full size-12 bg-green-400  text-black shadow-xl hover:bg-green-300"
          >
            <ListStart className="size-8" />
          </Button>
        </div>
      )}

      <p
        role="status"
        aria-live="polite"
        className={[
          "absolute inset-x-4 bottom-16 z-10 rounded-lg bg-red-950/95 px-3 py-2 text-center text-sm text-red-100 shadow-lg",
          seekError ? "" : "hidden",
        ].join(" ")}
      >
        {seekError}
      </p>
    </section>
  );
}
