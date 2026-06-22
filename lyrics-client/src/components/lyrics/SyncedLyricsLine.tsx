import { forwardRef, type KeyboardEvent } from "react";

import { formatTimestamp } from "@/lib/utils";

type SyncedLyricsLineProps = {
  text: string;
  timestamp: number;
  isActive: boolean;
  isPast: boolean;
  onSeek: () => void;
};

/**
 * Presents one timestamped lyric line as an accessible playback seek target.
 * Text remains selectable; the parent decides whether a seek should proceed.
 */
export const SyncedLyricsLine = forwardRef<
  HTMLLIElement,
  SyncedLyricsLineProps
>(function SyncedLyricsLine(
  { text, timestamp, isActive, isPast, onSeek },
  ref
) {
  const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    onSeek();
  };

  return (
    <li
      ref={ref}
      tabIndex={0}
      role="button"
      aria-current={isActive ? "true" : undefined}
      aria-label={`Seek to ${formatTimestamp(timestamp)}: ${text}`}
      onClick={onSeek}
      onKeyDown={handleKeyDown}
      className={[
        "group grid cursor-pointer scroll-my-24 grid-cols-[3rem_minmax(0,1fr)] gap-3 rounded-xl px-2 py-2 outline-none transition-colors duration-300",
        "focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#131313]",
        isActive ? "bg-background/[0.04]" : "hover:bg-background/[0.025]",
      ].join(" ")}
    >
      <span
        className={[
          "pt-1 font-mono text-xs tabular-nums transition-colors duration-300",
          isActive
            ? "text-green-400"
            : isPast
              ? "text-primary/25"
              : "text-primary/40",
        ].join(" ")}
      >
        {formatTimestamp(timestamp)}
      </span>

      <div className="relative min-w-0">
        {isActive && (
          <span
            aria-hidden="true"
            className="absolute -left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.9)] motion-safe:animate-pulse"
          />
        )}

        <p
          className={[
            "select-text text-xl font-bold leading-tight tracking-tight transition-all duration-300 sm:text-2xl lg:text-3xl",
            isActive
              ? "text-primary motion-safe:sm:scale-[1.02] motion-safe:sm:origin-left"
              : isPast
                ? "text-primary/40"
                : "text-primary/70",
          ].join(" ")}
        >
          {text || "♪"}
        </p>
      </div>
    </li>
  );
});
