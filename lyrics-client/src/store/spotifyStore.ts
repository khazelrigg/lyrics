// src/store/spotifyStore.ts
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
  isPlaying: boolean;
  currentTime: number; // in ms
  duration: number; // in ms
  track: SpotifyTrackInfo | null;
  lastUpdatedAt: number; // timestamp when last polled

  update: (data: Partial<SpotifyStore>) => void;
  reset: () => void;
}

export const useSpotifyStore = create<SpotifyStore>((set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  track: null,
  lastUpdatedAt: Date.now(),

  update: (data) => set(data),
  reset: () =>
    set({
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      track: null,
      lastUpdatedAt: Date.now(),
    }),
}));
