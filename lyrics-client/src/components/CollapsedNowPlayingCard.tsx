import { PlayIcon, PauseIcon } from "lucide-react";

export default function CollapsedNowPlayingCard() {
  const isPlaying = true; // Replace with actual playback state

  return (
    <button
      type="button"
      className="flex items-center justify-between w-full px-4 py-3 shadow-md rounded-t-lg cursor-pointer border border-2"
    >
      <div className="flex items-center gap-4">
        {/* Album Art Thumbnail */}
        <div className="w-10 h-10 bg-gray-300 rounded-md" />

        {/* Song Info */}
        <div className="flex flex-col text-left">
          <span className="text-sm font-medium truncate max-w-[150px]">Song Title</span>
          <span className="text-xs text-muted-foreground truncate max-w-[150px]">Artist Name</span>
        </div>
      </div>

      {/* Play/Pause Icon */}
      <div className="px-4">
        {isPlaying ? (
          <PauseIcon className="w-5 h-5 text-gray-800" />
        ) : (
          <PlayIcon className="w-5 h-5 text-gray-800" />
        )}
      </div>
    </button>
  );
}
