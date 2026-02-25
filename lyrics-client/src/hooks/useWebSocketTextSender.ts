// src/hooks/useWebSocketTextSender.ts
import { useCallback, useEffect, useRef, useState } from "react";

type Options = {
  /** Try these WebSocket URLs in order until one connects */
  urls?: string[];
  /** Auto reconnect if the server restarts */
  reconnect?: boolean;
  reconnectDelayMs?: number;
  debug?: boolean;
};

type CloseInfo = {
  code: number;
  reason: string;
  wasClean: boolean;
  at: number;
};

const DEFAULT_URLS = [
  "ws://127.0.0.1:6677", // Textractor_websocket default
];

export function useWebSocketTextSender(opts: Options = {}) {
  const {
    urls = DEFAULT_URLS,
    reconnect = true,
    reconnectDelayMs = 3000,
    debug = false,
  } = opts;

  const wsRef = useRef<WebSocket | null>(null);
  const activeUrlRef = useRef<string | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  const attemptRef = useRef(0);

  const [isOpen, setIsOpen] = useState(false);
  const [activeUrl, setActiveUrl] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastClose, setLastClose] = useState<CloseInfo | null>(null);

  const log = useCallback(
    (...args: any[]) => {
      if (debug) console.log("[ws-text]", ...args);
    },
    [debug]
  );

  const clearReconnectTimer = useCallback(() => {
    if (reconnectTimerRef.current != null) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const closeCurrent = useCallback(() => {
    clearReconnectTimer();
    const ws = wsRef.current;
    wsRef.current = null;
    activeUrlRef.current = null;

    if (
      ws &&
      (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
    ) {
      try {
        ws.close();
      } catch {
        // ignore
      }
    }
  }, [clearReconnectTimer]);

  const connectToFirstAvailable = useCallback(async () => {
    attemptRef.current += 1;
    const attempt = attemptRef.current;

    closeCurrent();
    setIsOpen(false);
    setActiveUrl(null);
    setLastError(null);

    log("connect attempt", attempt, "urls=", urls);

    for (const url of urls) {
      try {
        log("trying", url);
        const ws = new WebSocket(url);

        // Wait for open; treat error/close during connect as failure and try next URL.
        await new Promise<void>((resolve, reject) => {
          ws.onopen = () => resolve();
          ws.onerror = () => reject(new Error("ws.onerror during connect"));
          ws.onclose = () => reject(new Error("ws.onclose during connect"));
        });

        // Connected!
        wsRef.current = ws;
        activeUrlRef.current = url;

        setIsOpen(true);
        setActiveUrl(url);
        setLastError(null);

        log("OPEN ✅", url);

        ws.onmessage = (evt) => {
          // Agent/Textractor usually won't send anything back; keep for debugging.
          log("message", evt.data);
        };

        ws.onerror = (evt) => {
          log("ERROR ❌", { url, readyState: ws.readyState, evt });
          setLastError("WebSocket error");
          // onclose usually follows
        };

        ws.onclose = (evt) => {
          const info: CloseInfo = {
            code: evt.code,
            reason: evt.reason,
            wasClean: evt.wasClean,
            at: Date.now(),
          };
          log("CLOSE", { url, ...info });

          setIsOpen(false);
          setLastClose(info);

          if (wsRef.current === ws) {
            wsRef.current = null;
            activeUrlRef.current = null;
            setActiveUrl(null);
          }

          if (reconnect) {
            clearReconnectTimer();
            reconnectTimerRef.current = window.setTimeout(
              () => connectToFirstAvailable(),
              reconnectDelayMs
            );
          }
        };

        return; // stop trying other urls
      } catch (e) {
        log("failed", url, e);
        // try next url
      }
    }

    // None worked
    setLastError(`No WebSocket server found on: ${urls.join(", ")}`);
    setIsOpen(false);
    setActiveUrl(null);

    if (reconnect) {
      clearReconnectTimer();
      reconnectTimerRef.current = window.setTimeout(
        () => connectToFirstAvailable(),
        reconnectDelayMs
      );
    }
  }, [urls, reconnect, reconnectDelayMs, log, closeCurrent, clearReconnectTimer]);

  useEffect(() => {
    connectToFirstAvailable();
    return () => closeCurrent();
  }, [connectToFirstAvailable, closeCurrent]);

  /**
   * Send a plain TEXT frame (Textractor-compatible).
   * Return true if sent, false if not connected.
   */
  const sendText = useCallback(
    (text: string) => {
      const ws = wsRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        log("sendText skipped (not open)", { text });
        return false;
      }
      ws.send(text);
      log("sent", { text });
      return true;
    },
    [log]
  );

  const reconnectNow = useCallback(() => {
    log("manual reconnectNow()");
    connectToFirstAvailable();
  }, [connectToFirstAvailable, log]);

  return {
    isOpen,
    activeUrl,
    lastError,
    lastClose,
    sendText,
    reconnectNow,
  };
}