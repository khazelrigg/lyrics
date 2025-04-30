"use client";

import { useSpotifyStore } from "@/stores/spotifyStore";
import { play, pause, nextTrack, previousTrack } from "@/services/spotify/api";

import { motion, useMotionValue, useTransform } from "motion/react";
import { PlayIcon, PauseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEstimatedProgress } from "@/hooks/useEstimatedProgress";

export default function CollapsedCard() {
  const estimatedTime = useEstimatedProgress();
  const { track, isPlaying, setTrack } = useSpotifyStore();
  const x = useMotionValue(0);

  const SWIPE_TRIGGER = 20; // Adjust the sensitivty of swipe release to skip track

  const textOpacity = useTransform(
    x,
    [-SWIPE_TRIGGER, 0, SWIPE_TRIGGER],
    [0, 1, 0]
  );

  // If no track, set a blank/dummy value for skeleton
  if (!track) return null;

  const progressPercent = !track || track.duration_ms <= 0
    ? 0
    : (estimatedTime / track.duration_ms) * 100;

  const handleDragEnd = () => {
    const currentX = x.get();
    if (currentX > SWIPE_TRIGGER) {
      previousTrack();
    } else if (currentX < -SWIPE_TRIGGER) {
      nextTrack();
    }
    x.set(0);
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Card */}
      <div className="flex items-center justify-between w-full px-4 py-3 shadow-md rounded-t-lg border caret-transparent bg-background">
        {/* Album Art */}

        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0 relative z-10">
          {track.albumArt ? (
            <img
              src={track.albumArt}
              alt={track.album}
              className="w-full h-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}
        </div>

        {/* Center: Draggable Text */}
        <motion.div
          className="flex flex-col flex-grow min-w-0 px-4 relative z-0 touch-none"
          style={{ x, opacity: textOpacity, touchAction: "none" }}
          drag="x"
          dragElastic={0.2}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
        >
          <span className="text-sm font-medium truncate">{track.title || "Unknown Track"}</span>
          <span className="text-xs text-muted-foreground truncate">
            {track.artist || "Unknown Artist"}
          </span>
        </motion.div>

        {/* Right: Play Button */}
        <div className="flex-shrink-0 pl-2 relative z-10">
          <Button
            size="icon"
            variant="ghost"
            aria-label={isPlaying ? "Pause Track" : "Play Track"}
            onClick={(e) => {
              e.stopPropagation();
              if (isPlaying) {
                pause();
              } else {
                play();
              }
            }}
          >
            {isPlaying ? (
              <PauseIcon className="text-gray-800 dark:text-gray-200" />
            ) : (
              <PlayIcon className="text-gray-800 dark:text-gray-200" />
            )}
          </Button>
        </div>
      </div>

      {/* Progress bar below the card content */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-muted-foreground/30">
        <div
          className="h-full bg-ui-accent transition-all duration-150 ease-linear rounded-r"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
