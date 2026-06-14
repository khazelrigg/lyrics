// src/layout/Layout.tsx
import { Link } from "react-router-dom"
import { Home, Search, Settings, Music } from "lucide-react";

import { BottomNavBar } from "@/components/layout/BottomNavBar"
import ConnectSpotify from "@/components/spotify/ConnectSpotify"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen max-h-screen bg-neutral-950 h-full w-fulltext-white grid grid-rows-[auto_1fr_auto]">
      {/* Header */}


      {/* Main content */}
      <main className="overflow-auto px-4 py-4 h-full w-full bg-neutral-950">
        {children}
      </main>

      {/* Footer */}
      <BottomNavBar />
    </div>
  )
}
