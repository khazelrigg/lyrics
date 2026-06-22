// src/layout/Layout.tsx

import { BottomNavBar } from "@/components/layout/BottomNavBar"

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
