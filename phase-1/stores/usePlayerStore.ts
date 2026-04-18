import { create } from 'zustand';
import type { Song } from '@/types';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  queue: Song[];
  queueIndex: number;
}

interface PlayerActions {
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setQueue: (queue: Song[], startIndex?: number) => void;
}

type PlayerStore = PlayerState & PlayerActions;

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentSong: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  queue: [],
  queueIndex: -1,

  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setQueue: (queue, startIndex = 0) => set({ queue, queueIndex: startIndex }),
}));
