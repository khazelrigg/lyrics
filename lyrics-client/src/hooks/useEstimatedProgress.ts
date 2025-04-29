// src/hooks/useEstimatedProgress.ts
import { useEffect, useState } from "react";
import { useSpotifyStore } from "@/stores/spotifyStore";

/**
 * Smoothly estimates the progress position of the currently playing track.
 * Updates based on the last known progress and browser clock.
 */
export function useEstimatedProgress(refreshRate: number = 100): number {
  const { currentTime, lastUpdatedAt, isPlaying } = useSpotifyStore();
  const [estimated, setEstimated] = useState(currentTime);

  useEffect(() => {
    // Whenever song changes, reset estimated progress
    setEstimated(currentTime);
  }, [currentTime]);

  useEffect(() => {
    if (!isPlaying) {
      return; // Don't start ticking if paused
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastUpdatedAt;
      setEstimated(currentTime + elapsed);
    }, refreshRate);

    return () => clearInterval(interval);
  }, [currentTime, lastUpdatedAt, isPlaying, refreshRate]);

  return estimated;
}
