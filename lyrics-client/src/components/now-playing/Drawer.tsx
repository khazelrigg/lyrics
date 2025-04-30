import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
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
        <div className="mx-auto w-full max-w-sm">
          <ExpandedCard />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
