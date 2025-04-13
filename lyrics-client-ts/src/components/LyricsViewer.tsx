import { useEffect, useRef } from "react"
import type { LyricsData } from "../types/lyrics"

interface Props {
  lyrics: LyricsData
  currentTime: number // in ms
}

export default function LyricsViewer({ lyrics, currentTime }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLLIElement>(null)

  //useEffect(() => {
  //  if (lyrics.synced && activeLineRef.current && containerRef.current) {
  //    const container = containerRef.current
  //    const line = activeLineRef.current
  //    const topOffset = line.offsetTop - container.clientHeight / 2 + line.clientHeight / 2
  //    container.scrollTo({ top: topOffset, behavior: "smooth" })
  //  }
  //}, [currentTime])

  return (
    <div
      ref={containerRef}
      className="mt-8 bg-gray-800 rounded p-4 max-h-[70vh] overflow-y-auto"
    >
      <h3 className="text-xl font-semibold mb-4">
        {lyrics.title} – {lyrics.artist}
      </h3>

      <ul className="space-y-1">
        {lyrics.lines.map((line, i) => {
          const isLast = i === lyrics.lines.length - 1
          const startsBeforeNow = currentTime >= line.start_time
          const endsAfterNow = isLast || currentTime < lyrics.lines[i + 1].start_time
          const isActive = lyrics.synced && startsBeforeNow && endsAfterNow

          return (
            <li
              key={i}
              ref={isActive ? activeLineRef : null}
              className={`transition-all duration-300 ease-in-out ${
                isActive ? "text-red-500 text-2xl font-bold" : "text-gray-200 text-2xl"
              }`}
            >
              {line.text}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
