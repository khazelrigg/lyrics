// src/pages/HomePage.tsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import LyricsViewer from "../components/lyrics/LyricsViewer";
import type { LyricsData } from "../types/lyrics";
import ConnectSpotify from "../components/spotify/ConnectSpotify";

import { getPlaybackStatus } from "../services/spotifyApi";
import { useSpotifyStore } from "../store/spotifyStore";
import { useSpotifyPolling } from "../hooks/useSpotifyPolling";
import { useLyrics } from "../hooks/useLyrics";
import NowPlayingDebugCard from "../components/NowPlaying/NowPlayingDebugCard";

const dummyLyrics: LyricsData = {
  track_id: "demo-track",
  title: "Demo Song",
  artist: "Demo Artist",
  source: "DemoLyricsSource",
  synced: false,
  lines: [
    { text: "This is the first line", start_time: 0 },
    { text: "This is the second line", start_time: 5000 },
    { text: "And the third comes in", start_time: 10000 },
    { text: "♪", start_time: 15000 },
    { text: "The final lyric line", start_time: 20000 },
  ],
};

export default function HomePage() {
  useSpotifyPolling();
  const { lyrics, loading, error } = useLyrics();

  return (
    <div className="flex flex-col">

      <div className="px-4">
        <NowPlayingDebugCard />
        <hr className="my-4 border-white/20" />
      </div>

      {/* Main content fills remaining space */}
      <main className="flex-1 flex flex-col px-4">
        <LyricsViewer lyrics={lyrics ?? dummyLyrics} />
      </main>

    </div>
  )
}

