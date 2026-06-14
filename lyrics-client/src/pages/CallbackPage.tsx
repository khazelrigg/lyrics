// src/pages/SpotifyCallback.tsx
import { useEffect, useState } from "react";
import { exchangeCodeForToken } from "@/services/spotifyAuth";

export default function SpotifyCallback() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (!code) {
          throw new Error("Missing Spotify auth code");
        }

        await exchangeCodeForToken(code);

        window.history.replaceState({}, document.title, "/");
        window.location.href = "/";
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Spotify login failed");
      }
    }

    handleCallback();
  }, []);

  if (error) {
    return (
      <div>
        <h1>Spotify login failed</h1>
        <pre>{error}</pre>
        <a href="/">Go home</a>
      </div>
    );
  }

  return <p>Connecting Spotify...</p>;
}