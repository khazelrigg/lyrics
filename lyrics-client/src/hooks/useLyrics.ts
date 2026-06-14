// src/hooks/useLyrics.ts
import { useEffect, useState } from "react";
import { useSpotifyStore } from "@/stores/spotifyStore";
import type { LyricsData } from "@/types/lyrics";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useLyrics(source: string = "SpotifyLyricsSource") {
  const trackId = useSpotifyStore((s) => s.track?.trackId);
  const [lyrics, setLyrics] = useState<LyricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackId) return;

    setLoading(true);
    setError(null);

    fetch(`${BASE_URL}/lyrics?song_id=${trackId}&source=${source}`)
      .then((res) => {
        if (!res.ok) throw new Error("Lyrics not found");
        return res.json();
      })
      .then((data) => {
        setLyrics(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [trackId, source]);

  return { lyrics, loading, error };
}
