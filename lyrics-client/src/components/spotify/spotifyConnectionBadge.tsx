// src/components/status/SpotifyConnectionBadge.tsx

import { useSpotifyStore } from "@/stores/spotifyStore";
import { ConnectionBadge } from "@/components/ui/connectionBadge";

type SpotifyConnectionBadgeProps = {
  pulse?: boolean;
};

export function SpotifyConnectionBadge({
  pulse = true,
}: SpotifyConnectionBadgeProps) {
  const connected = useSpotifyStore((s) => s.connected);

  return (
    <ConnectionBadge
      status={connected ? "connected" : "disconnected"}
      label={connected ? "Spotify Connected" : "Spotify Offline"}
      pulse={pulse}
    />
  );
}