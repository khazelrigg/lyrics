import { Button } from "@/components/ui/button";
import { PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon } from "lucide-react";

export default function ExpandedNowPlayingCard() {
  // Temporary play state
  const isPlaying = true;

  return (
    <div className="flex flex-col items-center w-full p-6 space-y-6">
      {/* Album Art */}
      <div className="w-60 h-60 bg-gray-300 rounded-lg" />

      {/* Song Info */}
      <div className="flex flex-col items-center">
        <h2 className="text-lg font-semibold truncate max-w-xs">Song Title</h2>
        <p className="text-sm text-muted-foreground truncate max-w-xs">Artist Name</p>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-6">
        <Button size="icon" variant="ghost">
          <SkipBackIcon className="w-6 h-6" />
        </Button>
        <Button size="icon" variant="default" className="rounded-full w-14 h-14">
          {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
        </Button>
        <Button size="icon" variant="ghost">
          <SkipForwardIcon className="w-6 h-6" />
        </Button>
      </div>

      {/* Progress Bar (Placeholder) */}
      <div className="w-full">
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-blue-500" style={{ width: "40%" }} />
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>1:12</span>
          <span>3:45</span>
        </div>
      </div>
    </div>
  );
}
