import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import CollapsedNowPlayingCard from "@/components/CollapsedNowPlayingCard";
import ExpandedNowPlayingCard from "@/components/ExpandedNowPlayingCard";

export default function NowPlayingDrawer() {

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div>
          <CollapsedNowPlayingCard />
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <ExpandedNowPlayingCard />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
