import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import SpotifyLogo from "@/assets/spotify.svg";
import LogoIcon from "@/components/LogoIcon";

import SearchModal from "@/components/SearchModal"; // (new)
import { ModeToggle } from "../ModeToggle";
import { SpotifyConnectButton } from "../SpotifyConnectButton";


export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="flex items-center justify-between p-4 shadow-md border-b">
      <div className="flex flex-row items-center gap-2 text-xl font-bold hover:text-blue-400 transition-colors cursor-pointer">
        <LogoIcon className="w-8 h-8 text-blue-400" />
        <span className="text-2xl">Lyringo</span>
      </div>

      <div className="flex items-center gap-2">
        <ModeToggle />
        <Button
          size="icon"
          variant="outline"
          onClick={() => setSearchOpen(true)}
          title="Search for lyrics manually"
        >
          <SearchIcon className="w-5 h-5" />
        </Button>

        <SpotifyConnectButton />

      </div>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );}
