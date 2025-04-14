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
}: NowPlayingCardProps) {
  const [progressPercent, setProgressPercent] = useState(0)

  useEffect(() => {
    if (durationMs > 0) {
      setProgressPercent((progressMs / durationMs) * 100)
    }
  }, [progressMs, durationMs])

  return (
    <div className="relative w-full rounded-t-xl overflow-hidden border-t-2 border-gray-400 ">
      {/* Blurred album art background */}
      <div className="absolute inset-0 -z-10">
        <img
          src={albumArt}
          alt=""
          className="w-full h-full object-cover blur-xl brightness-[0.5] scale-110"
        />
      </div>

      {/* Foreground card */}
      <div
        className={`flex w-full backdrop-blur-md bg-white/20 ${
          isExpanded ? "flex-col items-center px-6 py-6" : "flex-row items-center px-3 py-3"
        } gap-4 transition-all duration-300`}
      >
        {/* Album Art */}
        <div className={`${isExpanded ? "w-64 h-64 mt-5" : "w-12 h-12"} transition-all duration-300`}>
          <img
            src={albumArt}
            alt="Album art"
            className="w-full h-full rounded-xl object-cover shadow-md"
          />
        </div>

        {/* Track Info & Controls */}
        <div className={`flex-1 ${isExpanded ? "text-center mt-4 w-full" : "w-[90%] overflow-hidden"}`}>
          {/* Title */}
          <div
            className={`w-full ${isExpanded ? "text-xl" : "text-sm"} font-bold overflow-hidden text-ellipsis whitespace-nowrap text-md text-white`}
            title={title}
          >
            {title}
          </div>

          {/* Artist */}
          <div
            className={`text-gray-200 font-semibold ${isExpanded ? "text-lg" : "text-sm"} w-full overflow-hidden text-ellipsis whitespace-nowrap`}
            title={artist}
          >
            {artist}
          </div>

          {/* Album */}
          <div
            className={`text-gray-300 ${isExpanded ? "text-lg" : "text-xs"} w-full overflow-hidden text-ellipsis whitespace-nowrap`}
            title={album}
          >
            {album}
          </div>

          {/* Expanded: Progress and Controls */}
          {isExpanded && (
            <>
              {/* Timestamps + Progress */}
              <div className="w-full mt-4 mb-1">
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
              <div className="flex justify-center items-center gap-10 mt-4">
                {/* Previous */}
                <button onClick={onPrev} className="w-16 h-16 text-white hover:text-yellow-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 5h2v14H6V5zm3.5 7L18 5v14l-8.5-7z" />
                  </svg>
                </button>

                {/* Play / Pause */}
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

                {/* Next */}
                <button onClick={onNext} className="w-16 h-16 text-white hover:text-yellow-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M16 5h2v14h-2V5zm-3.5 7L6 5v14l6.5-7z" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mini Progress Bar */}
        {!isExpanded && (
          <div className="absolute bottom-0 left-0 w-full h-2 bg-gray-500/30">
            <div
              className="h-full bg-green-400 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
