// src/components/Lyrics/LyricsWord.tsx
import { useState } from "react";
import { LyricsWordData } from "../../types/lyrics";

// Helper: check if a string has kanji
function hasKanji(text: string): boolean {
  return /[\u4e00-\u9faf]/.test(text);
}

interface LyricsWordProps extends LyricsWordData {
  furiganaMode: "always" | "hover" | "none";
}

export default function LyricsWord({
  surface,
  reading,
  furiganaMode,
}: LyricsWordProps) {
  const [isHighlighted, setIsHighlighted] = useState(false);

  const handleClick = () => {
    setIsHighlighted((prev) => !prev);
  };

  const highlightClass = isHighlighted ? "bg-yellow-800 rounded" : "";

  if (!hasKanji(surface)) {
    reading = "";
  }

  if (!reading || furiganaMode === "none") {
    return (
      <span
        className={`cursor-pointer px-1 ${highlightClass}`}
        onClick={handleClick}
      >
        {surface}
      </span>
    );
  }

  if (furiganaMode === "always") {
    return (
      <ruby
        className={`cursor-pointer px-1 ${highlightClass}`}
        onClick={handleClick}
      >
        {surface}
        <rt>{reading}</rt>
      </ruby>
    );
  }

  if (furiganaMode === "hover") {
    return (
      <ruby
        className={`group cursor-pointer px-1 ${highlightClass}`}
        onClick={handleClick}
      >
        {surface}
        <rt className="opacity-0 group-hover:opacity-100 transition-opacity">
          {reading}
        </rt>
      </ruby>
    );
  }

  return (
    <span
      className={`cursor-pointer px-1 ${highlightClass}`}
      onClick={handleClick}
    >
      {surface}
    </span>
  );
}
