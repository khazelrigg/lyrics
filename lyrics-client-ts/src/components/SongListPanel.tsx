interface SongResult {
  song_id: string
  title: string
  artist: string
  source: string
}

interface Props {
  songs: SongResult[]
  onSongClick: (song: SongResult) => void
}

export default function SongListPanel({ songs, onSongClick }: Props) {
  return (
    <div className="p-4 bg-gray-800 h-full overflow-y-auto rounded">
      <h2 className="text-lg font-semibold mb-2 text-white">Search Results</h2>
      <ul className="space-y-2 text-sm text-gray-200">
        {songs.map((song, idx) => (
          <li
            key={idx}
            className="hover:bg-gray-700 p-2 rounded cursor-pointer"
            onClick={() => onSongClick(song)}
          >
            <div className="font-semibold">{song.title}</div>
            <div className="text-gray-400 text-xs">{song.artist} ({song.source})</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
