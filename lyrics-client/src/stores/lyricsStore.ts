import { create } from "zustand";
import type { LyricsData } from "@/types/lyrics";

interface LyricsState {
  lyrics: LyricsData | null;
  loading: boolean;
  error: string | null;
  setLyrics: (lyrics: LyricsData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useLyricsStore = create<LyricsState>((set) => ({
  lyrics: null,
  loading: false,
  error: null,
  setLyrics: (lyrics) => set({ lyrics }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  reset: () => set({ lyrics: null, loading: false, error: null }),
}));
