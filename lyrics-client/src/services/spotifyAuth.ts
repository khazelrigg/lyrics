// src/services/spotifyAuth.ts

/**
 * This file manages Spotify authentication.
 * It does not interact with the Spotify Web API directly.
 */

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI
const SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing"
].join(" ")

const TOKEN_KEY = "spotify_access_token"

/**
 * Begins Spotify OAuth flow
 */
export function initiateSpotifyAuth() {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "token",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
  })
  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
}

/**
 * Call this in a useEffect on /callback or /auth route to extract the token
 */
export function extractTokenFromUrl(): string | null {
  const hash = window.location.hash.substring(1)
  const params = new URLSearchParams(hash)
  const token = params.get("access_token")
  if (token) {
    setAccessToken(token)
    return token
  }
  return null
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY)
}
