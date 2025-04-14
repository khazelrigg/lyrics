// src/hooks/useSpotifyAuth.ts
import { useEffect, useState } from "react"
import { initiateSpotifyAuth } from "../services/spotifyAuth"

export function useSpotifyAuth(): string | null {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const storedToken = localStorage.getItem("spotify_access_token")
    const expires = Number(localStorage.getItem("spotify_token_expires") || 0)

    if (!storedToken || Date.now() > expires) {
      initiateSpotifyAuth()
    } else {
      setToken(storedToken)
    }
  }, [])

  return token
}
