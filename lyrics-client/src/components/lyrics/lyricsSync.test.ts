import { describe, expect, it } from "vitest";

import { getActiveLyricsLineIndex } from "@/components/lyrics/lyricsSync";
import type { LyricsLineData } from "@/types/lyrics";

const lines: LyricsLineData[] = [
  { text: "First", start_time: 1000 },
  { text: "Second", start_time: 2000 },
  { text: "Third", start_time: 3000 },
];

describe("getActiveLyricsLineIndex", () => {
  it("returns no active line for empty lyrics or playback before the first line", () => {
    expect(getActiveLyricsLineIndex([], 1000)).toBe(-1);
    expect(getActiveLyricsLineIndex(lines, 999)).toBe(-1);
  });

  it("uses inclusive boundaries and keeps the final line active", () => {
    expect(getActiveLyricsLineIndex(lines, 1000)).toBe(0);
    expect(getActiveLyricsLineIndex(lines, 2999)).toBe(1);
    expect(getActiveLyricsLineIndex(lines, 9000)).toBe(2);
  });

  it("ignores invalid timestamps", () => {
    const mixedLines: LyricsLineData[] = [
      { text: "Missing" },
      { text: "Invalid", start_time: -1 },
      { text: "Valid", start_time: 500 },
    ];

    expect(getActiveLyricsLineIndex(mixedLines, 500)).toBe(2);
  });

  it("selects the last line when timestamps are duplicated", () => {
    const duplicateLines: LyricsLineData[] = [
      { text: "First", start_time: 1000 },
      { text: "Second", start_time: 1000 },
      { text: "Third", start_time: 2000 },
    ];

    expect(getActiveLyricsLineIndex(duplicateLines, 1000)).toBe(1);
  });

  it("rejects invalid playback positions", () => {
    expect(getActiveLyricsLineIndex(lines, -1)).toBe(-1);
    expect(getActiveLyricsLineIndex(lines, Number.NaN)).toBe(-1);
  });
});
