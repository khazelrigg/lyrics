// src/pages/SearchPage.tsx
import { useState } from "react"
//import LyricsViewer from "../components/Lyrics/LyricsViewer"

export default function SearchPage() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<any[]>([])
  const [selectedLyrics, setSelectedLyrics] = useState<any>(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    const res = await fetch(`/api/search?query=${encodeURIComponent(query)}`)
    const data = await res.json()
    setResults(data.results || [])
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">🔍 Search Lyrics</h1>

      <div className="mb-4">
        <input
          type="text"
          className="p-2 rounded border border-gray-300 text-black w-full max-w-md"
          placeholder="Enter song title or artist..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSearch}
        >
          Search
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Results</h2>
        <ul className="space-y-2">
          {results.map((result, i) => (
            <li
              key={i}
              className="bg-white/10 hover:bg-white/20 p-3 rounded cursor-pointer"
              onClick={() => setSelectedLyrics(result)}
            >
              <div className="font-bold">{result.title}</div>
              <div className="text-sm text-gray-300">{result.artist}</div>
            </li>
          ))}
        </ul>
      </div>

      {selectedLyrics && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">📄 Lyrics Viewer</h2>
          {/*<LyricsViewer lyrics={selectedLyrics} currentTime={0} />*/}
        </div>
      )}
    </div>
  )
}