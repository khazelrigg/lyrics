"use client";

import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Type, AlignCenter, AlignLeft, AlignRight } from "lucide-react";
import {
  useSettingsStore,
  type FontFamily,
  type TextAlignment,
} from "@/stores/settingsStore";
import { cn } from "@/lib/utils";

export function FontSettingsDrawer() {
  const {
    fontSettings,
    increaseFontSize,
    decreaseFontSize,
    setFontFamily,
    setTextAlignment,
  } = useSettingsStore();
  const [isOpen, setIsOpen] = useState(false);

  const fontOptions: { value: FontFamily; label: string }[] = [
    { value: "sans", label: "Sans" },
    { value: "serif", label: "Serif" },
    { value: "mono", label: "Mono" },
    { value: "rounded", label: "Rounded" },
  ];

  const alignmentOptions: { value: TextAlignment; icon: React.ReactNode }[] = [
    { value: "left", icon: <AlignLeft className="h-6! w-6!" strokeWidth={3} /> },
    { value: "center", icon: <AlignCenter className="h-6! w-6!" strokeWidth={3} /> },
    { value: "right", icon: <AlignRight className="h-6! w-6!" strokeWidth={3} /> },
  ];

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-20 right-4 rounded-full p-2 bg-white shadow-md"
          aria-label="Font settings"
        >
          <Type className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="bg-white">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader className="text-center hidden">
            <DrawerTitle className="text-gray-400 tracking-wider">
              FONTS
            </DrawerTitle>
          </DrawerHeader>

          <div className="p-4 pb-8">
            <div className="flex justify-between items-center mb-8">
              {/* Font size controls */}
              <div className="flex">
                <Button
                  variant="ghost"
                  className="text-gray-500 text-xl font-medium"
                  onClick={decreaseFontSize}
                  aria-label="Decrease font size"
                >
                  A-
                </Button>
                <Button
                  variant="ghost"
                  className="text-gray-500 text-xl font-medium"
                  onClick={increaseFontSize}
                  aria-label="Increase font size"
                >
                  A+
                </Button>
              </div>

              {/* Text alignment options */}
              <div className="flex gap-4">
                {alignmentOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant="ghost"
                    className={cn(
                      "h-10 w-10 p-0 text-2xl",
                      fontSettings.textAlignment === option.value
                        ? "text-ui-accent"
                        : "text-gray-400"
                    )}
                    onClick={() => setTextAlignment(option.value)}
                    aria-label={`Align text ${option.value}`}
                    aria-pressed={fontSettings.textAlignment === option.value}
                  >
                    {option.icon}
                  </Button>
                ))}
              </div>
            </div>

            {/* Font family options */}
            <div className="grid grid-cols-4 gap-2">
              {fontOptions.map((font, index) => (
                <Button
                  key={font.value}
                  variant="ghost"
                  title={font.value}
                  className={cn(
                    "aspect-square w-full h-full flex items-center justify-center rounded",
                    fontSettings.fontFamily === font.value
                      ? "bg-ui-accent text-white"
                      : "bg-gray-100 text-gray-500",
                    font.value === "sans" && "font-sans",
                    font.value === "serif" && "font-serif",
                    font.value === "mono" && "font-mono",
                    font.value === "rounded" && "font-rounded"
                  )}
                  onClick={() => setFontFamily(font.value)}
                  aria-pressed={fontSettings.fontFamily === font.value}
                >
                  <span className="text-3xl">Aa</span>
                </Button>
              ))}{" "}
            </div>


          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
