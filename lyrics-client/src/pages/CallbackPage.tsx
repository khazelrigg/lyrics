import { useEffect, useState } from "react";
import { extractTokenFromUrl } from "../services/spotifyAuth";
import { useNavigate } from "react-router-dom";

export default function CallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const token = extractTokenFromUrl();
      if (token) {
        // ✅ Redirect after token is saved
        navigate("/");
      } else {
        setError("No access token found in URL.");
      }
    } catch (err) {
      setError("Failed to extract token.");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white">
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
