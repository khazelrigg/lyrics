"use client";

import { ExternalLink } from "lucide-react";
import { useEffect } from "react";
import {
  initiateSpotifyAuth,
  getAccessToken,
  clearAccessToken,
} from "@/services/spotify/auth";

import { getUserProfile } from "@/services/spotify/api";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import SpotifyLogo from "@/assets/spotify.svg";

import { useSpotifyStore } from "@/stores/spotifyStore"; 

export default function SpotifyConnectButton() {
  const { connected, username, profileImg, connect, disconnect } = useSpotifyStore();

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    getUserProfile()
      .then((data) => {
        // Check we got data
        if (data) {
          const profileImg = data.images?.[0]?.url || null;
          const username = data.display_name || "Spotify User";
          connect(username, profileImg);
        } else {
          disconnect();
        }
      })
      .catch(() => {
        disconnect(); // if fetching user fails, clear store
      });
  }, [connect, disconnect]);

  const handleLogout = () => {
    clearAccessToken();
    disconnect();
    window.location.reload(); // optional, or just re-render
  };

  // Connect button when signed out
  if (!connected) {
    return (
      <Button onClick={initiateSpotifyAuth} variant="default" size="icon">
        <span className="hidden md:inline">Connect</span>
        <img className="h-6 w-6" src={SpotifyLogo}></img>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 w-8 h-8">
          <span className="hidden md:inline">{username}</span> {/* Username on desktop */}
          <Avatar className="w-6 h-6">
            {profileImg ? (
              <AvatarImage src={profileImg} alt="Spotify profile" />
            ) : (
              <AvatarFallback>{username?.charAt(0) || "?"}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="min-w-[140px]">
        <div className="flex items-center justify-between px-2 py-1.5 caret-transparent">
          <span className="text-sm font-medium truncate max-w-[140px]">
            {username}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6 p-0"
            onClick={() => {
              window.open("https://open.spotify.com/", "_blank");
            }}
          >
            <ExternalLink className="w-4 h-4" />
            <span className="sr-only">View Spotify Profile</span>
          </Button>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-red-500 hover:bg-red-500 hover:text-white"
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
