// src/services/spotifyApi.ts
import { getValidAccessToken } from "@/services/spotifyAuth";

const SPOTIFY_BASE = "https://api.spotify.com/v1";

async function authHeaders() {
  const token = await getValidAccessToken();

  if (!token) {
    throw new Error("Missing Spotify access token");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getUserProfile() {
  const res = await fetch(`${SPOTIFY_BASE}/me`, {
    headers: await authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch user profile");
  return await res.json();
}

export async function getPlaybackStatus() {
  const res = await fetch(`${SPOTIFY_BASE}/me/player`, {
    method: "GET",
    headers: await authHeaders(),
  });

  if (res.status === 204) return null;
  if (!res.ok) throw new Error("Failed to get playback status");

  return await res.json();
}

export async function play() {
  return fetch(`${SPOTIFY_BASE}/me/player/play`, {
    method: "PUT",
    headers: await authHeaders(),
  });
}

export async function pause() {
  return fetch(`${SPOTIFY_BASE}/me/player/pause`, {
    method: "PUT",
    headers: await authHeaders(),
  });
}

export async function nextTrack() {
  return fetch(`${SPOTIFY_BASE}/me/player/next`, {
    method: "POST",
    headers: await authHeaders(),
  });
}

export async function previousTrack() {
  return fetch(`${SPOTIFY_BASE}/me/player/previous`, {
    method: "POST",
    headers: await authHeaders(),
  });
}

export async function seek(ms: number) {
  return fetch(`${SPOTIFY_BASE}/me/player/seek?position_ms=${ms}`, {
    method: "PUT",
    headers: await authHeaders(),
  });
}