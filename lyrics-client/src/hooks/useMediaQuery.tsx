import { useState, useEffect } from "react";

/**
 * useMediaQuery - A simple hook to detect if a given media query matches.
 *
 * @param query - The media query string (e.g., "(min-width: 768px)")
 * @returns boolean - true if the media query matches, false otherwise
 */
export default function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQueryList = window.matchMedia(query);

    const updateMatch = () => setMatches(mediaQueryList.matches);

    updateMatch(); // Check immediately

    mediaQueryList.addEventListener("change", updateMatch);

    return () => {
      mediaQueryList.removeEventListener("change", updateMatch);
    };
  }, [query]);

  return matches;
}
