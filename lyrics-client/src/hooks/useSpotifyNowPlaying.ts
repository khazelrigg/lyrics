"use client";

import { useEffect, useRef } from "react";
import { getPlaybackStatus } from "@/services/spotify/api";
import { useSpotifyStore } from "@/stores/spotifyStore";
import { parseTrack } from "@/services/spotify/utils"; // Move parseTrack into a utils file ideally!

export function useSpotifyNowPlaying() {
  const setTrack = useSpotifyStore((s) => s.setTrack);
  const setPlayback = useSpotifyStore((s) => s.setPlayback);
  const setShuffleState = useSpotifyStore((s) => s.setShuffleState);
  const setRepeatState = useSpotifyStore((s) => s.setRepeatState);
  const isPlaying = useSpotifyStore((s) => s.isPlaying);
  const connected = useSpotifyStore((s) => s.connected);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!connected) return;

    const fetchStatus = async () => {
      try {
        const data = await getPlaybackStatus();
        if (!data?.item) return;
        
        setTrack(parseTrack(data.item));

        setPlayback(data.progress_ms, data.is_playing);
        setShuffleState(data.shuffle_state);
        setRepeatState(data.repeat_state);
      } catch (err) {
        console.warn("Spotify polling error:", err);
      }
    };

    fetchStatus();

    const getIntervalMs = () => (isPlaying ? 500 : 3000);

    const loop = () => {
      fetchStatus();
      intervalRef.current = setTimeout(loop, getIntervalMs());
    };

    intervalRef.current = setTimeout(loop, getIntervalMs());

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [
    setTrack,
    setPlayback,
    setShuffleState,
    setRepeatState,
    isPlaying,
    connected,
  ]);
}
