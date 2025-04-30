import { Drawer, DrawerContent, DrawerHeader, DrawerTrigger, DrawerTitle, DrawerDescription } from "@/components/ui/drawer";
import CollapsedCard from "@/components/now-playing/CollapsedCard";
import ExpandedCard from "@/components/now-playing/ExpandedCard";

export default function NowPlayingDrawer() {

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div>
          <CollapsedCard />
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="hidden">
          <DrawerTitle>Now Playing</DrawerTitle>
          <DrawerDescription>Currently playing track from Spotify</DrawerDescription>
        </DrawerHeader>
        <div className="mx-auto w-full max-w-sm">
          <ExpandedCard />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
