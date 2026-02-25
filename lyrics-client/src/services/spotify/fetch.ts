// src/services/fetch.ts
import {
  getValidAccessToken,
  clearAccessToken,
  initiateSpotifyAuth,
} from "./auth";

const SPOTIFY_BASE = "https://api.spotify.com/v1";

async function parseSpotifyError(res: Response): Promise<string> {
  // Spotify sometimes returns JSON, sometimes empty
  try {
    const data = await res.json();
    return data?.error?.message || data?.message || `Spotify API error (${res.status})`;
  } catch {
    return `Spotify API error (${res.status})`;
  }
}

export async function spotifyFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // Get token (refresh if needed)
  let token = await getValidAccessToken();

  // If we still don't have a token, we need interactive login
  if (!token) {
    clearAccessToken();
    initiateSpotifyAuth();
    throw new Error("Not authenticated with Spotify");
  }

  // Helper to do the actual request with a given token
  const doRequest = async (accessToken: string): Promise<Response> => {
    return fetch(`${SPOTIFY_BASE}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Only set JSON content-type if caller didn't override AND we're sending a body.
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });
  };

  // First attempt
  let res = await doRequest(token);

  // If unauthorized, try ONE refresh + retry (token may have been revoked)
  if (res.status === 401) {
    // Clear stored access token info so getValidAccessToken() will refresh (if possible)
    clearAccessToken();

    token = await getValidAccessToken();

    if (!token) {
      // No refresh token (or refresh failed) -> must re-auth
      initiateSpotifyAuth();
      throw new Error("Spotify session expired; re-auth required");
    }

    res = await doRequest(token);
  }

  // Handle no-content
  if (res.status === 204) {
    return null as unknown as T;
  }

  // Any remaining non-OK responses
  if (!res.ok) {
    const message = await parseSpotifyError(res);

    // If it's still 401 after retry, force re-auth
    if (res.status === 401) {
      clearAccessToken();
      initiateSpotifyAuth();
    }

    throw new Error(message);
  }

  // Some endpoints can return empty body even with 200-ish; be defensive
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null as unknown as T;
  }

  return (await res.json()) as T;
}