import { SpotifyTrackInfo } from "@/types/spotify";

export function parseTrack(rawTrack: any): SpotifyTrackInfo {
  // Map the fields from a Spotify TrackObject to our SpotifyTrackInfo
  return {
    id: rawTrack.id,
    title: rawTrack.name,
    artist: rawTrack.artists.map((a: any) => a.name).join(", "),
    album: rawTrack.album.name,
    albumArt: rawTrack.album.images?.[0]?.url || "",
    trackId: rawTrack.id,
    url: rawTrack.external_urls?.spotify || "",
    duration_ms: rawTrack.duration_ms,
  };
}