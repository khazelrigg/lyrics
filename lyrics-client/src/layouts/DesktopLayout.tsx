import Header from "@/components/ui/header";
import LyricsScroll from "@/components/lyrics/LyricsScroll";
import NowPlayingDrawer from "@/components/now-playing/Drawer";
import { FontSettingsDrawer } from "@/components/modals/FontSettings";
import { LoopbackPicker } from "@/components/modals/LoopbackPicker";

import { useWebSocketTextSender } from "@/hooks/useWebSocketTextSender";
import { useWebSocketLyrics } from "@/hooks/useWebSocketLyrics";

export default function DesktopLayout() {
  /**
   * 1️⃣ Connect to relay / Agent / Textractor
   */
  const { isOpen, sendText } = useWebSocketTextSender({
    debug: true,
  });

  /**
   * 2️⃣ Broadcast lyrics automatically
   */
  useWebSocketLyrics(sendText, {
    enabled: isOpen,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <LoopbackPicker />

      {/* Debug indicator */}
      <div className="px-3 py-1 text-xs opacity-60">
        WS: {isOpen ? "Connected ✅" : "Disconnected ❌"}
      </div>

      <main className="flex-1 overflow-y-auto">
        <LyricsScroll />
      </main>

      <div className="sticky bottom-0 z-10 w-full bg-background">
        <NowPlayingDrawer />
        <FontSettingsDrawer />
      </div>
    </div>
  );
}