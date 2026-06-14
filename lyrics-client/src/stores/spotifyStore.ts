// src/stores/spotifyStore.ts

import { create } from "zustand";

interface SpotifyTrackInfo {
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  trackId: string;
  url: string;
}

interface SpotifyStore {
  // Auth/profile state
  connected: boolean;
  username: string | null;
  profileImg: string | null;

  connect: (username: string, profileImg: string | null) => void;
  disconnect: () => void;

  // Playback state
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  track: SpotifyTrackInfo | null;
  lastUpdatedAt: number;

  update: (data: Partial<SpotifyStore>) => void;
  reset: () => void;
}

export const useSpotifyStore = create<SpotifyStore>((set) => ({
  connected: false,
  username: null,
  profileImg: null,

  connect: (username, profileImg) =>
    set({
      connected: true,
      username,
      profileImg,
    }),

  disconnect: () =>
    set({
      connected: false,
      username: null,
      profileImg: null,
    }),

  isPlaying: false,
  currentTime: 0,
  duration: 0,
  track: null,
  lastUpdatedAt: Date.now(),

  update: (data) => set(data),

  reset: () =>
    set({
      connected: false,
      username: null,
      profileImg: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      track: null,
      lastUpdatedAt: Date.now(),
    }),
}));