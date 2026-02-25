// src/services/spotify/auth.ts
/**
 * Spotify Authorization Code Flow with PKCE (SPA-friendly).
 * Debug-enhanced version.
 */

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

// Optional debug flag (defaults true in dev)
const DEBUG_SPOTIFY_AUTH =
  (import.meta.env.VITE_DEBUG_SPOTIFY_AUTH ?? (import.meta.env.DEV ? "true" : "false")) === "false";

const SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
].join(" ");

// Storage keys
const TOKEN_KEY = "spotify_access_token";
const REFRESH_TOKEN_KEY = "spotify_refresh_token";
const EXPIRES_AT_KEY = "spotify_expires_at";

const PKCE_VERIFIER_KEY = "spotify_pkce_code_verifier";
const STATE_KEY = "spotify_oauth_state";

/** ---------- Debug helpers ---------- **/

function dlog(...args: any[]) {
  if (DEBUG_SPOTIFY_AUTH) console.log("[spotify-auth]", ...args);
}
function dwarn(...args: any[]) {
  if (DEBUG_SPOTIFY_AUTH) console.warn("[spotify-auth]", ...args);
}
function derr(...args: any[]) {
  if (DEBUG_SPOTIFY_AUTH) console.error("[spotify-auth]", ...args);
}

function mask(value: string | null | undefined, keep = 6) {
  if (!value) return value;
  if (value.length <= keep * 2) return `${value.slice(0, keep)}…`;
  return `${value.slice(0, keep)}…${value.slice(-keep)}`;
}

function validateRedirectUri(uri: string) {
  const issues: string[] = [];

  if (uri !== uri.trim()) issues.push("Redirect URI has leading/trailing whitespace.");
  if (uri.startsWith('"') || uri.endsWith('"') || uri.startsWith("'") || uri.endsWith("'"))
    issues.push("Redirect URI appears to include quotes. Remove quotes in .env.");

  let parsed: URL | null = null;
  try {
    parsed = new URL(uri);
  } catch {
    issues.push("Redirect URI is not a valid URL.");
    return issues;
  }

  const isLocalhost =
    parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1" || parsed.hostname === "[::1]";
  const isHttps = parsed.protocol === "https:";

  // Spotify generally allows http only for localhost; IP/LAN http is often rejected.
  if (parsed.protocol === "http:" && !isLocalhost) {
    issues.push("Redirect URI is http but not localhost (Spotify will treat this as insecure).");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    issues.push(`Redirect URI uses unusual protocol ${parsed.protocol}`);
  }

  // Common dev expectation
  if (isLocalhost && parsed.protocol !== "http:" && !isHttps) {
    issues.push("Localhost redirect should usually be http://localhost:PORT/...");
  }

  if (!parsed.pathname || parsed.pathname === "/") {
    dwarn(
      "Redirect URI path is '/'. If your callback route is '/callback', you must set it explicitly."
    );
  }

  return issues;
}

/** ---------- PKCE helpers ---------- **/

function base64UrlEncode(bytes: ArrayBuffer): string {
  const uint8 = new Uint8Array(bytes);
  let str = "";
  for (let i = 0; i < uint8.length; i++) str += String.fromCharCode(uint8[i]);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function randomString(byteLength = 64): string {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes.buffer);
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
}

async function createCodeChallenge(verifier: string): Promise<string> {
  const hashed = await sha256(verifier);
  return base64UrlEncode(hashed);
}

/** ---------- Token storage ---------- **/

export function saveTokenInfo(token: string, expiresIn: number, refreshToken?: string) {
  const expiresAt = Date.now() + expiresIn * 1000;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(EXPIRES_AT_KEY, expiresAt.toString());
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  dlog("Saved token info", {
    access_token: mask(token),
    expires_in: expiresIn,
    expires_at: new Date(expiresAt).toISOString(),
    refresh_token: refreshToken ? mask(refreshToken) : null,
  });
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

// Recommended split clears:
export function clearAccessTokenOnly() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
  dlog("Cleared access token only");
}

export function clearAllSpotifyTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(EXPIRES_AT_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
  dlog("Cleared ALL tokens + PKCE session items");
}

// Back-compat name (optional): if other files still call clearAccessToken()
export function clearAccessToken() {
  clearAllSpotifyTokens();
}

export function isTokenExpired(): boolean {
  const expiresAtStr = localStorage.getItem(EXPIRES_AT_KEY);
  if (!expiresAtStr) return true;

  const expiresAt = parseInt(expiresAtStr, 10);
  if (Number.isNaN(expiresAt)) return true;

  return Date.now() >= expiresAt;
}

export function hasValidToken(): boolean {
  const token = getAccessToken();
  return !!token && !isTokenExpired();
}

export function getTokenInfo() {
  return {
    token: mask(getAccessToken()),
    isExpired: isTokenExpired(),
    hasRefreshToken: !!getRefreshToken(),
    expiresAt: localStorage.getItem(EXPIRES_AT_KEY),
  };
}

/** ---------- Flow: start auth ---------- **/

export async function initiateSpotifyAuth() {
  dlog("initiateSpotifyAuth called");
  dlog("Env check", {
    clientIdPresent: !!SPOTIFY_CLIENT_ID,
    clientId: mask(SPOTIFY_CLIENT_ID),
    redirectUri: REDIRECT_URI,
    scopes: SCOPES,
    windowOrigin: window.location.origin,
    windowPath: window.location.pathname,
  });

  if (!SPOTIFY_CLIENT_ID) throw new Error("Missing VITE_SPOTIFY_CLIENT_ID");
  if (!REDIRECT_URI) throw new Error("Missing VITE_SPOTIFY_REDIRECT_URI");

  const redirectIssues = validateRedirectUri(REDIRECT_URI);
  if (redirectIssues.length) {
    dwarn("Redirect URI validation issues:", redirectIssues);
    dwarn("Spotify Dashboard must contain EXACT redirect URI:", REDIRECT_URI);
  }

  const codeVerifier = randomString(64);
  const codeChallenge = await createCodeChallenge(codeVerifier);
  const state = randomString(16);

  sessionStorage.setItem(PKCE_VERIFIER_KEY, codeVerifier);
  sessionStorage.setItem(STATE_KEY, state);

  dlog("PKCE generated", {
    codeVerifier: mask(codeVerifier),
    codeChallenge: mask(codeChallenge),
    state: mask(state),
  });

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    state,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  dlog("Authorize URL:", authUrl);

  window.location.href = authUrl;
}

/** ---------- Flow: handle callback + exchange ---------- **/

type TokenResponse = {
  access_token: string;
  token_type: string;
  scope?: string;
  expires_in: number;
  refresh_token?: string;
};

async function exchangeCodeForToken(code: string, codeVerifier: string): Promise<TokenResponse> {
  dlog("Exchanging code for token", {
    code: mask(code),
    codeVerifier: mask(codeVerifier),
    redirectUri: REDIRECT_URI,
  });

  const body = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    code_verifier: codeVerifier,
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    derr("Token exchange failed", { status: res.status, body: text });
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  const json = JSON.parse(text) as TokenResponse;
  dlog("Token exchange success", {
    access_token: mask(json.access_token),
    expires_in: json.expires_in,
    refresh_token: json.refresh_token ? mask(json.refresh_token) : null,
    token_type: json.token_type,
    scope: json.scope,
  });

  return json;
}

export async function handleSpotifyCallback(): Promise<string | null> {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  dlog("handleSpotifyCallback called", {
    href: window.location.href,
    codePresent: !!params.get("code"),
    state: mask(params.get("state")),
    error: params.get("error"),
  });

  if (params.get("error") === "access_denied") {
    dwarn("Spotify authorization was denied by user.");
    return null;
  }

  const code = params.get("code");
  const returnedState = params.get("state");
  if (!code) {
    dwarn("No code in callback URL. Not a Spotify callback?");
    return null;
  }

  const expectedState = sessionStorage.getItem(STATE_KEY);
  dlog("State check", {
    expectedState: mask(expectedState),
    returnedState: mask(returnedState),
    match: !!expectedState && !!returnedState && returnedState === expectedState,
  });

  if (!expectedState || !returnedState || returnedState !== expectedState) {
    throw new Error("OAuth state mismatch. Possible CSRF or stale callback.");
  }

  const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY);
  dlog("Verifier check", {
    verifierPresent: !!codeVerifier,
    verifier: mask(codeVerifier),
  });

  if (!codeVerifier) {
    throw new Error("Missing PKCE code verifier (sessionStorage).");
  }

  const tokenRes = await exchangeCodeForToken(code, codeVerifier);
  saveTokenInfo(tokenRes.access_token, tokenRes.expires_in, tokenRes.refresh_token);

  // Cleanup one-time PKCE items + URL params
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);

  url.searchParams.delete("code");
  url.searchParams.delete("state");
  url.searchParams.delete("error");
  window.history.replaceState({}, document.title, url.toString());

  dlog("Callback handled successfully; cleaned URL");

  return tokenRes.access_token;
}

/** ---------- Refresh ---------- **/

type RefreshResponse = {
  access_token: string;
  token_type: string;
  scope?: string;
  expires_in: number;
  refresh_token?: string;
};

async function refreshAccessToken(refreshToken: string): Promise<RefreshResponse> {
  dlog("Refreshing access token", { refreshToken: mask(refreshToken) });

  const body = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    derr("Token refresh failed", { status: res.status, body: text });
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  const json = JSON.parse(text) as RefreshResponse;
  dlog("Token refresh success", {
    access_token: mask(json.access_token),
    expires_in: json.expires_in,
    refresh_token: json.refresh_token ? mask(json.refresh_token) : null,
  });

  return json;
}

export async function getValidAccessToken(): Promise<string | null> {
  const token = getAccessToken();
  const expired = isTokenExpired();

  dlog("getValidAccessToken", {
    accessTokenPresent: !!token,
    accessToken: mask(token),
    isExpired: expired,
    hasRefreshToken: !!getRefreshToken(),
  });

  if (token && !expired) return token;

  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  // Clear only the access token so we don't get stuck with a bad one
  clearAccessTokenOnly();

  const refreshed = await refreshAccessToken(refreshToken);
  saveTokenInfo(refreshed.access_token, refreshed.expires_in, refreshed.refresh_token ?? refreshToken);

  return refreshed.access_token;
}