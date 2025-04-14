// LyricsSettingsContext.tsx
import { createContext, useContext, useState } from "react"

export const defaultSettings = {
  fontSize: 18,
  fontFamily: "sans",
  lineHeight: 1.6,
}

const LyricsSettingsContext = createContext({
  settings: defaultSettings,
  updateSettings: (s: Partial<typeof defaultSettings>) => {},
})

export function LyricsSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState(defaultSettings)

  function updateSettings(update: Partial<typeof defaultSettings>) {
    setSettings((prev) => ({ ...prev, ...update }))
  }

  return (
    <LyricsSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </LyricsSettingsContext.Provider>
  )
}

export const useLyricsSettings = () => useContext(LyricsSettingsContext)
