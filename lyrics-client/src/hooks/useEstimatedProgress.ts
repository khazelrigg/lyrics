import { useEffect, useState } from "react";

import { useSpotifyStore } from "@/stores/spotifyStore";

function clampProgress(progress: number, duration: number) {
  return Math.max(0, duration > 0 ? Math.min(progress, duration) : progress);
}

/**
 * Estimates playback between Spotify polling responses.
 *
 * While playback is active, elapsed wall-clock time is added to Spotify's last
 * reported position. Paused playback uses the reported position directly, and
 * both paths are clamped to the known track duration.
 */
export function useEstimatedProgress(refreshRate: number = 100): number {
  const { currentTime, duration, lastUpdatedAt, isPlaying } = useSpotifyStore();
  const [estimated, setEstimated] = useState(() =>
    clampProgress(currentTime, duration)
  );

  useEffect(() => {
    if (!isPlaying) {
      setEstimated(clampProgress(currentTime, duration));
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastUpdatedAt;
      setEstimated(clampProgress(currentTime + elapsed, duration));
    }, refreshRate);

    return () => clearInterval(interval);
  }, [currentTime, duration, lastUpdatedAt, isPlaying, refreshRate]);

  return estimated;
}
