import { useEffect, useState } from "react"
import axios from "axios"
import LyricsViewer from "../components/LyricsViewer"
import NowPlayingHeader from "../components/NowPlayingHeader"
import SongListPanel from "../components/SongListPanel"
import type { LyricsData } from "../types/lyrics"
import { initiateSpotifyAuth } from "../services/spotifyAuth"
import { fetchLyrics } from "../services/lyricsApi"

export default function Home() {
  const [spotifyTrack, setSpotifyTrack] = useState<string | null>(null)
  const [lastSongId, setLastSongId] = useState<string | null>(null)
  const [lyrics, setLyrics] = useState<LyricsData | null>(null)
  const [progressMs, setProgressMs] = useState<number>(0)
  const [durationMs, setDurationMs] = useState<number>(0)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [albumArt, setAlbumArt] = useState<string | null>(null)

  useEffect(() => {
    const fetchNowPlaying = async () => {
      const token = localStorage.getItem("spotify_access_token")
      if (!token) {
        initiateSpotifyAuth()
        return
      }

      try {
        const response = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 204) return
        if (response.status === 401) {
          console.warn("Spotify token expired. Reauthenticating...")
          localStorage.removeItem("spotify_access_token")
          localStorage.removeItem("spotify_token_expires")
          window.location.href = "/" // or trigger login flow again
          initiateSpotifyAuth()
        }


        const data = response.data
        console.log(data)
        const trackName = data?.item?.name
        const artistName = data?.item?.artists?.[0]?.name
        const trackId = data?.item?.id
        const progress_ms = data?.progress_ms
        const duration_ms = data?.item?.duration_ms

        const albumImage = data?.item?.album?.images?.[0]?.url

        setProgressMs(progress_ms)
        setDurationMs(duration_ms)
        setAlbumArt(albumImage)


        if (trackId && trackId !== lastSongId) {
          console.log("New song, getting lyrics")
          setSpotifyTrack(`${trackName} – ${artistName}`)
          setLastSongId(trackId)

          let spotifySongResult = {
            song_id: trackId,
            title: trackName,
            artist: artistName,
            source: "SpotifyLyricsSource",
            disabled: false,
          }


          try {
            const res = await axios.get("http://localhost:8000/lyrics", {
              params: {
                track_id: trackId,
                source: "SpotifyLyricsSource"
              }
            })
            setLyrics(res.data as LyricsData)
          } catch (err) {
            console.warn("No lyrics found for current track.")
            spotifySongResult.disabled = true


            //setLyrics(null)
          }
          const searchRes = await axios.get("http://localhost:8000/search", {
            params: {
              track: trackName,
              artist: artistName
            }
          })

          const results = [spotifySongResult, ...searchRes.data]

          // Auto-select first result if available
          if (spotifySongResult.disabled && searchRes.data.length > 0) {
            try {
              const fallbackLyrics = await fetchLyrics(results[0].song_id, results[0].source)
              console.log(fallbackLyrics)
              setLyrics(fallbackLyrics)
            } catch (fallbackErr) {
              console.warn("Fallback lyrics also failed:", fallbackErr)
            }
          }

          console.log("Song results", results)
          setSearchResults(results)

        }
      } catch (err) {
        console.error("Spotify now playing error:", err)
        initiateSpotifyAuth()
      }
    }

    fetchNowPlaying()
    const interval = setInterval(fetchNowPlaying, 500)
    return () => clearInterval(interval)
  }, [lastSongId])

  return (
    <div className="w-full min-h-screen bg-gray-900 text-white p-4">
      <NowPlayingHeader spotifyTrack={spotifyTrack} currentTime={progressMs} duration={durationMs}  albumArt={albumArt} />

      <div className="max-w-7xl mx-auto grid grid-cols-3 gap-4 mt-6">
        <div className="col-span-2 border border-green-500">
          {lyrics && <LyricsViewer lyrics={lyrics} currentTime={progressMs} />}
        </div>
        <div className="col-span-1 border border-blue-500">
          <SongListPanel songs={searchResults} onSongClick={(song) => {
            fetchLyrics(song.song_id, song.source).then(setLyrics)
          }} />

        </div>
      </div>

    </div>
  )
}
