"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  PlayIcon,
  PauseIcon,
  SkipForwardIcon,
  SkipBackIcon,
  Shuffle,
  Repeat,
  Repeat1,
} from "lucide-react";
import { useSpotifyStore } from "@/stores/spotifyStore";
import { useEstimatedProgress } from "@/hooks/useEstimatedProgress";
import {
  play,
  pause,
  seek,
  shuffle as shuffleApi,
  repeat as repeatApi,
  nextTrack,
  previousTrack,
} from "@/services/spotify/api";

export default function ExpandedNowPlayingCard() {
  const {
    track,
    isPlaying,
    shuffle_state,
    repeat_state,
    setShuffleState,
    setRepeatState,
  } = useSpotifyStore();
  const estimatedTime = useEstimatedProgress();
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState<number | null>(null);

  if (!track) {
    return null;
  }

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const displayedProgress =
    isDragging && dragValue !== null ? dragValue : estimatedTime;

  const toggleShuffle = async () => {
    const newShuffle = !shuffle_state;
    try {
      await shuffleApi(newShuffle);
      setShuffleState(newShuffle);
    } catch (err) {
      console.error("Failed to toggle shuffle:", err);
    }
  };

  const toggleRepeat = async () => {
    let nextRepeat: string;
    if (repeat_state === "off") nextRepeat = "context";
    else if (repeat_state === "context") nextRepeat = "track";
    else nextRepeat = "off";

    try {
      await repeatApi(nextRepeat);
      setRepeatState(nextRepeat);
    } catch (err) {
      console.error("Failed to toggle repeat:", err);
    }
  };

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

      {/* Seek Bar */}
      <div className="w-full space-y-2">
        <Slider
          value={[Math.min(displayedProgress, track.duration)]}
          min={0}
          max={track.duration}
          step={1000}
          onValueChange={handleDragging}
          onValueCommit={handleSeek}
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formatTime(displayedProgress)}</span>
          <span>{formatTime(track.duration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-6">
        {/* Shuffle */}
        <Button size="icon" variant="ghost" onClick={toggleShuffle}>
          <Shuffle className={`w-6 h-6 ${shuffle_state ? "text-green-500" : ""}`} />
        </Button>

        {/* Previous Track */}
        <Button size="icon" variant="ghost" onClick={previousTrack}>
          <SkipBackIcon className="w-6 h-6" />
        </Button>

        {/* Play / Pause */}
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

        {/* Next Track */}
        <Button size="icon" variant="ghost" onClick={nextTrack}>
          <SkipForwardIcon className="w-6 h-6" />
        </Button>

        {/* Repeat */}
        <Button size="icon" variant="ghost" onClick={toggleRepeat}>
          {repeat_state === "track" ? (
            <Repeat1 className="w-6 h-6 text-green-500" />
          ) : (
            <Repeat className={`w-6 h-6 ${repeat_state !== "off" ? "text-green-500" : ""}`} />
          )}
        </Button>
      </div>
    </div>
  );
}
