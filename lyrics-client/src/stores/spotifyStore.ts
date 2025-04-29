import { create } from "zustand";

interface SpotifyTrackInfo {
  title: string;
  artist: string;
  album: string;
  albumArt: string;
  trackId: string;
  url: string;
  duration: number;
}

interface SpotifyState {
  connected: boolean;
  username: string | null;
  profileImg: string | null;
  track: SpotifyTrackInfo | null;
  currentTime: number;
  isPlaying: boolean;
  lastUpdatedAt: number;

  connect: (username: string, profileImg: string | null) => void;
  disconnect: () => void;
  setTrack: (track: SpotifyTrackInfo) => void;
  setPlayback: (currentTime: number, isPlaying: boolean) => void;
}

export const useSpotifyStore = create<SpotifyState>((set) => ({
  connected: false,
  username: null,
  profileImg: null,
  track: null,
  currentTime: 0,
  isPlaying: false,
  lastUpdatedAt: Date.now(),

  connect: (username, profileImg) =>
    set({ connected: true, username, profileImg }),

  disconnect: () =>
    set({
      connected: false,
      username: null,
      profileImg: null,
      track: null,
      currentTime: 0,
      isPlaying: false,
      lastUpdatedAt: Date.now(),
    }),

  setTrack: (track) =>
    set({
      track,
      lastUpdatedAt: Date.now(),
    }),

  setPlayback: (currentTime, isPlaying) =>
    set({
      currentTime,
      isPlaying,
      lastUpdatedAt: Date.now(),
    }),
}));
