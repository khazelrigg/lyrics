
// src/components/Lyrics/LyricsViewer.tsx
import { useEffect, useRef, useState } from "react"
import type { LyricsData } from "../../types/lyrics"
import LyricsLine from "./LyricsLine"
import { useEstimatedProgress } from "../../hooks/useEstimatedProgress"

interface LyricsViewerProps {
  lyrics: LyricsData
}

export default function LyricsViewer({ lyrics }: LyricsViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const activeLineRef = useRef<HTMLLIElement>(null)
  const [isAutoScroll, setIsAutoScroll] = useState(true)
  const [userScrolled, setUserScrolled] = useState(false)

  const currentTime = useEstimatedProgress(100)

  const activeIndex = lyrics.lines.findIndex((line, i) => {
    const current = line.start_time || 0
    const next = lyrics.lines[i + 1]?.start_time ?? Infinity
    return currentTime >= current && currentTime < next
  })

  useEffect(() => {
    if (!isAutoScroll) return
    if (!activeLineRef.current || !containerRef.current) return

    const container = containerRef.current
    const line = activeLineRef.current

    const lineOffsetTop = line.offsetTop
    const lineHeight = line.offsetHeight
    const containerHeight = container.offsetHeight

    const scrollTop = lineOffsetTop - (containerHeight / 2) + (lineHeight / 2)

    const currentScroll = container.scrollTop
    const scrollDiff = Math.abs(currentScroll - scrollTop)
    if (scrollDiff > 20) {
      container.scrollTo({ top: scrollTop, behavior: "smooth" })
    }
  }, [currentTime, isAutoScroll, activeIndex])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onWheel = () => setUserScrolled(true)
    const onTouchMove = () => setUserScrolled(true)

    container.addEventListener("wheel", onWheel)
    container.addEventListener("touchmove", onTouchMove)

    return () => {
      container.removeEventListener("wheel", onWheel)
      container.removeEventListener("touchmove", onTouchMove)
    }
  }, [])

  useEffect(() => {
    if (userScrolled) {
      setIsAutoScroll(false)
      setUserScrolled(false)
    }
  }, [userScrolled])


  // Changing the flex-col will make lyrics vertical with horizontal scroll - maybe for JP vertical text

  return (
    <div className="flex flex-col items-center w-full space-y-2 max-h-screen font-lyrics">
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto rounded-xl p-4 bg-white/5 backdrop-blur scroll-smooth max-h-full"
      >
        <p className="text-2xl font-bold">
          Lyrics to {lyrics.title} by {lyrics.artist} from {lyrics.source}
        </p>
        <p className="text-sm text-gray-400">Estimated playback: {currentTime}ms</p>
        <ul className="flex flex-col items-center w-full space-y-2"> 
          {lyrics.lines.map((line, index) => {
            const isActive = index === activeIndex
            const isPast = index < activeIndex

            return (
              <LyricsLine
                key={index}
                text={line.text}
                startTime={line.start_time}
                isActive={isActive}
                isPast={isPast}
                onClick={() => {}}
                {...(isActive ? { ref: activeLineRef } : {})}
              />
            )
          })}
        </ul>
      </div>

      {!isAutoScroll && (
        <div className="sticky bottom-4 right-4 z-50 flex justify-end">
          <button
            onClick={() => setIsAutoScroll(true)}
            className="px-4 py-2 text-sm text-yellow-300 border border-yellow-300 bg-black/50 rounded-full backdrop-blur hover:bg-yellow-300 hover:text-black"
          >
            Resync
          </button>
        </div>
      )}
    </div>
  )
}
