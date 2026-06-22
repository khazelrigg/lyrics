import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ImmersiveLyricsViewer } from "@/components/lyrics/ImmersiveLyricsViewer";
import type { LyricsData } from "@/types/lyrics";

const mocks = vi.hoisted(() => ({
  currentTime: 1500,
  seek: vi.fn(),
}));

vi.mock("@/hooks/useEstimatedProgress", () => ({
  useEstimatedProgress: () => mocks.currentTime,
}));

vi.mock("@/services/spotifyApi", () => ({
  seek: mocks.seek,
}));

const syncedLyrics: LyricsData = {
  track_id: "track-1",
  title: "Test Song",
  artist: "Test Artist",
  status: "OK",
  synced: true,
  lines: [
    { text: "First line", start_time: 1000 },
    { text: "Second line", start_time: 2000 },
    { text: "Third line", start_time: 3000 },
  ],
};

const unsyncedLyrics: LyricsData = {
  ...syncedLyrics,
  track_id: "track-unsynced",
  synced: false,
};

function rect(top: number, height: number): DOMRect {
  return {
    x: 0,
    y: top,
    top,
    left: 0,
    right: 300,
    bottom: top + height,
    width: 300,
    height,
    toJSON: () => ({}),
  } as DOMRect;
}

describe("ImmersiveLyricsViewer", () => {
  beforeEach(() => {
    mocks.currentTime = 1500;
    mocks.seek.mockReset();
    mocks.seek.mockResolvedValue({ ok: true, status: 204 });
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: false,
    } as MediaQueryList);

    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function getBoundingClientRect(this: HTMLElement) {
        if (this.getAttribute("role") === "button") {
          const label = this.getAttribute("aria-label") ?? "";
          const top = label.includes("First")
            ? 300
            : label.includes("Second")
              ? 400
              : 500;
          return rect(top, 40);
        }

        return rect(0, 200);
      }
    );
  });

  it("renders synced lyrics with one active, seekable line", () => {
    render(<ImmersiveLyricsViewer lyrics={syncedLyrics} />);

    expect(screen.getByRole("button", { name: /First line/ })).toHaveAttribute(
      "aria-current",
      "true"
    );
    expect(screen.getByRole("button", { name: /Second line/ })).not.toHaveAttribute(
      "aria-current"
    );
    expect(screen.getByText("0:01")).toBeInTheDocument();
  });

  it("renders unsynced lyrics as plain selectable text", () => {
    render(<ImmersiveLyricsViewer lyrics={unsyncedLyrics} />);

    expect(screen.getByText("First line")).toHaveClass("select-text");
    expect(screen.queryByRole("button", { name: /First line/ })).not.toBeInTheDocument();
    expect(screen.queryByText("0:01")).not.toBeInTheDocument();
  });

  it("updates the active line when playback advances", () => {
    const { rerender } = render(
      <ImmersiveLyricsViewer lyrics={syncedLyrics} />
    );

    mocks.currentTime = 2500;
    rerender(<ImmersiveLyricsViewer lyrics={syncedLyrics} />);

    expect(screen.getByRole("button", { name: /Third line/ })).not.toHaveAttribute(
      "aria-current"
    );
    expect(screen.getByRole("button", { name: /Second line/ })).toHaveAttribute(
      "aria-current",
      "true"
    );
  });

  it("pauses following on manual scroll and resumes on request", () => {
    const { container, rerender } = render(
      <ImmersiveLyricsViewer lyrics={syncedLyrics} />
    );
    const scroller = container.querySelector("section > div") as HTMLDivElement;
    const scrollTo = vi.spyOn(scroller, "scrollTo");

    fireEvent.wheel(scroller);
    expect(screen.getByRole("button", { name: "Resume sync" })).toBeInTheDocument();

    const callCount = scrollTo.mock.calls.length;
    mocks.currentTime = 2500;
    rerender(<ImmersiveLyricsViewer lyrics={syncedLyrics} />);
    expect(scrollTo).toHaveBeenCalledTimes(callCount);

    fireEvent.click(screen.getByRole("button", { name: "Resume sync" }));
    expect(scrollTo.mock.calls.length).toBeGreaterThan(callCount);
  });

  it("uses instant scrolling when reduced motion is requested", async () => {
    vi.mocked(window.matchMedia).mockReturnValue({
      matches: true,
    } as MediaQueryList);
    const scrollTo = vi.spyOn(HTMLElement.prototype, "scrollTo");

    render(<ImmersiveLyricsViewer lyrics={syncedLyrics} />);

    await waitFor(() =>
      expect(scrollTo).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: "auto" })
      )
    );
  });

  it("re-centers when the track changes even if the active index is unchanged", () => {
    const { rerender } = render(
      <ImmersiveLyricsViewer lyrics={syncedLyrics} />
    );
    const scrollTo = vi.spyOn(HTMLElement.prototype, "scrollTo");
    const initialCalls = scrollTo.mock.calls.length;

    rerender(
      <ImmersiveLyricsViewer
        lyrics={{ ...syncedLyrics, track_id: "track-2", title: "Next Song" }}
      />
    );

    expect(scrollTo.mock.calls.length).toBeGreaterThan(initialCalls);
  });

  it("seeks from pointer or keyboard activation and resumes following", async () => {
    const { container } = render(
      <ImmersiveLyricsViewer lyrics={syncedLyrics} />
    );
    const scroller = container.querySelector("section > div") as HTMLDivElement;
    fireEvent.wheel(scroller);

    const secondLine = screen.getByRole("button", { name: /Second line/ });
    fireEvent.keyDown(secondLine, { key: "Enter" });

    await waitFor(() => expect(mocks.seek).toHaveBeenCalledWith(2000));
    expect(screen.queryByRole("button", { name: "Resume sync" })).not.toBeInTheDocument();
  });

  it("does not seek while lyric text is selected", () => {
    vi.spyOn(window, "getSelection").mockReturnValue({
      toString: () => "First line",
    } as Selection);
    render(<ImmersiveLyricsViewer lyrics={syncedLyrics} />);

    fireEvent.click(screen.getByRole("button", { name: /First line/ }));

    expect(mocks.seek).not.toHaveBeenCalled();
  });

  it("surfaces seek failures without replacing the lyrics", async () => {
    mocks.seek.mockResolvedValue({ ok: false, status: 403 });
    render(<ImmersiveLyricsViewer lyrics={syncedLyrics} />);

    fireEvent.click(screen.getByRole("button", { name: /First line/ }));

    expect(
      await screen.findByText("Could not seek Spotify. Playback was left unchanged.")
    ).toBeVisible();
    expect(screen.getByText("First line")).toBeInTheDocument();
  });
});
