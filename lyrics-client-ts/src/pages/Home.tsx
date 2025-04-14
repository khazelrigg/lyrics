import { useEffect, useState } from "react"
import axios from "axios"
import AppHeader from "../components/AppHeader"
import LyricsViewer from "../components/LyricsViewer"
import SongListPanel from "../components/SongListPanel"
import NowPlayingDrawer from "../components/NowPlayingDrawer"
import { useSpotifyAuth } from "../hooks/useSpotifyAuth"
import { play, pause, nextTrack, previousTrack } from "../services/spotifyPlayer"


import { fetchLyrics } from "../services/lyricsApi"
import type { LyricsData } from "../types/lyrics"
import LyricsSettingsPanel from "../components/LyricsSettingsPanel"

export default function Home() {
  const token = useSpotifyAuth()
  const [spotifyTrack, setSpotifyTrack] = useState<string | null>(null)
  const [lastSongId, setLastSongId] = useState<string | null>(null)
  const [lyrics, setLyrics] = useState<LyricsData | null>(null)
  const [progressMs, setProgressMs] = useState<number>(0)
  const [durationMs, setDurationMs] = useState<number>(0)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [albumArt, setAlbumArt] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [showSettings, setShowSettings] = useState(false)


  const handlePlayPause = () => {
    isPlaying ? pause() : play()
  }

  const handleNext = () => nextTrack()
  const handlePrev = () => previousTrack()

  useEffect(() => {
    if (!token) return

    const fetchNowPlaying = async () => {
      try {
        const response = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (response.status === 204) return
        if (response.status === 401) {
          console.warn("Spotify token expired. Please reauthenticate.")
          localStorage.removeItem("spotify_access_token")
          localStorage.removeItem("spotify_token_expires")
          window.location.href = "/"
          return
        }

        const data = response.data
        const trackName = data?.item?.name
        const artistName = data?.item?.artists?.[0]?.name
        const trackId = data?.item?.id
        const progress_ms = data?.progress_ms
        const duration_ms = data?.item?.duration_ms
        const albumImage = data?.item?.album?.images?.[0]?.url
        const albumName = data?.item?.album?.name || ""

        setIsPlaying(data?.is_playing ?? false)
        setProgressMs(progress_ms)
        setDurationMs(duration_ms)
        setAlbumArt(albumImage)

        if (trackId && trackId !== lastSongId) {
          setSpotifyTrack(`${trackName} – ${artistName}`)
          setLastSongId(trackId)

          const spotifySongResult = {
            song_id: trackId,
            title: trackName,
            artist: artistName,
            source: "SpotifyLyricsSource",
            icon: "src/assets/spotify_icon.png",
            disabled: false,
          }

          try {
            const res = await axios.get("http://localhost:8000/lyrics", {
              params: {
                song_id: trackId,
                source: "SpotifyLyricsSource"
              }
            })

            const lyricsData = res.data as LyricsData
            lyricsData.title = trackName
            lyricsData.artist = artistName
            lyricsData.album = albumName
            setLyrics(lyricsData)
          } catch (err) {
            console.warn("No lyrics found for current track.")
            spotifySongResult.disabled = true

            const fallbackLyrics: LyricsData = {
              title: trackName,
              artist: artistName,
              album: albumName,
              synced: false,
              lines: []
            }
            setLyrics(fallbackLyrics)
          }

          const searchRes = await axios.get("http://localhost:8000/search", {
            params: { track: trackName, artist: artistName }
          })

          const results = [spotifySongResult, ...searchRes.data]

          if (spotifySongResult.disabled && searchRes.data.length > 0) {
            try {
              const fallbackLyrics = await fetchLyrics(results[0].song_id, results[0].source)
              setLyrics(fallbackLyrics)
            } catch (fallbackErr) {
              console.warn("Fallback lyrics also failed:", fallbackErr)
            }
          }

          setSearchResults(results)
        }
      } catch (err) {
        console.error("Spotify now playing error:", err)
      }
    }

    fetchNowPlaying()
    const interval = setInterval(fetchNowPlaying, 500)
    return () => clearInterval(interval)
  }, [token, lastSongId])

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800">
      <AppHeader />


      <div className="relative bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="fixed top-4 right-32 z-50 bg-white dark:bg-black text-sm px-4 py-2 rounded shadow hover:bg-gray-200 dark:hover:bg-neutral-800"
        >
          {showSettings ? "Close Settings" : "Lyrics Settings"}
        </button>

        {showSettings && (
          <div className="fixed top-16 right-4 z-50 w-80 max-w-full bg-white dark:bg-neutral-900 p-4 shadow-lg rounded-lg border border-neutral-300 dark:border-neutral-700">
            <LyricsSettingsPanel />
          </div>
        )}
        </div>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 space-y-6 max-w-7xl w-full mx-auto">
        {lyrics && <LyricsViewer lyrics={lyrics} currentTime={progressMs} />}


        {/* Optional: toggle to show/hide this in mobile */}
        <div className="block md:hidden">
          <SongListPanel
            songs={searchResults}
            onSongClick={(song) => fetchLyrics(song.song_id, song.source).then(setLyrics)}
          />
        </div>


      </main>

      {/* Sticky footer */}
      <footer className="sticky bottom-0 w-full border-t z-10">
        <div className="max-w-7xl mx-auto px-4 py-2">


          <NowPlayingDrawer
            song_id={lastSongId || ""}
            title={lyrics?.title || "Unknown Title"}
            artist={lyrics?.artist || "Unknown Artist"}
            album={lyrics?.album || ""}
            albumArt={albumArt || ""}
            isPlaying={isPlaying}
            progressMs={progressMs}
            durationMs={durationMs}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrev={handlePrev}
            isExpanded={false}
          />

        </div>
      </footer>
    </div>
  )
}
