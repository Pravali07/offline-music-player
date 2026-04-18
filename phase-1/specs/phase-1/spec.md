# Phase 1: Foundation & Project Setup — Specification

## 1. Objective

Establish the base structure, environment, and shared foundations that all future phases build on — for both iOS and Android.

## 2. Architecture Overview

- **UI Layer** → Screens & Components
- **Service Layer** → Business logic (player, library, permissions)
- **Data Layer** → Local storage, filesystem, metadata
- **Native Layer** → iOS & Android platform configuration via `app.json`

## 3. Folder Structure

```
music-app/
├── app/                    # Expo Router routes (file-based routing)
│   ├── (tabs)/             # Bottom tab navigator
│   │   ├── _layout.tsx     # Tab navigator config
│   │   ├── index.tsx       # Songs tab screen
│   │   └── library.tsx     # Library tab screen
│   ├── _layout.tsx         # Root layout
│   └── modal.tsx           # Now Playing modal
├── components/             # Reusable UI components
├── constants/             # Theme constants
│   └── theme.ts           # Color tokens, typography
├── hooks/                 # Custom React hooks
├── services/              # Business logic (player, library, permissions)
├── stores/                # Zustand state stores
├── types/                 # Shared TypeScript interfaces
├── utils/                 # Pure helpers (colors, typography, spacing, formatters)
│   ├── colors.ts          # Dark theme color tokens
│   ├── typography.ts      # Font size and weight scale
│   └── spacing.ts         # Spacing scale
└── docs/                  # Documentation
```

## 4. Design System

### 4.1 Colors (`utils/colors.ts`)

Dark theme only. No hardcoded hex values in components.

Tokens required:
- `background` — app background
- `surface` — cards, elevated surfaces
- `text` — primary text
- `textSecondary` — secondary/muted text
- `primary` — accent/brand color
- `border` — dividers and borders
- `error` — error states

### 4.2 Typography (`utils/typography.ts`)

Scale required:
- `xs`, `sm`, `base`, `lg`, `xl`, `2xl`, `3xl` (sizes)
- Font weights: `regular`, `medium`, `semibold`, `bold`

### 4.3 Spacing (`utils/spacing.ts`)

Scale required: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl` (in pixels or rem)

## 5. Navigation Structure

### 5.1 Root Layout (`app/_layout.tsx`)

- Wraps app in `ThemeProvider` with dark theme
- Contains `Stack` navigator
- Renders `MiniPlayer` above tab bar (visible on non-modal screens)
- Imports `react-native-reanimated` (required for expo-router)

### 5.2 Tab Navigator (`app/(tabs)/_layout.tsx`)

- Two tabs: **Songs** and **Library**
- Tab bar icons using `@expo/vector-icons`
- Header shown on each tab screen

### 5.3 Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/(tabs)/index.tsx` | Songs tab — displays song list |
| `/library` | `app/(tabs)/library.tsx` | Library tab — user's liked songs and albums |
| `/modal` | `app/modal.tsx` | Now Playing modal |

## 6. State Management (Zustand)

### 6.1 `stores/usePlayerStore.ts`

Initial empty shape (no logic yet):
```ts
interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  queue: Song[];
  queueIndex: number;
  repeatMode: 'off' | 'all' | 'one';
  shuffleEnabled: boolean;
}
```

### 6.2 `stores/useLibraryStore.ts`

Initial empty shape (no logic yet):
```ts
interface LibraryState {
  likedSongIds: string[];
  albums: Album[];
}
```

## 7. Native Platform Configuration (`app.json`)

All native config lives in `app.json`. No manual edits to `Info.plist` or `AndroidManifest.xml`.

### 7.1 Android

```json
{
  "android": {
    "plugins": [
      [
        "expo-media-library",
        {
          "permissions": ["READ_EXTERNAL_STORAGE", "READ_MEDIA_AUDIO"]
        }
      ]
    ]
  }
}
```

### 7.2 iOS

```json
{
  "ios": {
    "infoPlist": {
      "NSPhotoLibraryUsageDescription": "This app needs access to your photo library to find music files.",
      "NSAppleMusicUsageDescription": "This app needs access to your music library to play songs.",
      "UIBackgroundModes": ["audio"]
    }
  }
}
```

### 7.3 Both Platforms

```json
{
  "plugins": [
    [
      "expo-av",
      {
        "microphonePermission": false
      }
    ]
  ]
}
```

After modifying `app.json` plugins, run `npx expo prebuild` to regenerate native folders.

## 8. Dependencies

Required packages (already in `package.json` or to be added):
- `expo` ~54.0.33
- `expo-router` ~6.0.23
- `expo-av` ~54.0.x (for audio playback)
- `expo-media-library` (for media access)
- `expo-file-system` (for persistence)
- `@react-navigation/native` ^7.x
- `@react-navigation/bottom-tabs` ^7.x
- `react-native-screens` ~4.16.0
- `react-native-safe-area-context` ~5.6.0
- `zustand` (state management)

## 9. Acceptance Criteria

- [ ] Folder structure created with all required directories
- [ ] `@/*` path alias configured in `tsconfig.json`
- [ ] `utils/colors.ts` contains dark theme color tokens (no hardcoded hex in components)
- [ ] `utils/typography.ts` contains font scale
- [ ] `utils/spacing.ts` contains spacing scale
- [ ] Bottom tab navigator with Songs and Library tabs working
- [ ] Now Playing modal opens from anywhere
- [ ] `usePlayerStore` and `useLibraryStore` exist with correct initial shape
- [ ] `app.json` contains all required plugins for media library and audio
- [ ] `npx expo prebuild` succeeds after plugin changes
- [ ] Dark theme applied throughout the app
- [ ] No TypeScript errors (`npx expo lint` passes)
- [ ] All components use design tokens (no hardcoded values)

## 10. Out of Scope

- Actual song loading and playback (Phase 3)
- Media permission requests (Phase 2)
- Persistence implementation (Phase 4)
- Liked songs and albums functionality (Phase 4)
- Search and sort (Phase 3)
