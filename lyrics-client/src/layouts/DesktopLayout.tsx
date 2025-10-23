import Header from "@/components/ui/header";
import LyricsScroll from "@/components/lyrics/LyricsScroll";
import NowPlayingDrawer from "@/components/now-playing/Drawer";
import { FontSettingsDrawer } from "@/components/modals/FontSettings";

export default function MobileLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <LyricsScroll />
      </main>

      {/* Now Playing Card fixed at bottom */}
      <div className="sticky z-10 bottom-0 w-full bg-background">
        <NowPlayingDrawer />
        <FontSettingsDrawer />
      </div>
    </div>
  );
}
