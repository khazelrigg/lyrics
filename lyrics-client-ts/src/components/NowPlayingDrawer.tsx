import { useState } from "react"
import NowPlayingCard from "./NowPlayingCard"

export default function NowPlayingDrawer(props: Parameters<typeof NowPlayingCard>[0]) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <>
      {/* Backdrop overlay */}
      {isExpanded && (
        <div
          className="fixed bottom-0 inset-0 z-40 bg-black/30 transition-opacity duration-300"
          //className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setIsExpanded(false)}
        />
      )}

      {/* Now Playing Drawer */}
      <div
        className={`fixed bottom-0 left-0 w-full z-50 transition-transform duration-300 ease-in-out rounded-t-2xl shadow-xl
          ${isExpanded ? "h-[60vh] translate-y-0" : "h-[72px] translate-y-[calc(100%-72px)]"}`}
      >
        <div
          className="cursor-pointer select-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <NowPlayingCard {...props} isExpanded={isExpanded} />
        </div>
      </div>
    </>
  )
}
