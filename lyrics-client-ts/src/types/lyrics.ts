export interface LyricsLine {
    text: string
    start_time?: number
  }

  export interface LyricsData {
    track_id: string
    title: string
    artist: string
    album?: string
    lines: LyricsLine[]
    synced: boolean
    language?: string
    source?: string
    url?: string
    media?: {
      thumbnail?: string
    }
  }
