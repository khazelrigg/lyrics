// src/components/Lyrics/LyricsLine.tsx
import { forwardRef, useState } from "react";
import { seek } from "../../services/spotifyApi";

interface LyricsLineProps {
  text: string;
  startTime?: number;
  isActive: boolean;
  isPast: boolean;
  onClick?: () => void;
}

/**
 * Displays a single line of lyrics.
 * Handles styles depending on whether the line is active or past.
 */
const LyricsLine = forwardRef<HTMLLIElement, LyricsLineProps>(
  function LyricsLine({ text, startTime, isActive, isPast, onClick }, ref) {
    const [isHovered, setIsHovered] = useState(false);

    const handleSeek = async () => {
      if (typeof startTime === "number") {
        await seek(startTime);
      }
    };

    return (
      <li
        ref={ref}
        onClick={onClick}
        //onMouseEnter={() => setIsHovered(true)}
        //onMouseLeave={() => setIsHovered(false)}
        className={`px-2 py-1 text-left w-full group relative transition-all duration-100 select-none cursor-pointer
        ${isActive ? "font-bold text-lg text-green-500" : ""}
        ${!isPast && !isActive ? "text-gray-600" : ""}
        `}
      >

        <p className="text-xs text-gray-400">{startTime} ms</p>

        {text === "♪" ? (
          <span className={`${isActive ? "animate-pulse text-3xl" : ""}`}>
            {text}
          </span>
        ) : (
          <span>{text || "♪"}</span>
        )}

        {typeof startTime === "number" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSeek();
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 text-sm text-yellow-300 px-2 py-1 rounded hover:bg-yellow-300 hover:text-black opacity-0 group-hover:opacity-100 transition-opacity"
          >
            ▶ Seek
          </button>
        )}
      </li>
    );
  }
);

export default LyricsLine;
