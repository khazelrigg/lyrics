# Frontend Client Instructions

This is the frontend for a Japanese lyrics synchronization app.

## Stack

* React
* Vite
* TypeScript
* Tailwind CSS v4
* shadcn/ui
* Zustand
* React Router
* Lucide React icons

## Project Structure

Use the existing folder structure:

* `src/components` for reusable UI and feature components
* `src/components/ui` for shadcn components
* `src/components/layout` for layout, headers, navigation, and page shells
* `src/components/lyrics` for lyrics-related UI
* `src/pages` for route-level pages
* `src/hooks` for reusable React logic
* `src/services` for API and external service calls
* `src/stores` for Zustand stores
* `src/types` for shared TypeScript types
* `src/lib` for utility functions

## Import Rules

Use `@` aliases instead of long relative imports.

Prefer:

```ts
import { Button } from "@/components/ui/button";
import { useSpotifyStore } from "@/stores/spotifyStore";
```

Avoid:

```ts
import { Button } from "../../components/ui/button";
```

Use `@/stores/spotifyStore`, not `@/store/spotifyStore`.

## Styling Rules

* Use Tailwind utility classes.
* Prefer shadcn components for buttons, dropdowns, dialogs, cards, inputs, menus, and common UI primitives.
* Use Lucide icons instead of Material Symbols.
* Do not add Google Fonts or remote font links.
* Keep the visual style dark, glassy, and Spotify-inspired.
* Prefer green accents using `text-green-400`, `bg-green-400`, or existing theme primary classes.
* Avoid inline styles unless needed for dynamic values like progress width or animation delay.

## Component Rules

* Keep route-level pages in `src/pages`.
* Keep reusable components small and focused.
* Pages should arrange components and connect hooks/stores.
* Components should receive props instead of fetching data directly unless they are specifically hook/container components.
* Reuse existing components before creating new ones.
* Do not duplicate layout/navigation components.

## Lyrics UI Rules

Lyrics display should support:

* synced lyrics
* unsynced lyrics
* no lyrics found
* instrumental tracks
* loading state
* error state

For synced lyrics:

* Show timestamps.
* Highlight only the active line.
* Dim past and upcoming lines.

For unsynced lyrics:

* Hide timestamps.
* Do not dim lyric lines.
* Treat all lines as readable text.

## Spotify Rules

Spotify authentication and playback state are managed through Zustand and services.

* Auth helpers live in `src/services/spotifyAuth`.
* Playback/API helpers live in Spotify service files.
* Spotify state lives in `src/stores/spotifyStore`.
* Use a single session hook to hydrate account state and poll playback.
* Do not create duplicate Spotify stores.
* Tokens are stored in localStorage by the auth service.
* Zustand auth state must be hydrated after reload using the Spotify session hook.

## State Management Rules

Use local component state for:

* temporary UI state
* open/closed menus
* small form inputs
* hover/selection state

Use Zustand for:

* Spotify auth state
* Spotify playback state
* global app state shared across unrelated components

Avoid putting one-off component state into Zustand.

## API Rules

* Use service files for fetch calls.
* Hooks may call services.
* Components should usually call hooks, not fetch directly.
* Handle loading, error, empty, and success states explicitly.
* Do not assume missing lyrics is always an error; it may be a valid app state.

## TypeScript Rules

* Prefer explicit props types.
* Keep shared API/data types in `src/types`.
* Avoid `any` unless working around unknown third-party API responses.
* If using `any`, keep it localized and do not spread it across app types.

## Quality Checks

After changes, check:

```bash
npm run dev
```

Fix TypeScript, import, and lint errors before considering the task complete.
