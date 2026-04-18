# Phase 3 Tasks

## Song List Screen
- [x] Create `app/(tabs)/index.tsx` with FlatList
- [x] Implement search bar with TextInput
- [x] Add case-insensitive search filtering by title and artist
- [x] Implement sort options (A-Z, Z-A, Artist, Duration)
- [x] Add RefreshControl for pull-to-refresh
- [x] Handle states: Permission Denied, Loading, Error, Empty, Content

## Playback Engine
- [x] Update `audioService.ts` with `configureAudioMode()`
- [x] Configure staysActiveInBackground: true
- [x] Configure playsInSilentModeIOS: true
- [x] Configure shouldDuckAndroid: true
- [x] Implement loadAudio, playAudio, pauseAudio, seekAudio, unloadAudio
- [x] Update `usePlayerStore.ts` with initializePlayer that calls configureAudioMode
- [x] Implement setQueue, setCurrentSong, play, pause, next, previous, seek

## Now Playing Screen
- [x] Create `app/modal.tsx` with artwork display
- [x] Add title and artist text
- [x] Implement seek bar with progress visualization
- [x] Add time labels with formatDuration
- [x] Wire play/pause, previous, next, repeat controls

## Mini Player
- [x] Create `components/MiniPlayer.tsx`
- [x] Wrap in SafeAreaView
- [x] Hide when currentSong is null
- [x] Hide when modal is open (via pathname check in _layout.tsx)
- [x] Add play/pause quick action

## Integration
- [x] Call initializePlayer in app/_layout.tsx
- [x] Render MiniPlayer in root layout
- [x] Bind song list to usePlayerStore state
- [x] Wire all playback controls

## Verification
- [ ] Run `npx expo lint` to verify no TypeScript errors
- [ ] Test playback with background audio
- [ ] Test search and sort functionality
