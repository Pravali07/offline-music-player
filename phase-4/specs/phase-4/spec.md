# Phase 4: Personalization & Advanced Features — Specification

## 1. Objective

Enhance user experience with persistence, likes, albums, and advanced playback controls — consistent across both platforms.

---

## 2. Dependencies

Required packages (from previous phases):
- `expo-file-system` — for reading and writing the library store JSON file
- `zustand` — for state management (already installed)
- `expo-media-library` — for song metadata (already installed)
- `expo-av` — for audio playback (already installed)

### API Notes
- Uses `expo-file-system/legacy` for persistence (SDK 54 compatibility)
- Music metadata extracted from `MediaLibrary.Asset` with proper fallback values

---

## 3. Library Store (Persistence)

### 3.1 Location
`stores/useLibraryStore.ts`

### 3.2 Schema

```typescript
interface LibraryState {
  likedSongIds: string[];
  albums: Album[];
  isLoading: boolean;
  error: string | null;
  version: number;
}

interface Album {
  id: string;
  name: string;
  songIds: string[];
  createdAt: string;
}
```

### 3.3 Persistence File

- **Location:** `FileSystem.documentDirectory + 'library-store.json'`
- **Loaded:** On app startup inside `useLibraryStore`
- **Written:** On every mutation (like toggle, album CRUD)
- **Missing file:** Initialize with empty defaults (not an error)
- **Corrupt file:** Log error, reset to empty defaults, do not crash

### 3.4 Implementation

```typescript
import { create } from 'zustand';
import * as FileSystem from 'expo-file-system';

const STORE_FILE = FileSystem.documentDirectory + 'library-store.json';
const STORE_VERSION = 1;

interface Album {
  id: string;
  name: string;
  songIds: string[];
  createdAt: string;
}

interface LibraryState {
  likedSongIds: string[];
  albums: Album[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  loadLibrary: () => Promise<void>;
  saveLibrary: () => Promise<void>;
  toggleLike: (songId: string) => void;
  isLiked: (songId: string) => boolean;
  createAlbum: (name: string) => void;
  renameAlbum: (albumId: string, name: string) => void;
  deleteAlbum: (albumId: string) => void;
  addSongToAlbum: (albumId: string, songId: string) => void;
  removeSongFromAlbum: (albumId: string, songId: string) => void;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  likedSongIds: [],
  albums: [],
  isLoading: true,
  isLoaded: false,
  error: null,

  loadLibrary: async () => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(STORE_FILE);
      
      if (!fileInfo.exists) {
        set({ isLoading: false, isLoaded: true });
        return;
      }

      const content = await FileSystem.readAsStringAsync(STORE_FILE);
      const data = JSON.parse(content);

      set({
        likedSongIds: data.likedSongIds || [],
        albums: data.albums || [],
        isLoading: false,
        isLoaded: true,
      });
    } catch (error) {
      console.error('Failed to load library:', error);
      set({ isLoading: false, isLoaded: true, error: 'store_corrupt' });
    }
  },

  saveLibrary: async () => {
    try {
      const { likedSongIds, albums } = get();
      const data = {
        likedSongIds,
        albums,
        version: STORE_VERSION,
      };
      await FileSystem.writeAsStringAsync(STORE_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save library:', error);
    }
  },

  toggleLike: (songId) => {
    const { likedSongIds, saveLibrary } = get();
    const isLiked = likedSongIds.includes(songId);
    
    const newLikedSongIds = isLiked
      ? likedSongIds.filter(id => id !== songId)
      : [...likedSongIds, songId];
    
    set({ likedSongIds: newLikedSongIds });
    saveLibrary();
  },

  isLiked: (songId) => {
    return get().likedSongIds.includes(songId);
  },

  createAlbum: (name) => {
    const { albums, saveLibrary } = get();
    const newAlbum: Album = {
      id: generateUUID(),
      name,
      songIds: [],
      createdAt: new Date().toISOString(),
    };
    set({ albums: [...albums, newAlbum] });
    saveLibrary();
  },

  renameAlbum: (albumId, name) => {
    const { albums, saveLibrary } = get();
    set({
      albums: albums.map(album =>
        album.id === albumId ? { ...album, name } : album
      ),
    });
    saveLibrary();
  },

  deleteAlbum: (albumId) => {
    const { albums, saveLibrary } = get();
    set({ albums: albums.filter(album => album.id !== albumId) });
    saveLibrary();
  },

  addSongToAlbum: (albumId, songId) => {
    const { albums, saveLibrary } = get();
    set({
      albums: albums.map(album =>
        album.id === albumId && !album.songIds.includes(songId)
          ? { ...album, songIds: [...album.songIds, songId] }
          : album
      ),
    });
    saveLibrary();
  },

  removeSongFromAlbum: (albumId, songId) => {
    const { albums, saveLibrary } = get();
    set({
      albums: albums.map(album =>
        album.id === albumId
          ? { ...album, songIds: album.songIds.filter(id => id !== songId) }
          : album
      ),
    });
    saveLibrary();
  },
}));

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
```

---

## 4. Likes System

### 4.1 Like Toggle

Available on:
- Song list rows (via `SongListItem`)
- Now Playing screen
- Song options menu

### 4.2 Implementation

```typescript
// In SongListItem.tsx
interface SongListItemProps {
  song: Song;
  isPlaying: boolean;
  onPress: (song: Song) => void;
  onLongPress?: (song: Song) => void;
  isLiked?: boolean;
  onToggleLike?: (songId: string) => void;
}
```

### 4.3 Liked Songs Screen

Location: `app/(tabs)/library.tsx` (within Library tab)

```typescript
function LikedSongsScreen() {
  const { likedSongIds } = useLibraryStore();
  const { songs } = usePlayerStore();
  
  const likedSongs = songs.filter(song => likedSongIds.includes(song.id));
  
  // Uses same SongListItem component as main list
  return (
    <FlatList
      data={likedSongs}
      renderItem={({ item }) => (
        <SongListItem
          song={item}
          isPlaying={false}
          onPress={handlePlay}
        />
      )}
      keyExtractor={item => item.id}
    />
  );
}
```

---

## 5. Albums Feature

### 5.1 User Albums

| Action | Implementation |
|--------|----------------|
| Create | Name input → generate UUID → save to store |
| Rename | Inline edit or modal → update store |
| Delete | Confirmation dialog → remove album and references |
| Add song | Accessible from song options menu |
| Remove song | Album detail screen → remove from album |

### 5.2 Album Detail Screen

Location: `app/(tabs)/album/[id].tsx`

```typescript
// app/(tabs)/album/[id].tsx
import { useLocalSearchParams, Stack } from 'expo-router';
import { FlatList, Alert } from 'react-native';
import { useLibraryStore } from '@/stores';
import { usePlayerStore } from '@/stores';
import { SongListItem } from '@/components/SongListItem';

export default function AlbumDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { albums, deleteAlbum, removeSongFromAlbum } = useLibraryStore();
  const { songs, setQueue, setCurrentSong } = usePlayerStore();
  
  const album = albums.find(a => a.id === id);
  const albumSongs = songs.filter(song => album?.songIds.includes(song.id));
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Album',
      'Are you sure you want to delete this album?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteAlbum(id) },
      ]
    );
  };
  
  const handleRemoveSong = (songId: string) => {
    removeSongFromAlbum(id, songId);
  };
  
  return (
    <>
      <Stack.Screen options={{ title: album?.name }} />
      <FlatList
        data={albumSongs}
        renderItem={({ item }) => (
          <SongListItem
            song={item}
            isPlaying={false}
            onPress={handlePlay}
            onLongPress={() => handleRemoveSong(item.id)}
          />
        )}
        keyExtractor={item => item.id}
      />
    </>
  );
}
```

---

## 6. System Albums

### 6.1 Auto-Generated Albums

Grouped by metadata (not user-created):
- By album name (`song.album`)
- By artist name (`song.artist`)

### 6.2 Implementation

```typescript
function getSystemAlbums(songs: Song[]) {
  const albumMap = new Map<string, Song[]>();
  const artistMap = new Map<string, Song[]>();
  
  for (const song of songs) {
    // Group by album
    if (!albumMap.has(song.album)) {
      albumMap.set(song.album, []);
    }
    albumMap.get(song.album)!.push(song);
    
    // Group by artist
    if (!artistMap.has(song.artist)) {
      artistMap.set(song.artist, []);
    }
    artistMap.get(song.artist)!.push(song);
  }
  
  return {
    albums: Array.from(albumMap.entries()).map(([name, songs]) => ({
      id: `system-album-${name}`,
      name,
      songIds: songs.map(s => s.id),
      isSystemAlbum: true,
    })),
    artists: Array.from(artistMap.entries()).map(([name, songs]) => ({
      id: `system-artist-${name}`,
      name,
      songIds: songs.map(s => s.id),
      isSystemAlbum: true,
    })),
  };
}
```

### 6.3 Visual Distinction

System albums shown with:
- Different icon (folder vs music note)
- "Auto-generated" label
- Read-only (no add/remove actions)

---

## 7. Advanced Queue & Playback Modes

### 7.1 Repeat Modes

States: `off` → `all` → `one` (cycles on button tap)

| Mode | Behavior |
|------|----------|
| off | Stop at end of queue |
| all | Loop to beginning |
| one | Repeat current song |

### 7.2 Shuffle Mode

| Action | Behavior |
|--------|----------|
| Enable | Shuffle queue, preserve original order internally |
| Disable | Restore original order |
| Next (shuffle on) | Play random track from remaining |

### 7.3 Queue Actions

From song options menu:
- **Play Now**: Replace queue, start playing immediately
- **Play Next**: Insert after current song
- **Add to Queue**: Append to end of queue

```typescript
// In usePlayerStore
playNext: (songId: string) => {
  const { queue, queueIndex } = get();
  const song = queue.find(s => s.id === songId);
  if (!song) return;
  
  const newQueue = [...queue];
  newQueue.splice(queueIndex + 1, 0, song);
  set({ queue: newQueue });
};

addToQueue: (songId: string) => {
  const { queue } = get();
  const song = queue.find(s => s.id === songId);
  if (!song) return;
  
  set({ queue: [...queue, song] });
};
```

---

## 8. Performance & Stability

### 8.1 Virtualization

- All long lists use `FlatList` — never `ScrollView`
- `keyExtractor` on `song.id`

### 8.2 Asset Fetching

- Pagination via cursor (from Phase 2)
- Batched `getAssetInfoAsync` calls

### 8.3 Race Condition Guard

```typescript
let lastTrackChange = 0;
const TRACK_CHANGE_DEBOUNCE_MS = 300;

next: () => {
  const now = Date.now();
  if (now - lastTrackChange < TRACK_CHANGE_DEBOUNCE_MS) return;
  lastTrackChange = now;
  
  // ... existing logic
}
```

### 8.4 Memory Management

- Always call `sound.unloadAsync()` before loading new track
- Single `Audio.Sound` instance per playback session

---

## 9. Error Handling

### 9.1 Error Types

| Error | Meaning | UI |
|-------|---------|-----|
| `store_corrupt` | JSON parse failed | Reset to defaults, show toast |
| `permission_denied` | Media access denied | Permission denied UI |
| `playback_failed` | Audio playback error | Show error toast, allow retry |
| `asset_unavailable` | Song file not found | Skip track, show toast |

### 9.2 Missing File (First Launch)

```typescript
const fileInfo = await FileSystem.getInfoAsync(STORE_FILE);
if (!fileInfo.exists) {
  // Initialize with empty defaults - not an error
  set({ isLoading: false, isLoaded: true });
  return;
}
```

### 9.3 Corrupt File

```typescript
try {
  const data = JSON.parse(content);
  // ...
} catch (error) {
  console.error('Corrupt library store:', error);
  // Reset to empty defaults, do not crash
  set({ likedSongIds: [], albums: [], isLoading: false, isLoaded: true });
}
```

---

## 10. Integration Checklist

- [ ] `useLibraryStore.loadLibrary()` called in root layout
- [ ] Library tab blocked until `isLoaded === true`
- [ ] Like toggle persists across app restarts
- [ ] Album CRUD operations save to filesystem
- [ ] System albums grouped by album/artist
- [ ] Repeat modes cycle correctly (off → all → one)
- [ ] Shuffle preserves/restores original order
- [ ] Queue actions (play now, play next, add to queue) work
- [ ] Race condition guard on rapid next/previous taps
- [ ] Memory properly released with `unloadAsync()`
