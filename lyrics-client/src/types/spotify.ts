// src/types/spotify.ts

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface SpotifyError {
  error: {
    status: number;
    message: string;
  };
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email: string;
  images: { url: string }[];
}

export interface SpotifyPlaybackStatus {
  is_playing: boolean;
  progress_ms: number;
  shuffle_state: boolean;
  repeat_state: "off" | "track" | "context";
  item: SpotifyRawTrack;
}

export interface SpotifyRawTrack {
  id: string;
  name: string;
  duration_ms: number;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyQueueResponse {
  currently_playing: SpotifyRawTrack;
  queue: SpotifyRawTrack[];
}

export interface SpotifyRecentlyPlayedResponse {
  items: {
    track: SpotifyRawTrack;
    played_at: string;
  }[];
}

export interface SpotifyTrackInfo {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  trackId: string;
  url: string;
  duration_ms: number;
}
