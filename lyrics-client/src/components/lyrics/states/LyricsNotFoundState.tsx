// src/components/lyrics/NoLyricsFoundState.tsx

import { Search, Plus, Music } from "lucide-react";
import { Button } from "@/components/ui/button";

type NoLyricsFoundStateProps = {
  title?: string;
  subtitle?: string;
  onSearch?: () => void;
  onAddManually?: () => void;
};

export function LyricsNotFoundState({
  title = "No lyrics found for this track",
  subtitle = "Try searching for lyrics manually or add them yourself to sync with the music.",
  onSearch,
  onAddManually,
}: NoLyricsFoundStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-8">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
          <Music className="h-12 w-12 text-muted-foreground/50" />
        </div>

        <h2 className="mb-2 text-2xl font-bold tracking-tight text-white">
          {title}
        </h2>

        <p className="mx-auto max-w-xs text-sm leading-6 text-muted-foreground">
          {subtitle}
        </p>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button
          size="lg"
          className="rounded-full"
          onClick={onSearch}
        >
          <Search className="mr-2 h-4 w-4" />
          Search for Lyrics
        </Button>

        <Button
          size="lg"
          variant="outline"
          className="rounded-full"
          onClick={onAddManually}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Manually
        </Button>
      </div>
    </div>
  );
}