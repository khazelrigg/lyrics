import { Lock, Music2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { loginWithSpotify } from "@/services/spotifyAuth";

function SpotifyIcon() {
  return (
    <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.306c-.215.353-.673.463-1.023.248-2.846-1.737-6.425-2.13-10.647-1.168-.403.093-.807-.16-.9-.564-.093-.404.16-.807.564-.9 4.63-1.057 8.59-.615 11.758 1.317.35.215.463.673.248 1.023zm1.465-3.263c-.27.44-.847.58-1.287.31-3.257-2.003-8.223-2.585-12.074-1.417-.497.15-1.02-.133-1.17-.63-.15-.497.133-1.02.63-1.17 4.41-1.338 9.894-.69 13.604 1.595.44.27.58.847.31 1.287zm.126-3.41c-3.905-2.32-10.334-2.533-14.078-1.396-.6.182-1.23-.16-1.41-.76-.182-.6.16-1.23.76-1.41 4.293-1.303 11.392-1.05 15.867 1.605.54.32.714 1.018.394 1.558-.32.54-1.018.714-1.558.394z" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#131313] px-5 py-10 text-white">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-black/30" />
      <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-green-500/10 blur-[120px]" />
      <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-green-500/10 blur-[120px]" />

      <section className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <div className="mb-8 animate-float">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl">
            <Music2 className="h-11 w-11 text-green-400" />
          </div>

          <h1 className="mb-2 text-3xl font-bold tracking-tight">Lyrical</h1>

          <p className="mx-auto max-w-[280px] text-base leading-relaxed text-white/65">
            Learn languages through the music you love.
          </p>
        </div>

        <div className="flex w-full flex-col items-center gap-8 rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-10 shadow-2xl backdrop-blur-2xl">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Experience the full power</h2>
            <p className="text-sm text-white/50">
              Sync your library to start learning
            </p>
          </div>

          <Button
            type="button"
            size="lg"
            onClick={loginWithSpotify}
            className="h-16 w-full rounded-full bg-[#1db954] text-sm font-bold uppercase tracking-[0.18em] text-black shadow-[0_0_25px_rgba(29,185,84,0.4)] transition-transform hover:scale-[1.02] hover:bg-[#1ed760] active:scale-[0.98]"
          >
            <SpotifyIcon />
            Connect with Spotify
          </Button>

          <div className="text-xs font-semibold uppercase tracking-wider text-white/35">
            Spotify is used to detect your playing track.
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/search")}
          className="mt-8 border-b border-transparent pb-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/40 transition-colors hover:border-white/20 hover:text-white/70"
        >
          Skip for now & explore search
        </button>

        <div className="mt-8 flex items-center gap-6 text-white/35">
          <div className="flex flex-col items-center gap-1">
            <Lock className="h-5 w-5" />
            <span className="text-[10px] font-semibold uppercase tracking-tight">
              Secure auth
            </span>
          </div>

          <div className="h-6 w-px bg-white/10" />

          <div className="flex flex-col items-center gap-1">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-[10px] font-semibold uppercase tracking-tight">
              Spotify PKCE
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}