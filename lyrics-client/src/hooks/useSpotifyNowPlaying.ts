// src/hooks/useSpotifyPolling.ts

import { useEffect, useRef } from "react";
import { getPlaybackStatus } from "@/services/spotify/api";
import { useSpotifyStore } from "@/stores/spotifyStore";

export function useSpotifyNowPlaying() {
  const setTrack = useSpotifyStore((s) => s.setTrack);
  const setPlayback = useSpotifyStore((s) => s.setPlayback);
  const isPlaying = useSpotifyStore((s) => s.isPlaying);
  const connected = useSpotifyStore((s) => s.connected);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!connected) return;

    const fetchStatus = async () => {
      try {
        const data = await getPlaybackStatus();
        if (!data?.item) return;

        // Update track if trackId changes
        setTrack({
          title: data.item.name,
          artist: data.item.artists.map((a: any) => a.name).join(", "),
          album: data.item.album.name,
          albumArt: data.item.album.images?.[0]?.url || "",
          trackId: data.item.id,
          url: data.item.external_urls?.spotify || "",
          duration: data.item.duration_ms,
        });

        // Update currentTime and isPlaying
        setPlayback(data.progress_ms, data.is_playing);
      } catch (err) {
        console.warn("Spotify polling error:", err);
      }
    };

    fetchStatus(); // Fetch immediately when hook loads

    const getIntervalMs = () => (isPlaying ? 500 : 3000);

    const loop = () => {
      fetchStatus();
      intervalRef.current = setTimeout(loop, getIntervalMs());
    };

    intervalRef.current = setTimeout(loop, getIntervalMs());

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [setTrack, setPlayback, isPlaying, connected]);
}
