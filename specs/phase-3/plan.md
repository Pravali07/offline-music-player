# Phase 3 Plan: Core Playback Experience

## Goals
Deliver the complete music playing experience: browse, play, control, search.

## Deliverables

1. **Song List Screen** (`app/(tabs)/index.tsx`)
   - FlatList with keyExtractor
   - Search bar with case-insensitive filtering
   - Sort options (A-Z, Z-A, Artist, Duration)
   - Pull-to-refresh with RefreshControl
   - State handling: Permission Denied, Loading, Error, Empty, Content

2. **Playback Engine**
   - `audioService.ts` with `configureAudioMode()` for background audio
   - `usePlayerStore.ts` manages Audio.Sound lifecycle
   - Play, Pause, Next, Previous, Seek actions
   - Auto-advance on track end

3. **Now Playing Screen** (`app/modal.tsx`)
   - Artwork with fallback placeholder
   - Title and artist display
   - Seek bar with position/duration
   - Time labels with formatDuration
   - Play/Pause, Previous, Next, Repeat controls

4. **Mini Player** (`components/MiniPlayer.tsx`)
   - Wrapped in SafeAreaView
   - Hidden when queue empty
   - Hidden when Now Playing modal is open
   - Play/pause quick action

## Verification
- [ ] `npx expo lint` passes
- [ ] Playback works with background audio
- [ ] Search filters songs by title/artist
- [ ] Sort options reorder the list
