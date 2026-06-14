import { useEffect, useState } from "react";
import {
  currentToken,
  exchangeCodeForToken,
  getValidAccessToken,
  loginWithSpotify,
  logoutSpotify,
} from "@/services/spotifyAuth.ts";

type SpotifyUser = {
  display_name: string | null;
  email?: string;
  images?: { url: string }[];
};

export default function SpotifyLogin() {
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchSpotifyUser() {
    const accessToken = await getValidAccessToken();

    if (!accessToken) {
      setUser(null);
      return;
    }

    const response = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = (await response.json()) as SpotifyUser;
    setUser(data);
  }

  useEffect(() => {
    async function initAuth() {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        if (code) {
          await exchangeCodeForToken(code);

          const url = new URL(window.location.href);
          url.searchParams.delete("code");
          window.history.replaceState({}, document.title, url.toString());
        }

        if (currentToken.accessToken) {
          await fetchSpotifyUser();
        }
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Spotify login failed");
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  if (loading) {
    return <button disabled>Checking Spotify...</button>;
  }

  if (error) {
    return (
      <div>
        <p style={{ color: "red" }}>Spotify auth error</p>
        <pre>{error}</pre>
        <button onClick={logoutSpotify}>Reset Spotify login</button>
      </div>
    );
  }

  if (!user) {
    return <button onClick={loginWithSpotify}>Connect Spotify</button>;
  }

  return (
    <div>
      {user.images?.[0]?.url && (
        <img
          src={user.images[0].url}
          alt="Spotify profile"
          width={40}
          height={40}
        />
      )}

      <p>Signed in as {user.display_name ?? "Spotify user"}</p>

      <button onClick={logoutSpotify}>Log out</button>
    </div>
  );
}