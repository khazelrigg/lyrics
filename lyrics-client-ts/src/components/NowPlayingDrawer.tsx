// NowPlayingDrawer.tsx
import { useRef, useState } from "react"
import NowPlayingCard from "./NowPlayingCard"

export default function NowPlayingDrawer(props: Parameters<typeof NowPlayingCard>[0]) {
  const [isExpanded, setIsExpanded] = useState(false)
  const drawerRef = useRef<HTMLDivElement>(null)

  return (
    <>
      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Slide-up Drawer */}
      <div
        ref={drawerRef}
        className={`fixed bottom-0 left-0 w-full z-50 transition-transform duration-300 ease-in-out
        ${isExpanded ? "h-[60vh] translate-y-0" : "h-[72px] translate-y-[calc(100%-72px)]"}
        rounded-t-2xl bg-white dark:bg-neutral-900`}
      >
        <NowPlayingCard
          {...props}
          isExpanded={isExpanded}
          onClose={() => setIsExpanded(false)}
          onExpand={() => setIsExpanded(true)}
        />
      </div>
    </>
  )
}
