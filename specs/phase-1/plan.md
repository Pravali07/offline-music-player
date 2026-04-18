# Phase 1 Plan: Foundation & Project Setup

## Goals
Establish the base structure, environment, and shared foundations for the music app.

## Deliverables

1. **Folder Structure** — Ensure `components/`, `services/`, `hooks/` directories exist
2. **Path Alias** — Configure `@/*` alias in both `babel.config.js` and `tsconfig.json`
3. **Design System** — Create `utils/colors.ts`, `utils/typography.ts`, `utils/spacing.ts`
4. **Navigation** — Set up expo-router with bottom tabs (Songs, Library) and Now Playing modal
5. **State Stores** — Create `usePlayerStore` and `useLibraryStore` with initial shapes
6. **App Config** — Update `app.json` with required plugins for media library and audio

## Verification
- [ ] `npx expo lint` passes
- [ ] All components use design tokens (no hardcoded hex values)
- [ ] Dark theme applied throughout
