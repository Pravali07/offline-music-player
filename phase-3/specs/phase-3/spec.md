# Phase 3: Core Playback Experience — Specification

## 1. Objective

Deliver the complete music playing experience on both platforms: browse, play, control, search.

---

## 2. Dependencies

Required packages (already installed in Phase 1):
- `expo-av` — for `Audio.Sound` and audio mode configuration
- `expo-linking` — for opening system settings (from Phase 2)

---

## 3. Song List Screen

### 3.1 Location
`app/(tabs)/index.tsx`

### 3.2 Implementation

```typescript
import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { SongListItem } from '@/components/SongListItem';
import { PermissionDeniedView } from '@/components/PermissionDeniedView';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { ThemedView } from '@/components/themed-view';
import { usePlayerStore } from '@/stores';
import {
  requestPermissions,
  getPermissionStatus,
  openPermissionSettings,
  createAppStateListener,
} from '@/services';
import { Colors } from '@/utils/colors';
import { formatDuration } from '@/utils/formatters';
import type { Song } from '@/types';

type SortOption = 'az' | 'za' | 'artist' | 'duration';

export default function SongsScreen() {
  const {
    permissionStatus,
    songs,
    isLoadingSongs,
    songError,
    setPermissionStatus,
    loadSongs,
    currentSong,
    setCurrentSong,
    setQueue,
  } = usePlayerStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('az');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredSongs = songs
    .filter(song => {
      const query = searchQuery.toLowerCase();
      return (
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        case 'artist':
          return a.artist.localeCompare(b.artist);
        case 'duration':
          return a.duration - b.duration;
        default:
          return 0;
      }
    });

  const handleSongPress = useCallback(
    (song: Song) => {
      const index = filteredSongs.findIndex(s => s.id === song.id);
      setQueue(filteredSongs, index);
      setCurrentSong(song);
    },
    [filteredSongs, setQueue, setCurrentSong]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadSongs();
    setIsRefreshing(false);
  }, [loadSongs]);

  const renderItem = useCallback(
    ({ item }: { item: Song }) => (
      <SongListItem
        song={item}
        isPlaying={currentSong?.id === item.id}
        onPress={handleSongPress}
      />
    ),
    [currentSong, handleSongPress]
  );

  const keyExtractor = useCallback((item: Song) => item.id, []);

  // ... permission and state handling (from Phase 2)

  return (
    <ThemedView style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Sort options */}
      <View style={styles.sortContainer}>
        {(['az', 'za', 'artist', 'duration'] as SortOption[]).map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.sortButton, sortOption === option && styles.sortButtonActive]}
            onPress={() => setSortOption(option)}
          >
            <ThemedText style={styles.sortButtonText}>
              {option.toUpperCase()}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredSongs}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
      />
    </ThemedView>
  );
}
```

### 3.3 States

| State | Condition | UI |
|-------|-----------|-----|
| Permission Denied | `permissionStatus === 'denied' \|\| 'blocked'` | `PermissionDeniedView` |
| Loading | `isLoadingSongs === true` | `LoadingState` |
| Error | `songError !== null` | `ErrorState` with retry |
| Empty | `songs.length === 0` | `EmptyState` |
| Content | Songs available | `FlatList` with search/sort |

### 3.4 Behavior

- Pull-to-refresh triggers `loadSongs()` and shows `RefreshControl`
- Search filters in-memory `songs` array by `title` and `artist` (case-insensitive)
- Sort options: A-Z, Z-A, by artist, by duration
- Tapping a song sets the queue to the entire `filteredSongs` array and starts at the tapped index

---

## 4. Playback Engine

### 4.1 Location
`services/audioService.ts` and `stores/usePlayerStore.ts`

### 4.2 Audio Service

```typescript
import { Audio, AVPlaybackStatus } from 'expo-av';

let sound: Audio.Sound | null = null;

export async function configureAudioMode(): Promise<void> {
  await Audio.setAudioModeAsync({
    staysActiveInBackground: true,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
  });
}

export async function loadAudio(
  uri: string,
  onStatusUpdate: (status: AVPlaybackStatus) => void
): Promise<Audio.Sound> {
  if (sound) {
    await sound.unloadAsync();
  }

  const { sound: newSound } = await Audio.Sound.createAsync(
    { uri },
    { shouldPlay: true },
    onStatusUpdate
  );

  sound = newSound;
  return sound;
}

export async function playAudio(): Promise<void> {
  if (sound) {
    await sound.playAsync();
  }
}

export async function pauseAudio(): Promise<void> {
  if (sound) {
    await sound.pauseAsync();
  }
}

export async function seekAudio(positionMs: number): Promise<void> {
  if (sound) {
    await sound.setPositionAsync(positionMs);
  }
}

export async function unloadAudio(): Promise<void> {
  if (sound) {
    await sound.unloadAsync();
    sound = null;
  }
}
```

### 4.3 Player Store

```typescript
import { create } from 'zustand';
import type { Song } from '@/types';
import {
  configureAudioMode,
  loadAudio,
  playAudio,
  pauseAudio,
  seekAudio,
  unloadAudio,
} from '@/services/audioService';
import type { AVPlaybackStatus } from 'expo-av';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  queue: Song[];
  queueIndex: number;
  isLoading: boolean;
  error: string | null;

  initializePlayer: () => Promise<void>;
  setQueue: (songs: Song[], startIndex: number) => void;
  setCurrentSong: (song: Song) => void;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  next: () => void;
  previous: () => void;
  seek: (positionMs: number) => Promise<void>;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  queue: [],
  queueIndex: 0,
  isLoading: false,
  error: null,

  initializePlayer: async () => {
    await configureAudioMode();
  },

  setQueue: (songs, startIndex) => {
    set({ queue: songs, queueIndex: startIndex });
  },

  setCurrentSong: async (song) => {
    set({ isLoading: true, error: null });
    try {
      const handleStatusUpdate = (status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
          if (status.error) {
            set({ error: status.error, isPlaying: false, isLoading: false });
          }
          return;
        }

        const { isPlaying, positionMillis, durationMillis } = status;

        set({
          isPlaying,
          position: positionMillis,
          duration: durationMillis || 0,
        });

        if (isPlaying && positionMillis >= (durationMillis || 0) - 500) {
          get().next();
        }
      };

      await loadAudio(song.uri, handleStatusUpdate);
      set({ currentSong: song, isLoading: false });
    } catch (err) {
      set({ error: 'playback_failed', isLoading: false });
    }
  },

  play: async () => {
    await playAudio();
    set({ isPlaying: true });
  },

  pause: async () => {
    await pauseAudio();
    set({ isPlaying: false });
  },

  next: () => {
    const { queue, queueIndex } = get();
    const nextIndex = queueIndex + 1;
    if (nextIndex < queue.length) {
      set({ queueIndex: nextIndex });
      get().setCurrentSong(queue[nextIndex]);
    }
  },

  previous: () => {
    const { queue, queueIndex, position } = get();
    if (position > 3000) {
      get().seek(0);
      return;
    }
    const prevIndex = queueIndex - 1;
    if (prevIndex >= 0) {
      set({ queueIndex: prevIndex });
      get().setCurrentSong(queue[prevIndex]);
    }
  },

  seek: async (positionMs) => {
    await seekAudio(positionMs);
    set({ position: positionMs });
  },
}));
```

### 4.4 Behavior

| Action | Implementation |
|--------|----------------|
| Play | Load song URI into Audio.Sound, call `playAsync()` |
| Pause | Call `pauseAsync()` |
| Next | Increment `queueIndex`, load next song |
| Previous | If position > 3s, seek to 0; else decrement index |
| Seek | Call `setPositionAsync(ms)` |
| Auto-advance | When `position >= duration - 500ms`, call `next()` |
| Track end | Same as auto-advance logic |

---

## 5. Now Playing Screen

### 5.1 Location
`app/modal.tsx`

### 5.2 Implementation

```typescript
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePlayerStore } from '@/stores';
import { Colors } from '@/utils/colors';
import { Typography, Spacing } from '@/utils/typography';
import { formatDuration } from '@/utils/formatters';

export default function NowPlayingScreen() {
  const {
    currentSong,
    isPlaying,
    position,
    duration,
    play,
    pause,
    next,
    previous,
    seek,
  } = usePlayerStore();

  const handlePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.artworkContainer}>
        {currentSong?.artwork ? (
          <Image source={{ uri: currentSong.artwork }} style={styles.artwork} />
        ) : (
          <View style={styles.artworkPlaceholder}>
            <IconSymbol name="music.note" size={80} color={Colors.textSecondary} />
          </View>
        )}
      </View>

      <View style={styles.info}>
        <ThemedText style={styles.title} numberOfLines={1}>
          {currentSong?.title || 'Not Playing'}
        </ThemedText>
        <ThemedText style={styles.artist} numberOfLines={1}>
          {currentSong?.artist || 'Unknown Artist'}
        </ThemedText>
      </View>

      <View style={styles.progress}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onSlidingComplete={seek}
          minimumTrackTintColor={Colors.primary}
          maximumTrackTintColor={Colors.border}
          thumbTintColor={Colors.primary}
        />
        <View style={styles.timeLabels}>
          <ThemedText style={styles.time}>{formatDuration(position)}</ThemedText>
          <ThemedText style={styles.time}>{formatDuration(duration)}</ThemedText>
        </View>
      </View>

      <View style={styles.controls}>
        <IconButton name="back.fill" size={32} onPress={previous} />
        <IconButton
          name={isPlaying ? 'pause.fill' : 'play.fill'}
          size={48}
          onPress={handlePlayPause}
          primary
        />
        <IconButton name="forward.fill" size={32} onPress={next} />
      </View>
    </ThemedView>
  );
}
```

### 5.3 UI Elements

| Element | Source |
|---------|--------|
| Artwork | `currentSong.artwork` or placeholder icon |
| Title | `currentSong.title` |
| Artist | `currentSong.artist` |
| Seek bar | `Slider` component with `position` / `duration` |
| Position label | `formatDuration(position)` |
| Duration label | `formatDuration(duration)` |
| Play/Pause button | Toggles `isPlaying` |
| Previous button | `seek(0)` if > 3s, else load previous song |
| Next button | Load next song in queue |

---

## 6. Mini Player

### 6.1 Location
`components/MiniPlayer.tsx`

### 6.2 Implementation

```typescript
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { usePlayerStore } from '@/stores';
import { Colors } from '@/utils/colors';
import { Typography, Spacing } from '@/utils/typography';

export function MiniPlayer() {
  const router = useRouter();
  const { currentSong, isPlaying, play, pause } = usePlayerStore();

  if (!currentSong) {
    return null;
  }

  const handlePress = () => {
    router.push('/modal');
  };

  const handlePlayPause = (e: any) => {
    e.stopPropagation();
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.safeArea}>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <View style={styles.info}>
          <IconSymbol name="music.note" size={Spacing.lg} color={Colors.primary} />
          <View style={styles.textContainer}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {currentSong.title}
            </ThemedText>
            <ThemedText style={styles.artist} numberOfLines={1}>
              {currentSong.artist}
            </ThemedText>
          </View>
        </View>
        <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
          <IconSymbol
            name={isPlaying ? 'pause.fill' : 'play.fill'}
            size={Spacing.lg}
            color={Colors.text}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
```

### 6.3 Behavior

- Rendered in `app/_layout.tsx` root layout
- Hidden when `currentSong === null`
- Tapping opens Now Playing modal
- Play/pause button visible but doesn't interfere with modal navigation
- Wrapped in `SafeAreaView` for proper safe area handling

---

## 7. Error Types

All error types from Phase 2 plus:

| Error | Meaning | UI |
|-------|---------|-----|
| `playback_failed` | Audio playback error | Show error toast, allow retry |

---

## 8. Integration Checklist

- [ ] `usePlayerStore.initializePlayer()` called in `app/_layout.tsx`
- [ ] `MiniPlayer` rendered in root layout
- [ ] Song list binds to `usePlayerStore` state
- [ ] Now Playing modal opens from Mini Player tap
- [ ] All playback controls wired to store actions
- [ ] Seek bar updates via `onPlaybackStatusUpdate`
- [ ] Search filters in-memory array, not store
- [ ] Sort options change array order locally
