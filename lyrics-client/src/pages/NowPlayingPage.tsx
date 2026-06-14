// src/pages/NowPlayingPage.tsx

import {
  ChevronDown,
  MoreVertical,
  Pause,
  Repeat,
  Share2,
  Shuffle,
  SkipBack,
  SkipForward,
  ListMusic,
  MonitorSpeaker,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { useLyrics } from "@/hooks/useLyrics";
import { useSpotifyStore } from "@/stores/spotifyStore";

import { ImmersiveLyricsViewer } from "@/components/lyrics/ImmersiveLyricsViewer";
import { LyricsNotFoundState } from "@/components/lyrics/states/LyricsNotFoundState";


export default function NowPlayingPage() {
  const { lyrics, loading, error } = useLyrics();

  const track = useSpotifyStore((s) => s.track);


  return (
    <div className="flex min-h-dvh flex-col overflow-hidden bg-[#131313] text-white">
      {/* background/header unchanged */}

      <main className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden px-5">
        <section className="mt-6 flex items-end gap-4 pb-8">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-white/10 shadow-2xl">
            {track?.albumArt ? (
              <img
                src={track.albumArt}
                alt={`${track.album} album art`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-white/10" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="truncate text-2xl font-bold tracking-tight">
              {track?.title ?? "No track playing"}
            </h2>

            <p className="truncate text-sm font-medium text-white/55">
              {track ? `${track.artist} • ${track.album}` : "Connect Spotify to begin"}
            </p>
          </div>
        </section>

        {loading ? (
          <div className="flex flex-1 items-center justify-center text-white/50">
            Loading lyrics...
          </div>
        ) : lyrics ? (
          <ImmersiveLyricsViewer lyrics={lyrics} />
        ) : (
          <LyricsNotFound
            title={error ? "Error loading lyrics" : "No lyrics found for this track"}
            subtitle={
              "Start playing a song on Spotify and lyrics will appear here."
            }
          />
        )}
      </main>

      {/* footer */}
    </div>
  );
}