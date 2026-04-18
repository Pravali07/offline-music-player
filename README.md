# Music App

Expo Router music player for local device audio on iOS and Android. The app uses `expo-media-library` for song discovery, `expo-av` for playback, and Zustand stores for playback plus library persistence.

## Requirements

- Node.js 20+
- npm
- Expo development build

`expo-media-library` and background audio features are not supported in Expo Go for this project.

## Setup

```bash
source ~/.nvm/nvm.sh
nvm use 20
npm install
```

## Run

```bash
npx expo start
```

Useful commands:

- `npx expo lint` for ESLint
- `npx expo prebuild` after `app.json` plugin changes
- `npm run reset-project` to reset the scaffold

## Dev Build Notes

- Use an Expo development build on iOS or Android, not Expo Go.
- Background audio depends on `UIBackgroundModes: ["audio"]` in [app.json](/Users/pravallika/Documents/Personal/ai-training/music-app/app.json).
- Lock screen and notification transport controls are a known Expo AV limitation for this app.
- Android emulator note: this app reads the device media library, so the emulator needs audio files in shared storage before songs appear. Example: `adb push my-song.mp3 /sdcard/Music/`

## Implemented Phase 4 Features

- Persistent liked songs and custom albums saved to `documentDirectory/library-store.json`
- Like toggle in song rows, now playing, and the song options menu
- Dedicated [Liked Songs screen](/Users/pravallika/Documents/Personal/ai-training/music-app/app/liked-songs.tsx)
- Album create, rename, delete, add-song, and remove-song flows
- Auto-generated system album and artist collections from song metadata with fallback values
- Queue actions from the song options menu: Play Now, Play Next, Add to Queue
- Visible shuffle and repeat controls on the Now Playing modal

## Known Limitations

- Expo Go cannot be used for media library playback testing here.
- `expo-av` supports background playback, but not lock screen or notification controls.
- Song metadata depends on what `expo-media-library` exposes; extended tags are not available.

## Specs

- [Phase 4 spec](/Users/pravallika/Documents/Personal/ai-training/music-app/specs/phase-4/spec.md)
- [Phase 4 plan](/Users/pravallika/Documents/Personal/ai-training/music-app/specs/phase-4/plan.md)
- [Phase 4 tasks](/Users/pravallika/Documents/Personal/ai-training/music-app/specs/phase-4/tasks.md)
