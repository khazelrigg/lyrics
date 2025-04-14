import axios from "axios"
import type { LyricsData } from "../types/lyrics"

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export async function searchLyrics(track: string, artist: string) {
  const response = await axios.get(`${BASE_URL}/search`, {
    params: { track, artist },
  })
  return response.data
}

export async function fetchLyrics(track_id: string, source: string, force_refresh: boolean = false) {
  const response = await axios.get(`${BASE_URL}/lyrics`, {
    params: { song_id: track_id, source, force_refresh },
  })
  return response.data as LyricsData
}
