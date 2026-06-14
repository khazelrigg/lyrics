import { Pause, Play } from "lucide-react";

import { formatTimestamp } from "@/lib/utils";
import { useSpotifyStore } from "@/stores/spotifyStore";

export default function NowPlayingStatus() {
  const { track, isPlaying, currentTime, duration } = useSpotifyStore();

  if (!track) {
    return null;
    return (
      <div className="w-full rounded-b-3xl border-b px-5 py-3 text-sm">
        No track playing
      </div>
    );
  }

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <section className="@container w-full px-5 py-3">
      <div className="flex items-center gap-3">
        <img
          src={track.albumArt}
          alt={`${track.album} album art`}
          className="hidden size-12 shrink-0 rounded-lg object-cover shadow-md @min-[10rem]:block"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <Play className="size-4 fill-background text-green-400" />
            ) : (
              <Pause className="size-4 text-primary/45" />
            )}

            <p className="truncate text-sm font-semibold">{track.title}</p>
          </div>

          <p className="truncate text-sm">
            {track.artist} • {track.album}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-mono">
              {formatTimestamp(currentTime)}
            </span>

            <div className="h-1 flex-1 overflow-hidden rounded-full bg-black/10">
              <div
                className="h-full rounded-full bg-green-400"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className="text-[10px] font-mono">
              {formatTimestamp(duration)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}