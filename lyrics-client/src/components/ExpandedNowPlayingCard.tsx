"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  PlayIcon,
  PauseIcon,
  SkipForwardIcon,
  SkipBackIcon,
} from "lucide-react";
import { useSpotifyStore } from "@/stores/spotifyStore";
import { useEstimatedProgress } from "@/hooks/useEstimatedProgress";
import {
  play,
  pause,
  seek,
  nextTrack,
  previousTrack,
} from "@/services/spotify/api";

export default function ExpandedNowPlayingCard() {
  const { track, isPlaying } = useSpotifyStore();
  const estimatedTime = useEstimatedProgress();
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState<number | null>(null);

  if (!track) {
    return null; // Don't render anything if no track is playing
  }

  // Format time helper
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const displayedProgress =
    isDragging && dragValue !== null ? dragValue : estimatedTime;

  const handleSeek = async (value: number[]) => {
    const ms = value[0];
    try {
      await seek(ms);
    } catch (err) {
      console.error("Failed to seek:", err);
    }
    setIsDragging(false);
    setDragValue(null);
  };

  const handleDragging = (value: number[]) => {
    setIsDragging(true);
    setDragValue(value[0]);
  };

  return (
    <div className="flex flex-col items-center w-full p-6 space-y-6">
      {/* Album Art */}
      <div className="w-60 h-60 rounded-lg overflow-hidden bg-muted">
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

      {/* Song Info */}
      <div className="flex flex-col items-center">
        <h2 className="text-lg font-semibold truncate max-w-xs">
          {track.title}
        </h2>
        <p className="text-sm text-muted-foreground truncate max-w-xs">
          {track.artist}
        </p>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-6">
        <Button size="icon" variant="ghost" onClick={previousTrack}>
          <SkipBackIcon className="w-6 h-6" />
        </Button>

        <Button
          size="icon"
          variant="default"
          className="rounded-full w-14 h-14"
          onClick={async () => {
            try {
              if (isPlaying) {
                await pause();
              } else {
                await play();
              }
            } catch (err) {
              console.error("Failed to toggle playback:", err);
            }
          }}
        >
          {isPlaying ? (
            <PauseIcon className="w-8 h-8" />
          ) : (
            <PlayIcon className="w-8 h-8" />
          )}
        </Button>

        <Button size="icon" variant="ghost" onClick={nextTrack}>
          <SkipForwardIcon className="w-6 h-6" />
        </Button>
      </div>

      {/* Seek Bar */}
      <div className="w-full space-y-2">
        <Slider
          value={[Math.min(displayedProgress, track.duration)]}
          min={0}
          max={track.duration}
          step={1000}
          onValueChange={handleDragging} // 🔥 actively updates while dragging
          onValueCommit={handleSeek} // 🔥 when drag is released
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatTime(displayedProgress)}</span>
          <span>{formatTime(track.duration)}</span>
        </div>
      </div>
    </div>
  );
}
