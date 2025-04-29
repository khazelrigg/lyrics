import { SpotifyRawTrack, SpotifyTrackInfo } from "@/types/spotify";

export function parseTrack(raw: SpotifyRawTrack): SpotifyTrackInfo {
  // Map the fields from a Spotify TrackObject to our SpotifyTrackInfo
  return {
    id: raw.id,
    title: raw.name,
    artist: raw.artists.map(a => a.name).join(", "),
    album: raw.album.name,
    albumArt: raw.album.images?.[0]?.url || "",
    trackId: raw.id,
    url: raw.external_urls?.spotify || "",
    duration_ms: raw.duration_ms,
  };
}