# Phase 4: Personalization & Advanced Features — Tasks

## All Tasks Completed ✅

### 1. Fix Deprecated expo-file-system API
- **Status:** ✅ Completed
- **Issue:** Using deprecated `getInfoAsync`, `readAsStringAsync`, `writeAsStringAsync`
- **Fix:** Updated to use `expo-file-system/legacy` API
- **File:** `stores/useLibraryStore.ts`

### 2. Add Song Options Modal
- **Status:** ✅ Completed
- **Component:** `components/SongOptionsModal.tsx`
- **Features:**
  - Play Now
  - Play Next
  - Add to Queue
  - Add to Album (with album picker)
  - Create new album inline

### 3. Integrate Modal into Songs Screen
- **Status:** ✅ Completed
- **File:** `app/(tabs)/index.tsx`
- **Changes:**
  - Added `selectedSong` state
  - Added `handleSongLongPress` callback
  - Added `SongOptionsModal` component

### 4. Integrate Modal into Library Screen
- **Status:** ✅ Completed
- **File:** `app/(tabs)/library.tsx`
- **Changes:**
  - Added `selectedSong` state
  - Added handler callbacks
  - Added `SongOptionsModal` for liked songs

### 5. Fix UI Issue
- **Status:** ✅ Completed
- **Issue:** `Colors.card` does not exist
- **Fix:** Changed to `Colors.surface` in `app/(tabs)/library.tsx`

### 6. Fix Icon Name
- **Status:** ✅ Completed
- **File:** `app/modal.tsx`
- **Issue:** `"back.fill"` not valid SF Symbol
- **Fix:** Changed to `"chevron.left"`

### 7. Update Music Service Metadata Extraction
- **Status:** ✅ Completed
- **File:** `services/musicService.ts`
- **Fix:** Properly extract artist/album from MediaLibrary.Asset metadata

## Verification Checklist
- [x] `useLibraryStore.loadLibrary()` called in root layout
- [x] Library tab blocked until `isLoaded === true`
- [x] Like toggle persists across app restarts
- [x] Album CRUD operations save to filesystem
- [x] System albums grouped by album/artist
- [x] Repeat modes cycle correctly (off → all → one)
- [x] Shuffle preserves/restores original order
- [x] Queue actions (play now, play next, add to queue) work
- [x] Race condition guard on rapid next/previous taps
- [x] Memory properly released with `unloadAsync()`
- [x] Song options modal with "Add to Album" feature
