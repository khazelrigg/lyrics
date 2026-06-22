// src/pages/HomePage.tsx

//import NowPlayingDebugCard from "@/components/NowPlaying/NowPlayingDebugCard";
import NowPlayingStatus from "@/components/NowPlaying/NowPlayingCard";

import { AppHeader } from "@/components/layout/AppHeader";
import {
  OtherSettingsPanel,
  type FontFamily,
  type FontSize,
} from "@/components/settings/SettingsPanel";
import { useState } from "react";

export default function LibraryPage() {

  const [fontFamily, setFontFamily] = useState<FontFamily>("sora");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [lightMode, setLightMode] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTranslations, setShowTranslations] = useState(false);

  return (
    <div className="flex-1 flex flex-col w-full h-full">
      <AppHeader title="Lyrics" showCollapse />

      <div className="px-4 items-center w-full">
        <NowPlayingStatus />
      </div>

      <main className="flex-1 flex flex-col px-4 ">
        {/* Set content based on lyrics state */}
        <OtherSettingsPanel
          fontFamily={fontFamily}
          fontSize={fontSize}
          onFontFamilyChange={setFontFamily}
          onFontSizeChange={setFontSize}
          lightMode={lightMode}
          onLightModeChange={setLightMode}
          autoScroll={autoScroll}
          onAutoScrollChange={setAutoScroll}
          showTranslations={showTranslations}
          onShowTranslationsChange={setShowTranslations}
        />
        {/*<LyricsViewer lyrics={lyrics ?? dummyLyrics} />*/}
      </main>
    </div>
  );
}
