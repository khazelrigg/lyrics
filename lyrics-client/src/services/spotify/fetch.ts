import {
  getAccessToken,
  clearAccessToken,
  isTokenExpired,
  initiateSpotifyAuth,
} from "./auth";

const SPOTIFY_BASE = "https://api.spotify.com/v1";

export async function spotifyFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAccessToken();
  if (!token || isTokenExpired()) {
    clearAccessToken();
    initiateSpotifyAuth();
    throw new Error("Missing or expired Spotify access token");
  }
  try {
    const res = await fetch(`${SPOTIFY_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || "Spotify API error");
    }

    if (res.status === 401) {
      clearAccessToken();
      throw new Error("Spotify token expired or unauthorized");
    }

    if (res.status === 204) {
      return null as unknown as T;
    }

    return res.json() as Promise<T>;
  } catch (err) {
    console.error("Network or unexpected Spotify error", err);
    throw new Error("Network fetch error contacting Spotify API");
  }
}
