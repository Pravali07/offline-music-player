# Music App

Music App is an Expo Router based local music player for iOS and Android. It discovers songs from the device media library, plays them with Expo AV, and adds library features like likes, albums, queue actions, and playback modes using Zustand.

## What We Built

This project implements a dark-theme local music player with:

- device song discovery through `expo-media-library`
- playback with `expo-av`
- song browsing with search and sorting
- a modal Now Playing experience
- a persistent library for liked songs and custom albums
- queue controls, repeat, and shuffle

The app is designed for Expo development builds on iOS and Android. It is not intended to run these media-library features in Expo Go.

## SDD Workflow

This repository was organized using an SDD flow:

1. `Spec`
2. `Clarify`
3. `Plan`
4. `Tasks`
5. `Implement`

All specs live under [specs](/Users/pravallika/Documents/Personal/ai-training/music-app/specs) by phase. Each phase has its own `spec.md`, and where available, `plan.md` and `tasks.md`.

Phase spec folders:

- [specs/phase-1](/Users/pravallika/Documents/Personal/ai-training/music-app/specs/phase-1)
- [specs/phase-2](/Users/pravallika/Documents/Personal/ai-training/music-app/specs/phase-2)
- [specs/phase-3](/Users/pravallika/Documents/Personal/ai-training/music-app/specs/phase-3)
- [specs/phase-4](/Users/pravallika/Documents/Personal/ai-training/music-app/specs/phase-4)

The implementation planning reference used across the project is [docs/implementation-plans.md](/Users/pravallika/Documents/Personal/ai-training/music-app/docs/implementation-plans.md).

## Phase Breakdown

### Phase 1

Foundation and scaffolding:

- Expo Router app structure
- tabs and modal shell
- design tokens
- shared types
- initial Zustand store shape
- native config baseline

Reference snapshot:
- [phase-1](/Users/pravallika/Documents/Personal/ai-training/music-app/phase-1)

### Phase 2

Permissions and music discovery:

- media permission handling
- permission denied UI
- app foreground permission refresh
- paginated audio discovery from `expo-media-library`
- song normalization and deduplication

Reference snapshot:
- [phase-2](/Users/pravallika/Documents/Personal/ai-training/music-app/phase-2)

### Phase 3

Core playback experience:

- song list screen with loading/empty/error/permission states
- search and sort
- player queue setup from filtered songs
- `expo-av` playback engine
- modal Now Playing screen
- mini player in root layout

Reference snapshot:
- [phase-3](/Users/pravallika/Documents/Personal/ai-training/music-app/phase-3)

### Phase 4

Persistence and advanced features:

- persistent liked songs
- library tab
- custom albums
- system album and artist groupings
- queue actions
- repeat and shuffle controls
- README and phase deliverable docs

Reference snapshot:
- [phase-4](/Users/pravallika/Documents/Personal/ai-training/music-app/phase-4)

## Tech Stack

- Expo SDK 54
- Expo Router
- TypeScript
- Zustand
- `expo-media-library`
- `expo-av`
- `expo-file-system`

## Requirements

- Node.js 20+
- npm
- Android emulator, Android device, iOS simulator, or iPhone
- Expo development build

`expo-media-library` and background audio features are not supported in Expo Go for this project.

## Setup

```bash
source ~/.nvm/nvm.sh
nvm use 20
npm install
```

## How To Run The App

### 1. Install dependencies

```bash
source ~/.nvm/nvm.sh
nvm use 20
npm install
```

### 2. Create or refresh the native development build

For Android:

```bash
npx expo run:android
```

For iOS:

```bash
npx expo run:ios
```

### 3. Start Metro in development build mode

```bash
npx expo start --dev-client
```

### 4. Open the app

- press `a` for Android
- press `i` for iOS
- or open the installed development build manually

Use the installed development build, not Expo Go.

## Android Emulator Notes

The app reads music from the device media library. It does not import files into app storage directly.

To add songs to the Android emulator:

```bash
adb push my-song.mp3 /sdcard/Music/
adb reverse tcp:8081 tcp:8081
```

Then:

- reopen the development build
- go to `Songs`
- pull to refresh

The app filters out audio shorter than 30 seconds, so very short files like clips or test tones will not appear.

## Useful Commands

- `npx expo start --dev-client`
- `npx expo run:android`
- `npx expo run:ios`
- `npx expo lint`
- `npx expo prebuild`
- `npm run reset-project`

## Current App Features

- song discovery from the device library
- playback queue with next/previous/seek
- modal Now Playing screen
- mini player
- search by title and artist
- sort by A-Z, Z-A, artist, and duration
- liked songs persistence
- custom albums
- system album and artist collections
- repeat and shuffle
- queue actions from the song options menu

## Known Limitations

- Expo Go cannot be used for media-library playback testing here.
- `expo-av` supports background playback, but not lock screen or notification controls.
- song metadata depends on what `expo-media-library` exposes
- emulator/device media indexing can require a refresh or app reopen after adding files

## Important Project Files

- [docs/implementation-plans.md](/Users/pravallika/Documents/Personal/ai-training/music-app/docs/implementation-plans.md)
- [app.json](/Users/pravallika/Documents/Personal/ai-training/music-app/app.json)
- [stores/usePlayerStore.ts](/Users/pravallika/Documents/Personal/ai-training/music-app/stores/usePlayerStore.ts)
- [stores/useLibraryStore.ts](/Users/pravallika/Documents/Personal/ai-training/music-app/stores/useLibraryStore.ts)
- [app/(tabs)/index.tsx](/Users/pravallika/Documents/Personal/ai-training/music-app/app/(tabs)/index.tsx)
- [app/modal.tsx](/Users/pravallika/Documents/Personal/ai-training/music-app/app/modal.tsx)

## Specs

- [specs/phase-1/spec.md](/Users/pravallika/Documents/Personal/ai-training/music-app/specs/phase-1/spec.md)
- [specs/phase-2/spec.md](/Users/pravallika/Documents/Personal/ai-training/music-app/specs/phase-2/spec.md)
- [specs/phase-3/spec.md](/Users/pravallika/Documents/Personal/ai-training/music-app/specs/phase-3/spec.md)
- [specs/phase-4/spec.md](/Users/pravallika/Documents/Personal/ai-training/music-app/specs/phase-4/spec.md)
