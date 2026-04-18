# Phase 4: Personalization & Advanced Features — Plan

## Objective
Implement persistence, likes, albums, and advanced playback controls for a music player app.

## Dependencies
- `expo-file-system` (legacy API) — for reading/writing library store JSON
- `zustand` — state management (already installed)
- `expo-media-library` — song metadata (already installed)
- `expo-av` — audio playback (already installed)

## Implementation Approach

### 1. Library Store (Persistence)
- Location: `stores/useLibraryStore.ts`
- Schema: `likedSongIds`, `albums`, `isLoading`, `isLoaded`, `error`
- File: `FileSystem.documentDirectory + 'library-store.json'`
- Uses legacy `expo-file-system/legacy` API for SDK 54 compatibility

### 2. Likes System
- Toggle on song list rows and liked songs tab
- Persisted to filesystem
- Derived from `useLibraryStore.likedSongIds`

### 3. Albums Feature
- CRUD operations: create, rename, delete albums
- Add songs via long-press menu
- Song options modal with album picker
- Album detail screen at `app/(tabs)/album/[id].tsx`

### 4. Song Options Modal
- Component: `components/SongOptionsModal.tsx`
- Options: Play Now, Play Next, Add to Queue, Add to Album
- Album picker with create new album option

### 5. System Albums
- Auto-generated from song metadata
- Grouped by `song.album` and `song.artist`
- Visually distinguished with folder icon and "Auto-generated" label

### 6. Advanced Queue & Playback Modes
- Repeat modes: `off` → `all` → `one`
- Shuffle with original order preservation
- Queue actions: Play Now, Play Next, Add to Queue

## Files Modified/Created
- `stores/useLibraryStore.ts` — Updated to use legacy File API
- `components/SongOptionsModal.tsx` — New component for song options
- `app/(tabs)/index.tsx` — Integrated song options modal
- `app/(tabs)/library.tsx` — Integrated song options modal in liked songs
- `app/(tabs)/album/[id].tsx` — Album detail screen
- `app/modal.tsx` — Fixed icon name
- `services/musicService.ts` — Fixed metadata extraction

## Status: Completed ✅
