import { AppHeader } from "@/components/layout/AppHeader";
import { ImmersiveLyricsViewer } from "@/components/lyrics/ImmersiveLyricsViewer";
import { InstrumentalState } from "@/components/lyrics/states/InstrumentalState";
import { LyricsLoadingState } from "@/components/lyrics/states/LyricsLoadingState";
import { LyricsNotFoundState } from "@/components/lyrics/states/LyricsNotFoundState";
import { useLyrics } from "@/hooks/useLyrics";
import { useSpotifyStore } from "@/stores/spotifyStore";
import LoginPage from "@/pages/LoginPage";

export default function HomePage() {
  const { lyrics, loading } = useLyrics();
  const connected = useSpotifyStore((state) => state.connected);
  const hasLyrics = connected && !loading && lyrics?.status === "OK";

  return (
    <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
      <header className="shrink-0">
        <AppHeader title="Listen" showBack />
      </header>

      <main
        className={[
          "min-h-0 flex-1 px-4",
          hasLyrics ? "flex overflow-hidden" : "overflow-y-auto",
        ].join(" ")}
      >
        {!connected ? (
          <LoginPage />
        ) : loading ? (
          <LyricsLoadingState />
        ) : lyrics?.status === "INSTRUMENTAL" ? (
          <InstrumentalState />
        ) : lyrics?.status === "OK" ? (
          <ImmersiveLyricsViewer lyrics={lyrics} />
        ) : (
          <LyricsNotFoundState />
        )}
      </main>
    </div>
  );
}
