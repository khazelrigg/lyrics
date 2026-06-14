// src/hooks/useSpotifySession.ts

import { useEffect, useRef } from "react";

import { getValidAccessToken } from "@/services/spotifyAuth";
import { getUserProfile } from "@/services/spotifyApi";
import { getPlaybackStatus } from "@/services/spotifyApi";
import { useSpotifyStore } from "@/stores/spotifyStore";

export function useSpotifySession() {
  const update = useSpotifyStore((s) => s.update);
  const connect = useSpotifyStore((s) => s.connect);
  const disconnect = useSpotifyStore((s) => s.disconnect);
  const isPlaying = useSpotifyStore((s) => s.isPlaying);

  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchStatus() {
      try {
        const data = await getPlaybackStatus();

        if (!data?.item) return;

        update({
          isPlaying: data.is_playing,
          currentTime: data.progress_ms,
          duration: data.item.duration_ms,
          track: {
            title: data.item.name,
            artist: data.item.artists
              .map((a: { name: string }) => a.name)
              .join(", "),
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
    }

    async function startSession() {
      try {
        const token = await getValidAccessToken();

        if (!token) {
          disconnect();
          return;
        }

        const profile = await getUserProfile();

        if (cancelled) return;

        connect(
          profile.display_name || "Spotify User",
          profile.images?.[0]?.url || null
        );

        await fetchStatus();

        const loop = async () => {
          await fetchStatus();

          const intervalMs = useSpotifyStore.getState().isPlaying
            ? 500
            : 3000;

          intervalRef.current = setTimeout(loop, intervalMs);
        };

        intervalRef.current = setTimeout(loop, isPlaying ? 500 : 3000);
      } catch (err) {
        console.warn("Spotify session error:", err);

        if (!cancelled) {
          disconnect();
        }
      }
    }

    startSession();

    return () => {
      cancelled = true;

      if (intervalRef.current) {
        clearTimeout(intervalRef.current);
      }
    };
  }, [connect, disconnect, update, isPlaying]);
}