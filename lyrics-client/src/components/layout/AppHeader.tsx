// src/components/layout/AppHeader.tsx

import {
  LogIn,
  ArrowLeft,
  ChevronDown,
  CloudOff,
  MoreVertical,
  Search,
  Settings,
  Music,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { loginWithSpotify, logoutSpotify } from "@/services/spotifyAuth";
import { useSpotifyStore } from "@/stores/spotifyStore";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NowPlayingStatus from "../NowPlaying/NowPlayingCard";
import { SpotifyConnectionBadge } from "../spotify/spotifyConnectionBadge";

type HeaderStatus = {
  label: string;
  variant?: "default" | "error" | "success";
};

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showCollapse?: boolean;
  status?: HeaderStatus;
};

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  showCollapse = false,
  status,
}: AppHeaderProps) {
  const navigate = useNavigate();
  const connected = useSpotifyStore((s) => s.connected);
  const username = useSpotifyStore((s) => s.username);
  //const disconnect = useSpotifyStore((s) => s.disconnect);

  console.log(connected, username);
  const handleSpotifyLogout = () => {
    logoutSpotify();
    //disconnect();
  };

  const StatusIcon = status?.variant === "error" ? CloudOff : undefined;

  return (
    <header className="relative z-50 grid grid-cols-3 h-20 w-full items-center border-b text-primary">
      <div className="flex min-w-0 items-center gap-2 justify-self-start"> 
        {showBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full hover:text-primary-400 hover:scale-120"
          >
            <ArrowLeft className="size-5" />
          </Button>
        )}

        {showCollapse && (
          <Button variant="ghost" size="icon" className="rounded-full shrink-0">
            <ChevronDown className="size-5" />
          </Button>
        )}

        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold">{title}</h1>

          {subtitle && (
            <p className="truncate text-[10px] font-bold uppercase tracking-widest ">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="justify-self-center w-full">
        <NowPlayingStatus />
      </div>

      <div className="flex items-center gap-2 justify-end justify-self-end">
        {status && (
          <span
            className={[
              "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold",
              status.variant === "error"
                ? "bg-red-500/10 text-red-300"
                : status.variant === "success"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-white/10 text-primary/60",
            ].join(" ")}
          >
            {StatusIcon && <StatusIcon className="h-3.5 w-3.5" />}
            {status.label}
          </span>
        )}

        <SpotifyConnectionBadge />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-white/10"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-48 border-white/10">
            <DropdownMenuLabel>Navigation</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => navigate("/")}>
              <Music className="mr-2 h-4 w-4" />
              Listen
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => navigate("/search")}>
              <Search className="mr-2 h-4 w-4" />
              Search
            </DropdownMenuItem>


            <DropdownMenuItem onClick={() => navigate("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Account</DropdownMenuLabel>

            {connected ? (
              <>
                <DropdownMenuItem disabled className="opacity-70">
                  Signed in as {username ?? "Spotify User"}
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleSpotifyLogout}
                  className="text-red-400 focus:bg-red-500 focus:text-primary"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out of Spotify
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem
                onClick={loginWithSpotify}
                className="text-green-400 focus:bg-green-500 focus:text-primary"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign in with Spotify
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
