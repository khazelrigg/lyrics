import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleSpotifyCallback } from "@/services/spotify/auth";

export default function CallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await handleSpotifyCallback();

        if (cancelled) return;

        if (token) {
          // ✅ Tokens are saved inside handleSpotifyCallback()
          navigate("/");
        } else {
          // user denied OR callback URL didn't include code
          setError("Spotify authorization was cancelled or no code was returned.");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            `Spotify authorization failed: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      {error ? (
        <div className="text-red-400 text-lg">{error}</div>
      ) : (
        <>
          <p className="text-lg mb-2">Authorizing with Spotify...</p>
          <p className="text-sm text-gray-400">You’ll be redirected shortly.</p>
        </>
      )}
    </div>
  );
}