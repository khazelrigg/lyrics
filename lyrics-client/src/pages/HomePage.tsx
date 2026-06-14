// src/pages/HomePage.tsx

import { useLyrics } from "@/hooks/useLyrics";

import NowPlayingDebugCard from "@/components/NowPlaying/NowPlayingDebugCard";
import NowPlayingStatus from "@/components/NowPlaying/NowPlayingCard"

import { LyricsNotFoundState } from "@/components/lyrics/states/LyricsNotFoundState";
import { LyricsLoadingState } from "@/components/lyrics/states/LyricsLoadingState";
import { InstrumentalState } from "@/components/lyrics/states/InstrumentalState";

import { ImmersiveLyricsViewer } from "@/components/lyrics/ImmersiveLyricsViewer";
import { AppHeader } from "@/components/layout/AppHeader";


export default function HomePage() {
  const { lyrics, loading, error } = useLyrics();

  return (
    <div className="flex-1 flex flex-col w-full h-full">
      <AppHeader title="Lyrics" showCollapse />

      <div className="px-4 items-center w-full">
        <NowPlayingStatus />
      </div>

      <main className="flex-1 flex flex-col px-4 ">

      {/* Set content based on lyrics state */}
        {loading ? (
          <LyricsLoadingState />
        ) : lyrics && lyrics.status === "INSTRUMENTAL" ? (
          <InstrumentalState />
        ) : lyrics &&  lyrics.status === "OK" ?(
          <ImmersiveLyricsViewer lyrics={lyrics} />
        ) : (
          <LyricsNotFoundState />
        )}
        {/*<LyricsViewer lyrics={lyrics ?? dummyLyrics} />*/}

      </main>
    </div>
  );
}
