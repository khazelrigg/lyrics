// LyricsSettingsPanel.tsx
import { useLyricsSettings } from "../context/LyricsSettingsContext"

export default function LyricsSettingsPanel() {
  const { settings, updateSettings } = useLyricsSettings()

  return (
    <div className="p-4 space-y-4">
      <label className="block">
        Font Size:
        <input
          type="range"
          min={16}
          max={48}
          value={settings.fontSize}
          onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
        />
      </label>

      <label className="block">
        Font Family:
        <select
          value={settings.fontFamily}
          onChange={(e) => updateSettings({ fontFamily: e.target.value })}
        >
          <option value="sans">Sans</option>
          <option value="serif">Serif</option>
          <option value="mono">Mono</option>
        </select>
      </label>
    </div>
  )
}
