import type { LyricsLine } from "../types/lyrics"
import { useLyricsSettings } from "../context/LyricsSettingsContext"


interface Props {
  lines: LyricsLine[]
  currentTime: number
  synced: boolean
  onActiveRef: (el: HTMLLIElement | null) => void
  onLineClick?: (ms: number) => void
}

export default function LyricsFull({ lines, currentTime, synced, onActiveRef, onLineClick }: Props) {
  const { settings } = useLyricsSettings()
  return (
    <ul className="space-y-1 text-gray-800">
      {lines.map((line, i) => {
        const isLast = i === lines.length - 1
        const startsBeforeNow = currentTime >= line.start_time
        const endsAfterNow =
          isLast || currentTime < lines[i + 1]?.start_time
        const isActive = synced && startsBeforeNow && endsAfterNow

        return (
          <li
            style={{
              fontSize: `${settings.fontSize}px`,
              fontFamily: settings.fontFamily,
              lineHeight: settings.lineHeight,
            }}
            key={i}
            ref={isActive ? onActiveRef : null}
            onClick={() => {
              if (synced && onLineClick) {
                onLineClick(line.start_time)
              }
            }}
            className={`p-2 cursor-pointer transition-all duration-300 ease-in-out ${
              isActive
                ? "bg-yellow-200 text-black text-lg font-bold"
                : "text-gray-800 text-lg hover:bg-gray-100"
            }`}
            title={synced ? "Click to jump to this line" : undefined}
          >
            {line.text || "♪"}
          </li>
        )
      })}
    </ul>
  )
}
