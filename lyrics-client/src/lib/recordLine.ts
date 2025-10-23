import { LoopbackRecorder } from "./loopbackRecorder";
import { play, pause, seek } from "@/services/spotify/api";

import { useSpotifyStore } from "@/stores/spotifyStore";

// Helper to wait
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export type RecordLineOpts = {
  startTimeMs: number;
  nextStartTimeMs?: number;     // if undefined, you can set a fallback duration
  maxExtraTailMs?: number;      // small tail to avoid clipping word ends
  loopbackDeviceId?: string;    // saved mic/loopback input
  onStatus?: (s: string) => void;
  // Optional early stop signal (e.g., track changed)
  stopSignal$?: { get: () => boolean };
};

async function waitForPausedAtStore(
  targetMs: number,
  {
    toleranceMs = 0,
    timeoutMs = 3000,
    onStatus,
  }: { toleranceMs?: number; timeoutMs?: number; onStatus?: (s: string) => void }
) {
  return new Promise<boolean>((resolve) => {
    let resolved = false;

    const check = (currentTime: number, isPlaying: boolean) => {
      if (!isPlaying && Math.abs(currentTime - targetMs) <= toleranceMs) {
        if (!resolved) {
          resolved = true;
          unsub();
          resolve(true);
        }
      }
    };

    // 1) Check immediately (in case the store is already up to date)
    const snap = useSpotifyStore.getState();
    check(snap.currentTime, snap.isPlaying);
    if (resolved) return;

    // 2) Subscribe to changes
    const unsub = useSpotifyStore.subscribe((s) => {
      check(s.currentTime, s.isPlaying);
    });

    // 3) Timeout fallback
    setTimeout(() => {
      if (!resolved) {
        onStatus?.("pause/seek confirmation timed out; continuing anyway");
        resolved = true;
        unsub();
        resolve(false);
      }
    }, timeoutMs);
  });
}

export async function recordLine(opts: RecordLineOpts): Promise<Blob> {
  const {
    startTimeMs,
    nextStartTimeMs,
    maxExtraTailMs = 500, // Extra recording at the end (buffer, tail)
    loopbackDeviceId,
    onStatus,
    stopSignal$,
  } = opts;

  const rec = new LoopbackRecorder();

  try {
    onStatus?.("pausing");
    pause();

    onStatus?.("seeking");
    seek(startTimeMs);
    //await seekSpotify(startTimeMs, accessToken);

    // Small settle time for players (optional)
    // TODO - wait until spotify playback status is now paused
    await waitForPausedAtStore(startTimeMs, { onStatus });
    //await delay(120);

    onStatus?.("arming recorder");
    await rec.start(loopbackDeviceId);

    onStatus?.("resuming playback");
    play();

    // Compute expected duration
    const durationMs = Math.max(50, (nextStartTimeMs ?? startTimeMs + 1200) - startTimeMs);
    const targetMs = durationMs + maxExtraTailMs;

    // Race: stop by time OR external signal (track changed)
    const stopByTime = delay(targetMs).then(() => "time");
    const stopBySignal = (async () => {
      if (!stopSignal$) return new Promise<string>(() => {}); // never resolves
      while (!stopSignal$.get()) {
        await delay(80);
      }
      return "signal";
    })();

    const winner = await Promise.race([stopByTime, stopBySignal]);
    onStatus?.(`stopping (${winner})`);

    const blob = await rec.stop();
    return blob;

  } finally {
    rec.dispose();

    // TODO make config?
    pause();
  }
}
