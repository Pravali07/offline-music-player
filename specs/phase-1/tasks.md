# Phase 1 Tasks

## Setup
- [x] Verify `components/` directory exists
- [x] Verify `services/` directory exists
- [x] Verify `hooks/` directory exists
- [x] Configure `@/*` path alias in `babel.config.js`

## Design System
- [x] Create/verify `utils/colors.ts` with dark theme tokens
- [x] Create/verify `utils/typography.ts` with font scale
- [x] Create/verify `utils/spacing.ts` with spacing scale

## State Management
- [x] Create `stores/usePlayerStore.ts` with initial PlayerState shape
- [x] Create `stores/useLibraryStore.ts` with initial LibraryState shape

## Navigation
- [x] Set up root layout in `app/_layout.tsx`
- [x] Set up tab navigator in `app/(tabs)/_layout.tsx`
- [x] Create Songs tab at `app/(tabs)/index.tsx`
- [x] Create Library tab at `app/(tabs)/library.tsx`
- [x] Create Now Playing modal at `app/modal.tsx`

## App Configuration
- [x] Update `app.json` with Android media library plugin config
- [x] Update `app.json` with iOS permissions and background audio
- [x] Update `app.json` with expo-av plugin config

## Verification
- [ ] Run `npx expo lint` to verify no TypeScript errors
- [ ] Verify all components use design tokens from `utils/`
