// src/hooks/useLyrics.ts
import { useEffect } from "react";
import { useSpotifyStore } from "@/stores/spotifyStore";
import { useLyricsStore } from "@/stores/lyricsStore";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useLyrics(source = "SpotifyLyricsSource") {
  const trackId = useSpotifyStore((s) => s.track?.trackId);

  const {
    setLyrics,
    setLoading,
    setError,
    reset,
  } = useLyricsStore();

  useEffect(() => {
    if (!trackId) {
      reset();
      return;
    }

    setLoading(true);
    setError(null);

    const controller = new AbortController();

    fetch(`${BASE_URL}/lyrics?song_id=${trackId}&source=${source}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Lyrics not found");
        return res.json();
      })
      .then((data) => {
        setLyrics(data);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [trackId, source]);
}
