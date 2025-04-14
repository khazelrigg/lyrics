// NowPlayingCard.tsx
import { useEffect, useState } from "react"

function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

interface NowPlayingCardProps {
  song_id: string
  title: string
  artist: string
  album: string
  albumArt: string
  isPlaying: boolean
  progressMs: number
  durationMs: number
  onPlayPause: () => void
  onNext: () => void
  onPrev: () => void
  isExpanded: boolean
  onClose: () => void
  onExpand: () => void
}

export default function NowPlayingCard({
  title,
  artist,
  album,
  albumArt,
  isPlaying,
  progressMs,
  durationMs,
  onPlayPause,
  onNext,
  onPrev,
  isExpanded,
  onClose,
  onExpand,
}: NowPlayingCardProps) {
  const [progressPercent, setProgressPercent] = useState(0)

  useEffect(() => {
    if (durationMs > 0) {
      setProgressPercent((progressMs / durationMs) * 100)
    }
  }, [progressMs, durationMs])

  return (
    <div className="relative overflow-hidden rounded-t-2xl w-full h-full flex flex-col text-white">
      {/* Blurred background */}
      <div className="absolute inset-0 -z-10">
        <img
          src={albumArt}
          alt=""
          className="w-full h-full object-cover blur-xl brightness-[0.4] scale-110"
        />
      </div>

      {/* Close button */}
      {isExpanded && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white text-2xl hover:text-red-300"
        >
          ×
        </button>
      )}

      {/* Click to expand overlay */}
      {!isExpanded && (
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={onExpand}
          title="Expand player"
        />
      )}

      <div className={`w-full flex-1 flex ${isExpanded ? "flex-col items-center px-6 pt-6 gap-4" : "flex-row items-center px-3 py-2 gap-4"} transition-all duration-300`}>
        {/* Album Art */}
        <div className={`${isExpanded ? "w-full max-w-xs aspect-square max-h-[40vh]" : "w-12 h-12"} transition-all duration-300 shrink-0`}>
          <img
            src={albumArt}
            alt="Album art"
            className="w-full h-full rounded-xl object-cover shadow-md"
          />
        </div>

        {/* Track Info */}
        <div className={`flex-1 ${isExpanded ? "text-center mt-2 w-full" : "w-[90%] overflow-hidden"}`}>
          <div className={`w-full ${isExpanded ? "text-xl" : "text-sm"} font-bold overflow-hidden text-ellipsis whitespace-nowrap`} title={title}>
            {title}
          </div>
          <div className={`text-gray-200 font-semibold ${isExpanded ? "text-lg" : "text-sm"} w-full overflow-hidden text-ellipsis whitespace-nowrap`} title={artist}>
            {artist}
          </div>
          <div className={`text-gray-400 ${isExpanded ? "text-lg" : "text-xs"} w-full overflow-hidden text-ellipsis whitespace-nowrap`} title={album}>
            {album}
          </div>
        </div>
      </div>

      {/* Scrollable area with all content (including image + info) */}
      {isExpanded && (
        <div className="flex-1 flex flex-col px-6 pb-[env(safe-area-inset-bottom)] pt-4 gap-6 overflow-y-auto">
          {/* Progress */}
          <div className="w-full">
            <div className="flex justify-between text-xs text-gray-200 px-1 mb-1">
              <span>{formatTime(progressMs)}</span>
              <span>{formatTime(durationMs)}</span>
            </div>
            <div className="h-2 bg-gray-500/30 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex justify-center items-center gap-10">
            <button onClick={onPrev} className="w-16 h-16 text-white hover:text-yellow-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 5h2v14H6V5zm3.5 7L18 5v14l-8.5-7z" />
              </svg>
            </button>
            <button onClick={onPlayPause} className="w-16 h-16 text-white hover:text-yellow-200">
              {isPlaying ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              )}
            </button>
            <button onClick={onNext} className="w-16 h-16 text-white hover:text-yellow-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 5h2v14h-2V5zm-3.5 7L6 5v14l6.5-7z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Collapsed Progress Bar */}
      {!isExpanded && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-500/30">
          <div
            className="h-full bg-green-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      )}
    </div>
  )
}