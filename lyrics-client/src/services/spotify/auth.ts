// src/services/spotifyAuth.ts

/**
 * This file manages Spotify authentication.
 * It does not interact with the Spotify Web API directly.
 */

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
const SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
].join(" ");

const TOKEN_KEY = "spotify_access_token";
const EXPIRES_AT_KEY = "spotify_expires_at";

/**
 * Begins Spotify OAuth flow, redirect user to login with Spotify
 */
export function initiateSpotifyAuth() {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "token",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

/**
 * Call this in a useEffect on /callback or /auth route to extract the token
 */
export function extractTokenFromUrl(): string | null {
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);

  // Check if user clicked cancel
  if (params.get("error") === "access_denied") {
    console.warn("Spotify authorization was denied by user.");
    return null;
  } 

  const token = params.get("access_token");
  const expiresInParam = params.get("expires_in");
  const expiresIn = expiresInParam ? parseInt(expiresInParam, 10) : 3600; // Default to 1 hr fallback

  // Save the token info to local storage
  if (token && expiresIn) {
    saveTokenInfo(token, expiresIn);
    return token;
  }
  
  return null;
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function saveTokenInfo(token: string, expiresIn: number) {
  const expiresAt = Date.now() + expiresIn * 1000;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRES_AT_KEY, expiresAt.toString());
}

export function getTokenInfo() {
  return {
    token: getAccessToken(),
    isExpired: isTokenExpired(),
  };
}

export function isTokenExpired(): boolean {
  const expiresAtStr = localStorage.getItem(EXPIRES_AT_KEY);
  if (!expiresAtStr) return true; // No expiration yet, not logged in

  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt)) return true;

  return Date.now() >= expiresAt;
}

export function hasValidToken(): boolean {
  const token = getAccessToken();
  return !!token && !isTokenExpired();
}
