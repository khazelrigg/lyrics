import { Pause, Play } from "lucide-react";

import { formatTimestamp } from "@/lib/utils";
import { useSpotifyStore } from "@/stores/spotifyStore";

export default function NowPlayingStatus() {
  const { track, isPlaying, currentTime, duration } = useSpotifyStore();

  if (!track) {
    return (
      <div className="w-full rounded-b-3xl border-b border-white/10 bg-[#131313]/80 px-5 py-3 text-sm text-white/45 backdrop-blur-xl">
        No track playing
      </div>
    );
  }

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <section className="w-full border-b border-white/10 bg-[#131313]/80 px-5 py-3 text-white backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <img
          src={track.albumArt}
          alt={`${track.album} album art`}
          className="h-12 w-12 shrink-0 rounded-lg object-cover shadow-lg"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            {isPlaying ? (
              <Play className="h-3.5 w-3.5 fill-green-400 text-green-400" />
            ) : (
              <Pause className="h-3.5 w-3.5 text-white/45" />
            )}

            <p className="truncate text-sm font-semibold">{track.title}</p>
          </div>

          <p className="truncate text-xs text-white/45">
            {track.artist} • {track.album}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] font-mono text-white/35">
              {formatTimestamp(currentTime)}
            </span>

            <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-green-400"
                style={{ width: `${progress}%` }}
              />
            </div>

            <span className="text-[10px] font-mono text-white/35">
              {formatTimestamp(duration)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}