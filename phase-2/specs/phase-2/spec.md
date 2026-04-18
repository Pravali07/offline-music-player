# Phase 2: Device Access & Music Discovery — Specification

## 1. Objective

Request media permissions and build the music dataset using `expo-media-library` consistently on both platforms.

## 2. Dependencies

Required packages (already installed in Phase 1):
- `expo-media-library` — for permission requests and audio asset discovery
- `expo-linking` — for opening system settings

## 3. Error Types

All error types defined in Global Decisions:
- `permission_denied` — user denied media library access
- `asset_unavailable` — audio file not found or inaccessible
- `playback_failed` — audio playback error
- `store_corrupt` — persisted data is corrupted
- `unknown` — any other error

## 4. Permission Service

### 4.1 Location
`services/permissionService.ts`

### 4.2 Implementation

```typescript
import * as MediaLibrary from 'expo-media-library';
import * as Linking from 'expo-linking';
import { AppState, AppStateStatus } from 'react-native';

type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'undetermined';

interface PermissionState {
  status: PermissionStatus;
  canAskAgain: boolean;
}

export async function requestPermissions(): Promise<PermissionState> {
  const { status, canAskAgain } = await MediaLibrary.requestPermissionsAsync();
  return mapPermissionStatus(status, canAskAgain);
}

export async function getPermissionStatus(): Promise<PermissionState> {
  const { status, canAskAgain } = await MediaLibrary.getPermissionsAsync();
  return mapPermissionStatus(status, canAskAgain);
}

export function openSettings(): void {
  Linking.openSettings();
}

export function createAppStateListener(callback: (status: PermissionStatus) => void): () => void {
  const listener = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      getPermissionStatus().then(({ status }) => callback(status));
    }
  };
  return AppState.addEventListener('change', listener);
}

function mapPermissionStatus(
  status: MediaLibrary.PermissionStatus,
  canAskAgain: boolean
): PermissionState {
  switch (status) {
    case 'granted':
      return { status: 'granted', canAskAgain: true };
    case 'denied':
      return { status: 'denied', canAskAgain };
    case 'blocked':
      return { status: 'blocked', canAskAgain: false };
    default:
      return { status: 'undetermined', canAskAgain: true };
  }
}
```

### 4.3 Behavior

| Status | Meaning | Action |
|--------|---------|--------|
| `granted` | Access allowed | Proceed to fetch songs |
| `denied` | User denied, can ask again | Show "Grant Access" button |
| `blocked` | Permanently denied | Show "Open Settings" button |
| `undetermined` | Not asked yet | Auto-request on app load |

## 5. Music Discovery Service

### 5.1 Location
`services/musicService.ts`

### 5.2 Implementation

```typescript
import * as MediaLibrary from 'expo-media-library';
import type { Song } from '@/types';

const MIN_DURATION_MS = 30_000; // 30 seconds minimum
const PAGE_SIZE = 100;

export async function fetchSongs(): Promise<Song[]> {
  const songs: Song[] = [];
  let hasNextPage = true;
  let after: string | null = null;

  while (hasNextPage) {
    const { assets, endCursor, hasNextPage: hasMore } =
      await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: PAGE_SIZE,
        after: after ?? undefined,
      });

    const assetInfos = await Promise.all(
      assets.map((asset) => MediaLibrary.getAssetInfoAsync(asset.id))
    );

    for (const asset of assetInfos) {
      if (asset.duration < MIN_DURATION_MS) continue;

      const song: Song = {
        id: asset.id,
        title: asset.filename?.replace(/\.[^.]+$/, '') ?? 'Unknown Title',
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        duration: asset.duration,
        uri: asset.uri,
        artwork: asset.uri,
      };

      songs.push(song);
    }

    hasNextPage = hasMore;
    after = endCursor;
  }

  return deduplicateSongs(songs);
}

function deduplicateSongs(songs: Song[]): Song[] {
  const seen = new Set<string>();
  return songs.filter((song) => {
    if (seen.has(song.uri)) return false;
    seen.add(song.uri);
    return true;
  });
}
```

### 5.3 Behavior

- Paginate through all audio assets using cursor-based pagination
- Fetch `localUri` for each asset via `getAssetInfoAsync()`
- Filter out assets under 30 seconds (voice memos, ringtones, notifications)
- Use filename (without extension) as fallback title
- Default artist/album to "Unknown Artist"/"Unknown Album"
- Deduplicate by `localUri`

## 6. Update `usePlayerStore`

### 6.1 Add Permission State

```typescript
// Add to usePlayerStore.ts
interface PlayerState {
  // ... existing fields
  permissionStatus: PermissionStatus;
  songs: Song[];
  isLoadingSongs: boolean;
  songError: string | null;
}

// Add actions
setPermissionStatus: (status: PermissionStatus) => void;
setSongs: (songs: Song[]) => void;
setIsLoadingSongs: (loading: boolean) => void;
setSongError: (error: string | null) => void;
fetchSongs: () => Promise<void>;
```

## 7. Permission Denied UI

### 7.1 Location
`components/PermissionDeniedView.tsx`

### 7.2 Design

```
┌─────────────────────────────┐
│                             │
│         [Music Icon]        │
│                             │
│     Music Access Required    │
│                             │
│  This app needs access to   │
│  your music library to show  │
│  and play your songs.       │
│                             │
│   [ Grant Access Button ]   │
│                             │
│   [ Open Settings Button ]  │
│                             │
└─────────────────────────────┘
```

### 7.3 Props

```typescript
interface PermissionDeniedViewProps {
  onRequestPermission: () => void;
  onOpenSettings: () => void;
  isBlocked: boolean;
}
```

## 8. Update Songs Tab Screen

### 8.1 Location
`app/(tabs)/index.tsx`

### 8.2 States to Handle

| State | UI |
|-------|-----|
| Loading | Full-screen loading indicator |
| Permission Denied | `PermissionDeniedView` component |
| Error | Error message with retry button |
| Empty | "No songs found" message |
| Songs | `FlatList` of songs |

### 8.3 Components Required

```typescript
// New components to create
components/
├── PermissionDeniedView.tsx   // Permission denied UI
├── SongListItem.tsx           // Individual song row
├── EmptyState.tsx             // Reusable empty state
├── LoadingState.tsx           // Reusable loading state
└── ErrorState.tsx             // Reusable error state
```

## 9. SongListItem Component

### 9.1 Props

```typescript
interface SongListItemProps {
  song: Song;
  isPlaying: boolean;
  onPress: (song: Song) => void;
  onLongPress?: (song: Song) => void;
}
```

### 9.2 Layout

```
┌────────────────────────────────────────┐
│ [Album Art]  Title                     │
│              Artist • Duration    [>]  │
└────────────────────────────────────────┘
```

## 10. Files to Create

| File | Purpose |
|------|---------|
| `services/permissionService.ts` | Permission request logic |
| `services/musicService.ts` | Music discovery logic |
| `components/PermissionDeniedView.tsx` | Permission denied UI |
| `components/SongListItem.tsx` | Song row component |
| `components/EmptyState.tsx` | Reusable empty state |
| `components/LoadingState.tsx` | Reusable loading state |
| `components/ErrorState.tsx` | Reusable error state |

## 11. Files to Modify

| File | Change |
|------|--------|
| `stores/usePlayerStore.ts` | Add permission state, songs list, loading/error states |
| `app/(tabs)/index.tsx` | Implement permission handling, song list display |

## 12. Acceptance Criteria

- [ ] Permission service handles all 4 permission states correctly
- [ ] AppState listener re-checks permissions when app returns to foreground
- [ ] "blocked" status opens system settings via `Linking.openSettings()`
- [ ] Music discovery fetches all audio assets with pagination
- [ ] Assets under 30 seconds are filtered out
- [ ] Missing metadata falls back to defaults
- [ ] Songs are deduplicated by URI
- [ ] Permission denied UI shows appropriate CTA based on status
- [ ] Songs tab displays loading state while fetching
- [ ] Songs tab shows permission denied view when access blocked
- [ ] Songs tab shows error state on failure
- [ ] Songs tab shows empty state when no songs found
- [ ] Songs displayed in `FlatList` with `keyExtractor`
- [ ] `npx expo lint` passes
- [ ] No hardcoded colors/values in new components

## 13. Out of Scope

- Actual audio playback (Phase 3)
- Search and sort (Phase 3)
- Like/album functionality (Phase 4)
- Persistence (Phase 4)
