import { useEffect, useRef, useState } from "react"
import type { LyricsData } from "../types/lyrics"
import LyricsFull from "./LyricsFull"


import { seek } from "../services/spotifyPlayer"

interface Props {
  lyrics: LyricsData
  currentTime: number // in ms
}

export default function LyricsViewer({ lyrics, currentTime }: Props) {
  const activeLineRef = useRef<HTMLLIElement>(null)
  const [isAutoScroll, setIsAutoScroll] = useState(true)
  const [isAboveViewport, setIsAboveViewport] = useState(false)
  const [isBelowViewport, setIsBelowViewport] = useState(false)

  // Disable autoscroll on user interaction
  useEffect(() => {
    const handlePointerDown = () => setIsAutoScroll(false)
    window.addEventListener("pointerdown", handlePointerDown)
    window.addEventListener("wheel", handlePointerDown)
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown)
      window.removeEventListener("wheel", handlePointerDown)
    }
  }, [])

  // Scroll to active lyric line when synced and autoscroll is enabled
  useEffect(() => {
    if (!lyrics.synced || !isAutoScroll) return
    if (!activeLineRef.current) return

    const line = activeLineRef.current
    const targetY = line.offsetTop - window.innerHeight / 3
    const currentY = window.scrollY
    const distance = Math.abs(currentY - targetY)

    if (distance > 40) {
      window.scrollTo({ top: targetY, behavior: "smooth" })
    }
  }, [currentTime, isAutoScroll, lyrics.synced])

  // Detect if active line is above or below viewport
  useEffect(() => {
    const line = activeLineRef.current
    if (!line) return

    const aboveObserver = new IntersectionObserver(
      ([entry]) => {
        setIsAboveViewport(!entry.isIntersecting && entry.boundingClientRect.top < 0)
      },
      { threshold: 0 }
    )

    const belowObserver = new IntersectionObserver(
      ([entry]) => {
        setIsBelowViewport(!entry.isIntersecting && entry.boundingClientRect.bottom > window.innerHeight)
      },
      { threshold: 0 }
    )

    aboveObserver.observe(line)
    belowObserver.observe(line)

    return () => {
      aboveObserver.disconnect()
      belowObserver.disconnect()
    }
  }, [activeLineRef.current, currentTime])

  // Find active line (skip if not synced)
  let activeLineIndex = -1
  if (lyrics.synced) {
    lyrics.lines.forEach((line, i) => {
      const isLast = i === lyrics.lines.length - 1
      const startsBeforeNow = currentTime >= line.start_time
      const endsAfterNow = isLast || currentTime < lyrics.lines[i + 1]?.start_time
      if (startsBeforeNow && endsAfterNow) {
        activeLineIndex = i
      }
    })
  }

  const activeLine = lyrics.lines[activeLineIndex]

  return (
    <>
      {/* Sticky bar for active lyric (top or bottom based on scroll) */}
      {!isAutoScroll && activeLine?.text && (
        <>
          {isAboveViewport && (
            <button
              onClick={() => setIsAutoScroll(true)}
              className="sticky top-16 z-40 w-full bg-white/90 backdrop-blur px-4 py-2 shadow"
            >
              <p className="text-center text-lg font-semibold text-blue-600">
                {activeLine.text}
              </p>
            </button>
          )}

          {isBelowViewport && (
            <button
              onClick={() => setIsAutoScroll(true)}
              className="fixed bottom-16 left-0 w-full z-40 bg-white/90 backdrop-blur px-4 py-2 shadow border-t"
            >
              <p className="text-center text-lg font-semibold text-blue-600">
                {activeLine.text}
              </p>
            </button>
          )}
    </>
  )}

      {/* Lyrics content */}
      <div className="mt-8 bg-white rounded p-4 relative">
        <h3 className="text-xl font-semibold mb-4">
          {lyrics.title || "Unknown Title"} – {lyrics.artist || "Unknown Artist"}
        </h3>

        <LyricsFull
          lines={lyrics.lines}
          currentTime={currentTime}
          synced={lyrics.synced}
          onActiveRef={el => {
            if (el) activeLineRef.current = el
          }}
          onLineClick={(ms) => {
            console.log("Seeking to ", ms)
            seek(ms)
          }}
        />

      </div>
    </>
  )
}
