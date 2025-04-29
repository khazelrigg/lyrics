import { create } from "zustand";

interface SpotifyState {
  connected: boolean;
  username: string | null;
  profileImg: string | null;
  connect: (username: string, profileImg: string | null) => void;
  disconnect: () => void;
}

export const useSpotifyStore = create<SpotifyState>((set) => ({
  connected: false,
  username: null,
  profileImg: null,
  connect: (username, profileImg) =>
    set({ connected: true, username, profileImg }),
  disconnect: () =>
    set({ connected: false, username: null, profileImg: null }),
}));
