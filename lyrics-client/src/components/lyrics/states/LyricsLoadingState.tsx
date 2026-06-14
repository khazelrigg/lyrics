// src/components/lyrics/LyricsLoading.tsx
import SwirlingEffectSpinner from "@/components/ui/spinner";

export function LyricsLoadingState() {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      
      <SwirlingEffectSpinner className="stroke-green-500" />

      {/* 
      <div className="mb-8 flex h-28 items-end justify-center gap-1.5">
        {[35, 60, 90, 55, 75, 45, 80].map((height, index) => (
          <div
            key={index}
            className="w-2 rounded-full bg-green-400/80 animate-wave shadow-[0_0_12px_rgba(74,222,128,0.35)]"
            style={{
              height: `${height}%`,
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}
      </div>
      */}

      <div className="mb-3 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-green-400">
        Loading Lyrics
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-primary">
        Searching for lyrics…
      </h2>

      <p className="mt-3 max-w-xs text-sm leading-6 text-primary/45">
        Checking lyric sources for the current track.
      </p>
    </div>
  );
}