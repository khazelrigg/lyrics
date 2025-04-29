// src/hooks/useSpotifyAuthGuard.ts

import { useEffect } from "react";
import { initiateSpotifyAuth, getTokenInfo } from "@/services/spotify/auth";

export function useSpotifyAuthGuard() {
  useEffect(() => {
    const { token, isExpired } = getTokenInfo();

    if (!token || isExpired) {
      initiateSpotifyAuth();
    }
  }, []);
}