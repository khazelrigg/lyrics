import { create } from "zustand"

export type FontFamily = "sans" | "serif" | "mono" | "rounded"
export type TextAlignment = "left" | "center" | "right"

interface FontSettings {
  fontSize: number
  fontFamily: FontFamily
  textAlignment: TextAlignment
}

interface SettingsState {
  fontSettings: FontSettings
  increaseFontSize: () => void
  decreaseFontSize: () => void
  setFontFamily: (family: FontFamily) => void
  setTextAlignment: (alignment: TextAlignment) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  fontSettings: {
    fontSize: 18,
    fontFamily: "sans",
    textAlignment: "center",
  },
  increaseFontSize: () =>
    set((state) => ({
      fontSettings: {
        ...state.fontSettings,
        fontSize: Math.min(state.fontSettings.fontSize + 2, 24),
      },
    })),
  decreaseFontSize: () =>
    set((state) => ({
      fontSettings: {
        ...state.fontSettings,
        fontSize: Math.max(state.fontSettings.fontSize - 2, 12),
      },
    })),
  setFontFamily: (family) =>
    set((state) => ({
      fontSettings: {
        ...state.fontSettings,
        fontFamily: family,
      },
    })),
  setTextAlignment: (alignment) =>
    set((state) => ({
      fontSettings: {
        ...state.fontSettings,
        textAlignment: alignment,
      },
    })),
}))
