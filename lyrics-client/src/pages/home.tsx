import MobileLayout from "@/layouts/MobileLayout";
import DesktopLayout from "@/layouts/DesktopLayout";
import useMediaQuery from "@/hooks/useMediaQuery";

import { ThemeProvider } from "@/components/theme-provider"

export default function HomePage() {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      {isDesktop ? <DesktopLayout /> : <MobileLayout />}
    </ThemeProvider>
  )
}
