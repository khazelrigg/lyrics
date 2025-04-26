// src/hooks/useSpotifyPolling.ts
import { useEffect, useRef } from "react";
import { getPlaybackStatus } from "../services/spotifyApi";
import { useSpotifyStore } from "../store/spotifyStore";

export function useSpotifyPolling() {
  const update = useSpotifyStore((s) => s.update);
  const isPlaying = useSpotifyStore((s) => s.isPlaying);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await getPlaybackStatus();
        if (!data?.item) return;

        update({
          isPlaying: data.is_playing,
          currentTime: data.progress_ms,
          duration: data.item.duration_ms,
          track: {
            title: data.item.name,
            artist: data.item.artists.map((a: any) => a.name).join(", "),
            album: data.item.album.name,
            albumArt: data.item.album.images?.[0]?.url || "",
            trackId: data.item.id,
            url: data.item.external_urls?.spotify || "",
          },
          lastUpdatedAt: Date.now(),
        });
      } catch (err) {
        console.warn("Spotify polling error:", err);
      }
    };

    // Poll immediately, then based on state
    fetchStatus();

    // Set our polling interval based on playback state
    const getIntervalMs = () => (isPlaying ? 500 : 3000);

    const loop = () => {
      fetchStatus();
      intervalRef.current = setTimeout(loop, getIntervalMs());
    };

    intervalRef.current = setTimeout(loop, getIntervalMs());

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [update, isPlaying]);
}
