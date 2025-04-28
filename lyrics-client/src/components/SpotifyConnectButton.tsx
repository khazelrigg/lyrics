"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import SpotifyLogo from "@/assets/spotify.svg"; // or wherever your icon is

export function SpotifyConnectButton() {
  const [connected, setConnected] = useState(false); // replace with real auth later
  const [username, setUsername] = useState("YourName"); // mock username for now

  return (
    <>
      {/* Mobile: Icon Only */}
      <div className="block md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            if (!connected) {
              // Connect logic here
            }
          }}
        >
          <Avatar className="w-6 h-6">
            <AvatarImage src={SpotifyLogo} />
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
        </Button>
      </div>

      {/* Desktop: Full Button */}
      <div className="hidden md:flex items-center">
        <Button
          variant="default"
          onClick={() => {
            if (!connected) {
              // Connect logic here
            }
          }}
        >
          {connected ? username : "Connect"}

          <Avatar className="w-6 h-6">
            <AvatarImage src={SpotifyLogo} />
            <AvatarFallback>?</AvatarFallback>
          </Avatar>
        </Button>
      </div>
    </>
  );
}
