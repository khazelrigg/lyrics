// src/types/lyrics.ts

export interface LyricsWordData {
  surface: string;
  reading?: string;
}

export interface LyricsLineData {
  text: string;
  start_time?: number;
  furiganaMode?: "always" | "hover" | "none";
  parsedWords?: LyricsWordData[];
}

export type LyricsStatus = 
  | "OK"
  | "INSTRUMENTAL"
  | "NOT_FOUND"
  | "ERROR";

export interface LyricsData {
  track_id: string;
  title: string;
  artist: string;
  album?: string;

  status: LyricsStatus;
  synced: boolean;

  lines: LyricsLineData[];

  language?: string;
  source?: string;
  url?: string;
  media?: {
    thumbnail?: string;
  };
}
