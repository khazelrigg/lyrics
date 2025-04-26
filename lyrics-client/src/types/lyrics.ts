// src/types/lyrics.ts

export interface LyricsWordData {
  surface: string
  reading?: string
}

export interface LyricsLineData {
    text: string
    start_time?: number
    furiganaMode?: "always" | "hover" | "none";
    parsedWords?: LyricsWordData[]
}

export interface LyricsData {
    track_id: string
    title: string
    artist: string
    album?: string
    lines: LyricsLineData[]
    synced: boolean
    language?: string
    source?: string
    url?: string
    media?: {
      thumbnail?: string
    }
  }
