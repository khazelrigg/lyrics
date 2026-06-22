# Lyrics Client

React, TypeScript, Vite, Zustand, shadcn/ui, and Tailwind CSS frontend for the
lyrics application. The client connects to Spotify for account and playback
state, then requests lyrics from the FastAPI backend for the current track.

## Setup

```bash
cd lyrics-client
npm install
npm run dev
```

The client expects these environment variables:

```dotenv
VITE_API_URL=http://localhost:8000
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
VITE_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

## Quality Checks

```bash
npm test
npm run lint
npm run build
```

## Lyrics Viewer

`ImmersiveLyricsViewer` is the canonical lyrics display. It accepts a
`LyricsData` object and chooses one of two rendering modes:

- **Synced lyrics:** timestamped, seekable lines with one active line based on
  the estimated Spotify playback position.
- **Unsynced lyrics:** plain selectable paragraphs without timestamps,
  highlighting, seeking, or automatic scrolling. Keeping the text as normal DOM
  text allows browser tools such as Yomitan to inspect it.

### Synchronization

`useEstimatedProgress` combines Spotify's last reported position with elapsed
wall-clock time while playback is active. The result is clamped between zero and
the track duration. `getActiveLyricsLineIndex` then selects the latest valid
line whose timestamp is less than or equal to that estimated position.

The active-line helper intentionally:

- returns `-1` before the first timed line or for invalid playback positions;
- ignores missing, negative, and non-finite timestamps;
- selects the last line when multiple lines share a timestamp;
- keeps the final timed line active after its start time.

### Auto-Follow

For synced lyrics, the viewer centers the active line when the active index
changes. It avoids small corrections while the line remains in a centered
visibility zone and uses instant scrolling when the user prefers reduced motion.

Wheel, touch, pointer, and scroll-navigation keyboard input pause auto-follow.
The resume button restores following and immediately centers the current line.
Changing tracks also resets follow state and clears seek errors.

### Seeking And Selection

Timestamped lines behave as keyboard-accessible buttons. Clicking a line or
pressing Enter/Space seeks Spotify to that timestamp and resumes auto-follow.
If text is currently selected, the click is ignored so dictionary lookup and
copying text do not accidentally change playback. Seek failures appear as a
non-blocking status message while the lyrics remain visible.

### Main Files

- `src/components/lyrics/ImmersiveLyricsViewer.tsx`: rendering, follow state,
  scrolling, and seek orchestration.
- `src/components/lyrics/SyncedLyricsLine.tsx`: presentation and accessible
  interaction for one timestamped line.
- `src/components/lyrics/lyricsSync.ts`: pure timestamp validation and active
  line calculation.
- `src/hooks/useEstimatedProgress.ts`: smooth client-side playback estimate.

## Future Ideas

- Furigana and optional tokenizer-backed word rendering
- Translation display modes
- Spotify playback history
- Printing and exporting lyrics
- Music video lookup
- Favorite lyrics and local caching

## References

- [@patdx/kuromoji](https://www.jsdelivr.com/package/npm/@patdx/kuromoji)
- [Motion transitions](https://motion.dev/docs/react-transitions#setting-a-transition)
- [KOReader Japanese support](https://github-wiki-see.page/m/koreader/koreader/wiki/Japanese-Support)
