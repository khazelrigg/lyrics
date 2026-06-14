// src/pages/HomePage.tsx

import { useLyrics } from "@/hooks/useLyrics";
import { useSpotifyStore } from "@/stores/spotifyStore";

import { LyricsNotFoundState } from "@/components/lyrics/states/LyricsNotFoundState";
import { LyricsLoadingState } from "@/components/lyrics/states/LyricsLoadingState";
import { InstrumentalState } from "@/components/lyrics/states/InstrumentalState";

import { ImmersiveLyricsViewer } from "@/components/lyrics/ImmersiveLyricsViewer";
import LoginPage from "./LoginPage";
import { AppHeader } from "@/components/layout/AppHeader";

export default function HomePage() {
  const { lyrics, loading } = useLyrics();
  const spotify = useSpotifyStore();

  return (
    <div className="flex h-full w-full flex-col min-h-0 overflow-hidden">
      <header className="shrink-0">
        <AppHeader title="Listen" showBack />
      </header>

      <main className="min-h-0 flex-1 px-4 overflow-y-auto">
        {/* Set content based on lyrics state */}
        {!spotify.connected ? (
          <LoginPage />
        ) : loading ? (
          <LyricsLoadingState />
        ) : lyrics && lyrics.status === "INSTRUMENTAL" ? (
          <InstrumentalState />
        ) : lyrics && lyrics.status === "OK" ? (
          <ImmersiveLyricsViewer lyrics={lyrics} />
        ) : (
          <LyricsNotFoundState />
        )}
        {/*<LyricsViewer lyrics={lyrics ?? dummyLyrics} />*/}
      </main>
    </div>
  );
}
