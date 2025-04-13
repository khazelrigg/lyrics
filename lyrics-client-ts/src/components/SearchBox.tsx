import { useState } from "react"
import { searchLyrics, fetchLyrics } from "../services/lyricsApi"
import type { LyricsData } from "../types/lyrics"
import LyricsViewer from "./LyricsViewer"

interface SearchResult {
  song_id: string
  title: string
  artist: string
  source: string
  url?: string
  icon?: string
}

export default function SearchBox() {
  const [track, setTrack] = useState("")
  const [artist, setArtist] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [lyrics, setLyrics] = useState<LyricsData | null>(null)

  const handleSearch = async () => {
    try {
      const data = await searchLyrics(track, artist)
      setResults(data)
      setLyrics(null)
    } catch (err) {
      console.error("Search error:", err)
    }
  }

  const handleFetchLyrics = async (song_id: string, source: string) => {
    try {
      const data = await fetchLyrics(song_id, source)
      setLyrics(data)
    } catch (err) {
      console.error("Lyrics fetch error:", err)
    }
  }

  return (
    <div className="p-4 bg-white text-black rounded shadow max-w-xl mx-auto mt-8">
      <h2 className="text-xl font-semibold mb-4">Search Lyrics</h2>

      <div className="flex flex-col gap-2">
        <input
          className="p-2 border rounded"
          placeholder="Track name"
          value={track}
          onChange={(e) => setTrack(e.target.value)}
        />
        <input
          className="p-2 border rounded"
          placeholder="Artist name"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      <ul className="mt-6 space-y-2">
        {results.map((result, i) => (
          <li
            key={i}
            onClick={() => handleFetchLyrics(result.song_id, result.source)}
            className="cursor-pointer border-b pb-2 hover:bg-gray-100"
          >
            <strong>{result.title}</strong> by {result.artist} ({result.source})
          </li>
        ))}
      </ul>

      {lyrics && <LyricsViewer lyrics={lyrics} />}
    </div>
  )
}
