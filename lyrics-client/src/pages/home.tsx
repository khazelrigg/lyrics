import MobileLayout from "@/layouts/MobileLayout";
import DesktopLayout from "@/layouts/DesktopLayout";
import useMediaQuery from "@/hooks/useMediaQuery";

import { ThemeProvider } from "@/components/layout/ThemeProvider"
import { useSpotifyNowPlaying } from "@/hooks/useSpotifyNowPlaying";
import { useSpotifyAuthGuard } from "@/hooks/useSpotifyAuthGuard";

export default function HomePage() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Hook to keep spotify authenticated
  useSpotifyAuthGuard();
  // Hook to watch spotify playback
  useSpotifyNowPlaying();

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}
    </ThemeProvider>
  )
}
