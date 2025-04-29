import { getAccessToken } from "./auth";

const SPOTIFY_BASE = "https://api.spotify.com/v1";

function authHeaders() {
  const token = getAccessToken();
  if (!token) throw new Error("Missing access token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function getUserProfile() {
  const res = await fetch(`${SPOTIFY_BASE}/me`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch user profile");
  return await res.json();
}

export async function getPlaybackStatus() {
  const res = await fetch(`${SPOTIFY_BASE}/me/player`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (res.status === 204) return null; // No active device
  if (!res.ok) throw new Error("Failed to get playback status");
  return await res.json();
}

export async function recentlyPlayed(limit: number) {
  const res = await fetch(`${SPOTIFY_BASE}/me/player/recently-played?limit=${limit}`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch recently played tracks");
  return res.json();
}

export async function getQueue() {
  const res = await fetch(`${SPOTIFY_BASE}/me/player/queue`, {
    method: "GET",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch queue");
  return res.json();
}

export async function play() {
  return fetch(`${SPOTIFY_BASE}/me/player/play`, {
    method: "PUT",
    headers: authHeaders(),
  });
}

export async function pause() {
  return fetch(`${SPOTIFY_BASE}/me/player/pause`, {
    method: "PUT",
    headers: authHeaders(),
  });
}

export async function nextTrack() {
  return fetch(`${SPOTIFY_BASE}/me/player/next`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function previousTrack() {
  return fetch(`${SPOTIFY_BASE}/me/player/previous`, {
    method: "POST",
    headers: authHeaders(),
  });
}

export async function seek(ms: number) {
  return fetch(`${SPOTIFY_BASE}/me/player/seek?position_ms=${ms}`, {
    method: "PUT",
    headers: authHeaders(),
  });
}

export async function repeat(state: "track" | "context" | "off") {
  return fetch(`${SPOTIFY_BASE}/me/player/repeat?state=${state}`, {
    method: "PUT",
    headers: authHeaders(),
  });
}

export async function shuffle(state: boolean) {
  return fetch(`${SPOTIFY_BASE}/me/player/shuffle?state=${state}`, {
    method: "PUT",
    headers: authHeaders(),
  });
}