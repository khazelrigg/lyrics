import { useState } from "react";

import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import CollapsedNowPlayingCard from "@/components/CollapsedNowPlayingCard";
import ExpandedNowPlayingCard from "@/components/ExpandedNowPlayingCard";

export default function NowPlayingDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div>
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerTrigger asChild>
          <div onClick={toggleDrawer}>
            <CollapsedNowPlayingCard />
          </div>
        </DrawerTrigger>
        <DrawerContent>
          <div className="mx-auto w-full max-w-sm">
            <ExpandedNowPlayingCard />
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
