import { SpotifyUserProfile, SpotifyPlaybackStatus, SpotifyRecentlyPlayedResponse, SpotifyDevicesResponse, SpotifyQueueResponse } from "@/types/spotify";
import { spotifyFetch } from "./fetch";

export async function getUserProfile(): Promise<SpotifyUserProfile | null> {
  return spotifyFetch("/me");
}

export async function getPlaybackStatus(): Promise<SpotifyPlaybackStatus | null> {
  return spotifyFetch("/me/player");
}

export async function recentlyPlayed(limit: number): Promise<SpotifyRecentlyPlayedResponse> {
  return spotifyFetch(`/me/player/recently-played?limit=${limit}`);
}

export async function getDevices(): Promise<SpotifyDevicesResponse>{
  return spotifyFetch("/me/player/devices")
}

export async function getQueue(): Promise<SpotifyQueueResponse> {
  return spotifyFetch("/me/player/queue");
}

export async function play() {
  return spotifyFetch("/me/player/play", { method: "PUT" });
}

export async function pause() {
  return spotifyFetch("/me/player/pause", { method: "PUT" });
}

export async function nextTrack() {
  return spotifyFetch("/me/player/next", { method: "POST" });
}

export async function previousTrack() {
  return spotifyFetch("/me/player/previous", { method: "POST" });
}

export async function seek(ms: number) {
  return spotifyFetch(`/me/player/seek?position_ms=${ms}`, { method: "PUT" });
}

export async function repeat(state: "track" | "context" | "off") {
  return spotifyFetch(`/me/player/repeat?state=${state}`, { method: "PUT" });
}

export async function shuffle(state: boolean) {
  return spotifyFetch(`/me/player/shuffle?state=${state}`, { method: "PUT" });
}


/**
 * Transfer playback to a specific device (e.g. your browser device from Web Playback SDK)
 * `deviceIds` is usually a single device id.
 */
export async function transferPlayback(
  deviceIds: string[],
  options?: { play?: boolean }
): Promise<null> {
  return spotifyFetch("/me/player", {
    method: "PUT",
    body: JSON.stringify({
      device_ids: deviceIds,
      ...(options?.play !== undefined ? { play: options.play } : {}),
    }),
  });
}