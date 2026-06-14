// src/components/Spotify/NowPlayingDebugCard.tsx
import { formatTimestamp } from "@/lib/utils";
import { useSpotifyStore } from "@/stores/spotifyStore";

export default function NowPlayingDebugCard() {
  const { track, isPlaying, currentTime, duration } = useSpotifyStore();

  if (!track)
    return <div className="text-white text-sm">No track playing.</div>;

  return (
    <div className="bg-neutral-900 text-white p-3 rounded-lg shadow mt-4 flex items-center gap-4">
      <img
        src={track.albumArt}
        alt="album art"
        className="w-16 h-16 rounded object-cover"
      />

      <div className="flex flex-col text-sm space-y-1 flex-1 min-w-0">
        <div className="font-semibold text-base truncate" title={track.title}>
          {track.title}
        </div>
        <div className="truncate" title={track.artist}>
          👤 {track.artist}
        </div>
        <div className="truncate" title={track.album}>
          💿 {track.album}
        </div>
        <div>▶ {isPlaying ? "Playing" : "Paused"}</div>
        <div>
          ⏱ {formatTimestamp(currentTime)} / {formatTimestamp(duration)}  
        </div>
      </div>
    </div>
  );
}
