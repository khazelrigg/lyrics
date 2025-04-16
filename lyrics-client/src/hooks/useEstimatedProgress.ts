// src/hooks/useEstimatedProgress.ts
import { useEffect, useState } from "react"
import { useSpotifyStore } from "../store/spotifyStore"

/**
 * Returns a smoothly updating estimated progress position based on
 * last known currentTime and whether playback is active.
 */
export function useEstimatedProgress(refreshRate: number = 100): number {
  const { currentTime, lastUpdatedAt, isPlaying } = useSpotifyStore()
  const [estimated, setEstimated] = useState(currentTime)

  useEffect(() => {
    if (!isPlaying) {
      setEstimated(currentTime)
      return
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastUpdatedAt
      setEstimated(currentTime + elapsed)
    }, refreshRate)

    return () => clearInterval(interval)
  }, [currentTime, lastUpdatedAt, isPlaying, refreshRate])

  return estimated
} 
