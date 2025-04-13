// src/components/NowPlayingHeader.tsx
import SearchBox from "./SearchBox"
import ProgressBar from "./ProgressBar"

interface Props {
  spotifyTrack: string | null
  currentTime: number
  duration: number
  albumArt: string | null
}

export default function NowPlayingHeader({ spotifyTrack, currentTime, duration, albumArt }: Props) {
  return (
    <div className="mb-4 text-center">
      {albumArt && (
        <img
          src={albumArt}
          alt="Album cover"
          className="w-64 h-auto mx-auto mb-4 rounded shadow-lg object-contain"
        />
      )}

      {spotifyTrack ? (
        <p className="text-xl text-white">
          Now playing: <strong>{spotifyTrack}</strong>
        </p>
      ) : (
        <p className="text-xl text-gray-300">No Spotify song detected</p>
      )}
      <ProgressBar currentTime={currentTime} duration={duration} />

        <p className="text-xl text-white">
          <strong>{currentTime}</strong> ms
        </p>


      <div className="mt-4">
        <SearchBox />
      </div>
    </div>
  )
}
