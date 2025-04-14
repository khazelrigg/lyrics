interface SongResult {
  song_id: string
  title: string
  artist: string
  source: string
  icon?: string // Add this property for thumbnail URLs
  disabled?: boolean // This appears to be used in the Home.tsx
}

interface Props {
  songs: SongResult[]
  onSongClick: (song: SongResult) => void
}

export default function SongListPanel({ songs, onSongClick }: Props) {
  return (
    <div className="p-0 border bg-white overflow-y-auto max-h-64 rounded-xl border-yellow-500">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4">
        <h2 className="text-lg font-semibold text-gray-800">Search Results</h2>
      </div>

      {/* Scrollable list */}
      <ul className="space-y-2 text-sm text-gray-200 px-4 py-2">
        {songs.map((song, idx) => (
          <li
            key={idx}
            className={`rounded-xl shadow-md p-2 hover:bg-gray-700 cursor-pointer flex items-center ${song.disabled ? 'opacity-50' : ''}`}
            onClick={() => onSongClick(song)}
          >
            <div className="flex-shrink-0 mr-3">
              {song.icon ? (
                <img
                  src={song.icon}
                  alt={`${song.source} icon`}
                  className="w-10 h-10 rounded object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-gray-700 rounded flex items-center justify-center text-gray-800">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-grow">
              <div className="font-semibold text-m text-gray-800">{song.title}</div>
              <div className="text-gray-700 text-m">{song.artist} ({song.source})</div>
            </div>
          </li>
        ))}
      </ul>
    </div>

  )
}
