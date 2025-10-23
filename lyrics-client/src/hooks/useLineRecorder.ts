"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { recordLine } from "@/lib/recordLine";

export type LineRecordParams = {
  startTimeMs: number;
  nextStartTimeMs?: number;
  loopbackDeviceId?: string;
};

type Request = (LineRecordParams & { _reqId: number }) | null;

export function useLineRecorder() {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [lastBlob, setLastBlob] = useState<Blob | null>(null);

  // fire-and-forget intent; useEffect will run the async
  const [request, setRequest] = useState<Request>(null);
  const reqCounter = useRef(0);

  function start(params: LineRecordParams) {
    reqCounter.current += 1;
    setRequest({ ...params, _reqId: reqCounter.current });
  }

  useEffect(() => {
    if (!request) return;

    setBusy(true);
    setStatus("Preparing…");

    const { startTimeMs, nextStartTimeMs, loopbackDeviceId } = request;

    recordLine({
      startTimeMs,
      nextStartTimeMs,
      loopbackDeviceId,
      onStatus: (s) => setStatus(s),
      // no stopSignal$
    })
      .then((blob) => {
        setLastBlob(blob);

// Auto download the audio recordings?
      if (!blob) return;
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `capture-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);

        toast.success("Recorded line", {
          description: `${((blob.size || 0) / 1024).toFixed(1)} KB · webm/opus`,
        });
      })
      .catch((e) => {
        console.error(e);
        toast.error("Recording failed", { description: e?.message ?? String(e) });
      })
      .finally(() => {
        setBusy(false);
        setStatus("");
        // clear request so we can trigger again later
        setRequest(null);
      });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request?._reqId]); // only re-run when a new "intent" arrives

  return { start, busy, status, lastBlob };
}
