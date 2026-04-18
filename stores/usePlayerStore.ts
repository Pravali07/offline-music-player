import { create } from 'zustand';
import type { Song } from '@/types';
import type { PermissionStatus } from '@/services';
import { fetchSongs } from '@/services/musicService';
import {
  configureAudioMode,
  loadAudio,
  playAudio,
  pauseAudio,
  seekAudio,
  unloadAudio,
} from '@/services/audioService';
import type { AVPlaybackStatus } from 'expo-av';

type RepeatMode = 'off' | 'all' | 'one';

const TRACK_CHANGE_DEBOUNCE_MS = 300;

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  isLoading: boolean;
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
  playbackError: string | null;
}

interface PlayerActions {
  initializePlayer: () => Promise<void>;
  setQueue: (songs: Song[], startIndex?: number) => void;
  setCurrentSong: (song: Song) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  next: () => void;
  previous: () => void;
  seek: (positionMs: number) => Promise<void>;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  playNext: (songId: string) => void;
  addToQueue: (songId: string) => void;
  setPermissionStatus: (status: PermissionStatus) => void;
  loadSongs: () => Promise<void>;
}

type PlayerStore = PlayerState & PlayerActions;

let originalQueue: Song[] = [];
let lastTrackChange = 0;

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  currentSong: null,
  isPlaying: false,
  isLoading: false,
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
  playbackError: null,

  initializePlayer: async () => {
    try {
      await configureAudioMode();
    } catch (error) {
      console.error('Failed to configure audio mode:', error);
    }
  },

  setQueue: (songs, startIndex = 0) => {
    const { shuffleEnabled } = get();
    originalQueue = songs;
    const selectedSong = songs[startIndex];

    if (shuffleEnabled && selectedSong) {
      const shuffled = shuffleSongs(songs, selectedSong.id);
      const queueIndex = shuffled.findIndex((song) => song.id === selectedSong.id);
      set({ queue: shuffled, queueIndex });
      return;
    }

    set({ queue: songs, queueIndex: startIndex });
  },

  setCurrentSong: async (song) => {
    const now = Date.now();
    if (now - lastTrackChange < TRACK_CHANGE_DEBOUNCE_MS) return;
    lastTrackChange = now;

    set({ playbackError: null, isLoading: true });
    try {
      await unloadAudio();

      const handleStatusUpdate = (status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
          if (status.error) {
            set({ playbackError: 'playback_failed', isPlaying: false, isLoading: false });
          }
          return;
        }

        const { isPlaying, positionMillis, durationMillis } = status;

        set({
          isPlaying,
          position: positionMillis,
          duration: durationMillis || 0,
        });

        if (isPlaying && durationMillis && positionMillis >= durationMillis - 500) {
          get().next();
        }
      };

      await loadAudio(song.uri, handleStatusUpdate);
      set({ currentSong: song, isLoading: false });
    } catch (error) {
      console.error('Failed to play song:', error);
      set({ playbackError: 'playback_failed', isLoading: false });
    }
  },

  play: async () => {
    try {
      await playAudio();
      set({ isPlaying: true });
    } catch (error) {
      console.error('Failed to play:', error);
      set({ playbackError: 'playback_failed' });
    }
  },

  pause: async () => {
    try {
      await pauseAudio();
      set({ isPlaying: false });
    } catch (error) {
      console.error('Failed to pause:', error);
    }
  },

  next: () => {
    const now = Date.now();
    if (now - lastTrackChange < TRACK_CHANGE_DEBOUNCE_MS) return;
    lastTrackChange = now;

    const { queue, queueIndex, repeatMode } = get();
    if (queue.length === 0) return;

    if (repeatMode === 'one') {
      const currentSong = queue[queueIndex];
      if (currentSong) {
        get().setCurrentSong(currentSong);
      }
      return;
    }

    let nextIndex = queueIndex + 1;

    if (nextIndex >= queue.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        return;
      }
    }

    set({ queueIndex: nextIndex });
    get().setCurrentSong(queue[nextIndex]);
  },

  previous: () => {
    const now = Date.now();
    if (now - lastTrackChange < TRACK_CHANGE_DEBOUNCE_MS) return;
    lastTrackChange = now;

    const { queue, queueIndex, position } = get();
    if (queue.length === 0) return;

    if (position > 3000) {
      get().seek(0);
      return;
    }

    let prevIndex = queueIndex - 1;
    if (prevIndex < 0) {
      prevIndex = queue.length - 1;
    }

    set({ queueIndex: prevIndex });
    get().setCurrentSong(queue[prevIndex]);
  },

  seek: async (positionMs) => {
    try {
      await seekAudio(positionMs);
      set({ position: positionMs });
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  },

  toggleRepeat: () => {
    const { repeatMode } = get();
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    set({ repeatMode: nextMode });
  },

  toggleShuffle: () => {
    const { shuffleEnabled, queue, currentSong } = get();
    const newShuffleEnabled = !shuffleEnabled;

    if (queue.length === 0) {
      set({ shuffleEnabled: newShuffleEnabled });
      return;
    }

    if (newShuffleEnabled) {
      originalQueue = queue;
      const shuffled = shuffleSongs(queue, currentSong?.id);
      const queueIndex = currentSong
        ? shuffled.findIndex((song) => song.id === currentSong.id)
        : 0;
      set({ shuffleEnabled: true, queue: shuffled, queueIndex });
      return;
    }

    const restoredQueue = originalQueue.length > 0 ? originalQueue : queue;
    const queueIndex = currentSong
      ? restoredQueue.findIndex((song) => song.id === currentSong.id)
      : 0;
    set({
      shuffleEnabled: false,
      queue: restoredQueue,
      queueIndex: queueIndex >= 0 ? queueIndex : 0,
    });
  },

  playNext: (songId) => {
    const { queue, queueIndex, songs, currentSong } = get();
    const song = songs.find((item) => item.id === songId) ?? queue.find((item) => item.id === songId);
    if (!song) return;

    const newQueue = queue.length > 0 ? [...queue] : currentSong ? [currentSong] : [];
    const existingIndex = newQueue.findIndex(s => s.id === songId);
    if (existingIndex !== -1) {
      newQueue.splice(existingIndex, 1);
    }

    const insertionIndex = queueIndex >= 0 ? queueIndex + 1 : newQueue.length;
    newQueue.splice(insertionIndex, 0, song);
    set({ queue: newQueue, queueIndex: queueIndex >= 0 ? queueIndex : 0 });
  },

  addToQueue: (songId) => {
    const { queue, songs } = get();
    let song = queue.find(s => s.id === songId);
    
    if (!song) {
      song = songs.find(s => s.id === songId);
    }
    
    if (!song) return;

    if (!queue.find(s => s.id === songId)) {
      set({ queue: [...queue, song] });
    }
  },

  setPermissionStatus: (status) => set({ permissionStatus: status }),

  loadSongs: async () => {
    set({ isLoadingSongs: true, songError: null });

    try {
      const songs = await fetchSongs();
      set({ songs, isLoadingSongs: false });
    } catch (error: unknown) {
      console.error('Failed to load songs:', error);
      const errorMessage = error instanceof Error && error.message.includes('AUDIO permission')
        ? 'Media library access requires a development build'
        : 'Failed to load songs';
      set({ songError: errorMessage, isLoadingSongs: false });
    }
  },
}));

function shuffleSongs(songs: Song[], pinnedSongId?: string): Song[] {
  const nextQueue = [...songs];

  for (let index = nextQueue.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [nextQueue[index], nextQueue[randomIndex]] = [nextQueue[randomIndex], nextQueue[index]];
  }

  if (!pinnedSongId) {
    return nextQueue;
  }

  const pinnedIndex = nextQueue.findIndex((song) => song.id === pinnedSongId);
  if (pinnedIndex <= 0) {
    return nextQueue;
  }

  const [pinnedSong] = nextQueue.splice(pinnedIndex, 1);
  nextQueue.unshift(pinnedSong);
  return nextQueue;
}
