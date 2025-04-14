// src/services/spotifyAuth.ts

const generateCodeVerifier = (length: number) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    const values = crypto.getRandomValues(new Uint8Array(length))
    return values.reduce((acc, x) => acc + possible[x % possible.length], '')
  }

  const sha256 = async (plain: string) => {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest("SHA-256", data)
  }

  const base64URLEncode = (buffer: ArrayBuffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")
  }

  export const initiateSpotifyAuth = async () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
    const redirectUri = "http://localhost:5173/callback"
    const codeVerifier = generateCodeVerifier(64)

    const hashed = await sha256(codeVerifier)
    const codeChallenge = base64URLEncode(hashed)

    localStorage.setItem("code_verifier", codeVerifier)

    const params = new URLSearchParams({
      client_id: clientId,
      response_type: "code",
      redirect_uri: redirectUri,
      code_challenge_method: "S256",
      code_challenge: codeChallenge,
      scope: " user-read-playback-state user-modify-playback-state user-read-currently-playing",
    })

    window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`
  }
