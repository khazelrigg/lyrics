const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string;
const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string;

const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";

const scope = [
  "user-read-private",
  "user-read-email",
  "user-read-playback-state",
  "user-read-currently-playing",
  "user-modify-playback-state",
].join(" ");

const ACCESS_TOKEN_KEY = "spotify_access_token";
const REFRESH_TOKEN_KEY = "spotify_refresh_token";
const EXPIRES_AT_KEY = "spotify_expires_at";
const CODE_VERIFIER_KEY = "spotify_code_verifier";

export type SpotifyTokenResponse = {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
  refresh_token?: string;
  scope: string;
};

export const currentToken = {
  get accessToken() {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  get refreshToken() {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  get expiresAt() {
    const value = localStorage.getItem(EXPIRES_AT_KEY);
    return value ? Number(value) : null;
  },

  get isExpired() {
    const expiresAt = this.expiresAt;
    if (!expiresAt) return true;

    return Date.now() >= expiresAt;
  },

  save(token: SpotifyTokenResponse) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token.access_token);

    if (token.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token.refresh_token);
    }

    const expiresAt = Date.now() + token.expires_in * 1000;
    localStorage.setItem(EXPIRES_AT_KEY, String(expiresAt));
  },

  clear() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(EXPIRES_AT_KEY);
    localStorage.removeItem(CODE_VERIFIER_KEY);
  },
};

function generateRandomString(length: number) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(randomValues)
    .map((value) => possible[value % possible.length])
    .join("");
}

async function generateCodeChallenge(codeVerifier: string) {
  const data = new TextEncoder().encode(codeVerifier);
  const hashed = await crypto.subtle.digest("SHA-256", data);

  return btoa(String.fromCharCode(...new Uint8Array(hashed)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export async function loginWithSpotify() {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  localStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);

  const authUrl = new URL(authorizationEndpoint);

  authUrl.search = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  }).toString();

  window.location.href = authUrl.toString();
}

export async function exchangeCodeForToken(code: string) {
  const codeVerifier = localStorage.getItem(CODE_VERIFIER_KEY);

  if (!codeVerifier) {
    throw new Error("Missing Spotify code verifier");
  }

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const token = (await response.json()) as SpotifyTokenResponse;
  currentToken.save(token);

  localStorage.removeItem(CODE_VERIFIER_KEY);

  return token;
}

export async function refreshSpotifyToken() {
  const refreshToken = currentToken.refreshToken;

  if (!refreshToken) {
    throw new Error("No Spotify refresh token found");
  }

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const token = (await response.json()) as SpotifyTokenResponse;
  currentToken.save(token);

  return token;
}

export async function getValidAccessToken() {
  if (!currentToken.accessToken) return null;

  if (!currentToken.isExpired) {
    return currentToken.accessToken;
  }

  const refreshed = await refreshSpotifyToken();
  return refreshed.access_token;
}

export function logoutSpotify() {
  currentToken.clear();
  window.location.href = "/";
}