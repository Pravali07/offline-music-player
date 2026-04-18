import { create } from 'zustand';
import type { Song } from '@/types';
import { fetchSongs, type PermissionStatus } from '@/services';

type RepeatMode = 'off' | 'all' | 'one';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  position: number;
  duration: number;
  queue: Song[];
  queueIndex: number;
  repeatMode: RepeatMode;
  shuffleEnabled: boolean;
  permissionStatus: PermissionStatus;
  songs: Song[];
  isLoadingSongs: boolean;
  songError: string | null;
}

interface PlayerActions {
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPosition: (position: number) => void;
  setDuration: (duration: number) => void;
  setQueue: (queue: Song[], startIndex?: number) => void;
  setQueueIndex: (index: number) => void;
  setRepeatMode: (mode: RepeatMode) => void;
  toggleShuffle: () => void;
  playNext: () => void;
  playPrevious: () => void;
  setPermissionStatus: (status: PermissionStatus) => void;
  setSongs: (songs: Song[]) => void;
  setIsLoadingSongs: (loading: boolean) => void;
  setSongError: (error: string | null) => void;
  loadSongs: () => Promise<void>;
}

type PlayerStore = PlayerState & PlayerActions;

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  position: 0,
  duration: 0,
  queue: [],
  queueIndex: -1,
  repeatMode: 'off',
  shuffleEnabled: false,
  permissionStatus: 'undetermined',
  songs: [],
  isLoadingSongs: false,
  songError: null,

  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setPosition: (position) => set({ position }),
  setDuration: (duration) => set({ duration }),
  setQueue: (queue, startIndex = 0) => set({ queue, queueIndex: startIndex }),
  setQueueIndex: (index) => set({ queueIndex: index }),
  setRepeatMode: (mode) => set({ repeatMode: mode }),
  toggleShuffle: () => set((state) => ({ shuffleEnabled: !state.shuffleEnabled })),

  setPermissionStatus: (status) => set({ permissionStatus: status }),
  setSongs: (songs) => set({ songs }),
  setIsLoadingSongs: (loading) => set({ isLoadingSongs: loading }),
  setSongError: (error) => set({ songError: error }),

  loadSongs: async () => {
    const { setIsLoadingSongs, setSongs, setSongError } = get();
    setIsLoadingSongs(true);
    setSongError(null);

    try {
      const songs = await fetchSongs();
      setSongs(songs);
    } catch (error: unknown) {
      console.error('Failed to load songs:', error);
      const errorMessage = error instanceof Error && error.message.includes('AUDIO permission')
        ? 'Media library access requires a development build'
        : 'Failed to load songs';
      setSongError(errorMessage);
    } finally {
      setIsLoadingSongs(false);
    }
  },

  playNext: () => {
    const { queue, queueIndex, repeatMode, shuffleEnabled } = get();
    if (queue.length === 0) return;

    let nextIndex: number;

    if (shuffleEnabled) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else if (queueIndex >= queue.length - 1) {
      nextIndex = repeatMode === 'all' ? 0 : queue.length - 1;
    } else {
      nextIndex = queueIndex + 1;
    }

    set({
      queueIndex: nextIndex,
      currentSong: queue[nextIndex],
      position: 0,
    });
  },

  playPrevious: () => {
    const { queue, queueIndex } = get();
    if (queue.length === 0) return;

    const prevIndex = queueIndex <= 0 ? queue.length - 1 : queueIndex - 1;
    set({
      queueIndex: prevIndex,
      currentSong: queue[prevIndex],
      position: 0,
    });
  },
}));
