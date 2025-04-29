"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [artist, setArtist] = useState("");
  const [track, setTrack] = useState("");
  const [results, setResults] = useState<any[]>([]); // Replace `any` with better type later

  const handleSearch = async () => {
    // You would call your API here
    const response = await fetch(`/api/search?artist=${artist}&track=${track}`);
    const data = await response.json();
    setResults(data.results); // adjust based on your API
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Search Lyrics</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-row gap-4">
            <Input
              placeholder="Track Title"
              value={track}
              onChange={(e) => setTrack(e.target.value)}
            />
            <Input
              placeholder="Artist Name"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
          </div>
          <Button onClick={handleSearch}>Search</Button>

          {/* Search Results */}
          <div className="mt-4 space-y-2">
            {results.map((result, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  // TODO: Load lyrics into LyricsScroll
                  onOpenChange(false); // Close modal
                }}
              >
                {result.trackTitle} - {result.artistName}
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
