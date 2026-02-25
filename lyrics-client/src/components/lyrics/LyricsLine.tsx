"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "motion/react";
import { Play, Copy, Mic } from "lucide-react";
import { useFontSettings } from "@/hooks/useFontSettings";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useLineRecorder } from "@/hooks/useLineRecorder";
import { useActiveLyricContext } from "@/components/lyrics/ActiveLyricContext";

interface LyricsLineProps {
  id: number;
  text: string;
  startTimeMs: number;
  nextStartTimeMs?: number;

  onClick?: () => void;
  onLoop?: (start: number, end: number) => void;

  currentlyOpenId: number | null;
  setCurrentlyOpenId: (id: number | null) => void;
}

export default function LyricsLine({
  id,
  text,
  startTimeMs,
  nextStartTimeMs,
  onClick,
  currentlyOpenId,
  setCurrentlyOpenId,
}: LyricsLineProps) {
  const { className: fontClass, style } = useFontSettings();
  const { activeIndex, activeStartTimeMs } = useActiveLyricContext();

  // Decide active locally (choose ONE of these approaches)
  // A) by index (matches your map indices)
  const isActive = id === activeIndex;

  // B) by start time (more robust if list changes / filtering differs)
  // const isActive = activeStartTimeMs != null && startTimeMs === activeStartTimeMs;

  const x = useMotionValue(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolling, setScrolling] = useState(false);
  const isOpen = currentlyOpenId === id;

  const [hovered, setHovered] = useState(false);
  const touchHideRef = useRef<number | null>(null);
  const reveal = isActive || isOpen || hovered;

  const recorder = useLineRecorder();

  useEffect(() => {
    if (!isOpen) {
      animate(x, 0, { duration: 0.2 });
    } else {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setCurrentlyOpenId(null);
      }, 5000);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isOpen, setCurrentlyOpenId, x]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!isActive || !el) return;

    const dist = el.scrollWidth;
    if (dist <= el.clientWidth) return;

    setScrolling(true);
    let canceled = false;

    const wrapper = document.createElement("div");
    wrapper.className = "inline-block pr-16";
    wrapper.innerText = text;
    el.innerHTML = "";
    el.appendChild(wrapper.cloneNode(true));
    el.appendChild(wrapper.cloneNode(true));

    let scrollLeft = 0;
    const scroll = () => {
      if (canceled) return;
      scrollLeft += 0.5;
      if (scrollLeft >= el.scrollWidth / 2) {
        scrollLeft = 0;
      }
      el.scrollLeft = scrollLeft;
      requestAnimationFrame(scroll);
    };

    scroll();

    return () => {
      canceled = true;
      el.scrollLeft = 0;
      setScrolling(false);
    };
  }, [isActive, text]);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard.");
    setCurrentlyOpenId(null);
  }

  function handleSeek() {
    onClick?.();
    setCurrentlyOpenId(null);
  }

  function handleDragEnd() {
    if (x.get() < -40) {
      animate(x, -92, { duration: 0.2 });
      setCurrentlyOpenId(id);
    } else {
      setCurrentlyOpenId(null);
    }
  }

  function handleRecordLine() {
    setCurrentlyOpenId(null);
    recorder.start({
      startTimeMs,
      nextStartTimeMs,
      loopbackDeviceId: localStorage.getItem("loopbackDeviceId") || undefined,
    });
  }

  function handleTouchStart() {
    setHovered(true);
    if (touchHideRef.current) window.clearTimeout(touchHideRef.current);
    touchHideRef.current = window.setTimeout(() => setHovered(false), 2000);
  }

  return (
    <div className="relative overflow-hidden bg-background rounded-md border-2">
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-0 flex gap-2">
        <Button
          onClick={handleCopy}
          size="icon"
          variant="ghost"
          aria-label="Copy line to clipboard"
          className="h-9 w-9 bg-yellow-200 text-foreground rounded-xl shadow-xs hover:bg-yellow-300 transition"
        >
          <Copy size={16} />
        </Button>

        <Button
          onClick={handleSeek}
          size="icon"
          variant="ghost"
          aria-label="Play song from here"
          className="h-9 w-9 rounded-xl shadow-xs bg-blue-200 text-black hover:bg-ui-accent transition"
        >
          <Play size={16} />
        </Button>
      </div>

      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -92, right: 0 }}
        style={{ x }}
        onDragEnd={handleDragEnd}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onTouchStart={handleTouchStart}
        className={cn(
          fontClass,
          "px-4 py-3 relative z-5 bg-background transition-colors select-none touch-pan-x",
          "flex items-center min-h-[44px] border-2 rounded",
          isActive ? "text-ui-accent" : "text-muted-foreground"
        )}
      >
        <Button
          onClick={handleRecordLine}
          size="icon"
          variant="ghost"
          title={recorder.busy ? recorder.status || "Recording…" : "Record"}
          aria-label="Record this line and save the audio"
          disabled={recorder.busy}
          className={cn(
            "hidden mr-2 h-9 w-9 rounded-xl shadow-xs bg-red-200 text-black hover:bg-red-400 transition flex-shrink-0",
            reveal
              ? "sm:inline-flex opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          )}
        >
          <span
            className={cn(
              "absolute inline-flex h-5 w-5 rounded-full bg-red-300 opacity-60",
              recorder.busy ? "animate-ping" : "hidden"
            )}
          />
          {recorder.busy ? (
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: [1, 1.15, 1], opacity: [1, 0.65, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
              className="grid place-items-center"
            >
              <Mic size={16} />
            </motion.div>
          ) : (
            <Mic size={16} />
          )}
        </Button>

        <div
          ref={scrollRef}
          className={cn("w-full whitespace-nowrap overflow-hidden")}
          style={style}
        >
          {text}
        </div>
      </motion.div>
    </div>
  );
}