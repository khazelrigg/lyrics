"use client";

import { PlayIcon, PauseIcon } from "lucide-react";
import { useSpotifyStore } from "@/stores/spotifyStore";
import { play, pause, nextTrack, previousTrack } from "@/services/spotify/api";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useTransform } from "motion/react";
import { useState } from "react";

export default function CollapsedNowPlayingCard() {
  const { track, isPlaying } = useSpotifyStore();
  const x = useMotionValue(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(null);
  const SWIPE_TRIGGER = 80;

  const textOpacity = useTransform(x, [-SWIPE_TRIGGER, 0, SWIPE_TRIGGER], [0, 1, 0]);
  const swipeProgress = useTransform(x, [-SWIPE_TRIGGER, 0, SWIPE_TRIGGER], [1, 0, 1]);
  const activeColor = useTransform(x, [-SWIPE_TRIGGER, -40, 40, SWIPE_TRIGGER], ["#00FF00", "#888888", "#888888", "#00FF00"]);

  if (!track) return null;

  const handleDragEnd = () => {
    const currentX = x.get();
    if (currentX > SWIPE_TRIGGER) {
      previousTrack();
    } else if (currentX < -SWIPE_TRIGGER) {
      nextTrack();
    }
    x.set(0);
    setSwipeDirection(null);
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Swipe Hint */}
      {swipeDirection && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-2 flex flex-col items-center text-green-500 pointer-events-none"
        >
          <svg width="40" height="40" viewBox="0 0 24 24">
            <motion.path
              d={
                swipeDirection === "left"
                  ? "M8 4l8 8-8 8"
                  : "M16 4l-8 8 8 8"
              }
              fill="none"
              stroke={activeColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ pathLength: swipeProgress }}
            />
          </svg>
          <div className="text-xs mt-1">
            {swipeDirection === "left" ? "Next" : "Back"}
          </div>
        </motion.div>
      )}

      {/* Card */}
      <div className="flex items-center justify-between w-full px-4 py-3 shadow-md rounded-t-lg border caret-transparent bg-background">
        {/* Album Art */}
        <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0 pr-2 relative z-10">
          {track.albumArt ? (
            <img
              src={track.albumArt}
              alt={track.album}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-300" />
          )}
        </div>

        {/* Draggable Text */}
        <motion.div
          className="flex flex-col flex-grow text-left px-4 relative z-0"
          style={{ x, opacity: textOpacity, touchAction: "none" }}
          drag="x"
          dragElastic={0.2}
          dragConstraints={{ left: 0, right: 0 }}
          onDrag={() => {
            const currentX = x.get();
            if (currentX > 10) {
              setSwipeDirection("right");
            } else if (currentX < -10) {
              setSwipeDirection("left");
            } else {
              setSwipeDirection(null);
            }
          }}
          onDragEnd={handleDragEnd}
        >
          <span className="text-sm font-medium truncate">{track.title}</span>
          <span className="text-xs text-muted-foreground truncate">{track.artist}</span>
        </motion.div>

        {/* Play/Pause Button */}
        <div className="pl-4 flex-shrink-0 relative z-10">
          <Button
            size="icon"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              if (isPlaying) {
                pause();
              } else {
                play();
              }
            }}          >
            {isPlaying ? (
              <PauseIcon className="text-gray-800 dark:text-gray-200" />
            ) : (
              <PlayIcon className="text-gray-800 dark:text-gray-200" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
