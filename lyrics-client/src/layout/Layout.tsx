// src/layout/Layout.tsx

import { AppHeader } from "@/components/layout/AppHeader"
import { BottomNavBar } from "@/components/layout/BottomNavBar"
import { Link } from "react-router-dom"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-dvh w-full overflow-hidden">
      {/* Header */}

      {/* Main content */}
      <main className="overflow-hidden px-4 py-4 h-full w-full">
        {children}
      </main>

      {/* Footer */}
      <BottomNavBar />
    </div>
  )
}
