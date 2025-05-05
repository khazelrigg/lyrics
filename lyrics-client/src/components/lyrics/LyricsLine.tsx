"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, animate } from "motion/react";
import { Play, Copy } from "lucide-react";
import { useFontSettings } from "@/hooks/useFontSettings";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface LyricsLineProps {
  id: number;
  text: string;
  startTimeMs: number;
  nextStartTimeMs?: number;

  isActive: boolean;
  onClick?: () => void;
  onLoop?: (start: number, end: number) => void;

  currentlyOpenId: number | null;
  setCurrentlyOpenId: (id: number | null) => void;
}

export default function LyricsLine({
  id,
  text,
  isActive,
  onClick,
  currentlyOpenId,
  setCurrentlyOpenId,
}: LyricsLineProps) {
  const { className: fontClass, style } = useFontSettings();
  const x = useMotionValue(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrolling, setScrolling] = useState(false);
  const isOpen = currentlyOpenId === id;

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
      scrollLeft += 0.5; // slow and smooth
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
      animate(x, -80, { duration: 0.2 });
      setCurrentlyOpenId(id);
    } else {
      setCurrentlyOpenId(null);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-md">
      <div className="absolute right-2 top-1/2 -translate-y-1/2 z-0 flex gap-1">
        <Button
          onClick={handleCopy}
          size="icon"
          variant="ghost"
          className="bg-muted text-foreground p-1.5 rounded hover:text-gray-500 transition"
        >
          <Copy size={16} />
        </Button>

        <Button
          onClick={handleSeek}
          size="icon"
          variant="ghost"
          className="bg-ui-accent text-white p-1.5 rounded hover:bg-blue-400 transition"
        >
          <Play size={16} />
        </Button>
      </div>

      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -80, right: 0 }}
        style={{ x }}
        onDragEnd={handleDragEnd}
        className={cn(
          fontClass,
          "px-4 py-2 relative z-10 bg-background transition-colors select-none touch-pan-x",
          "flex items-center",
          isActive ? "text-ui-accent" : "text-muted-foreground"
        )}
      >
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
