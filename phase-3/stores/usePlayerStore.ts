import { Audio, type AVPlaybackStatus } from 'expo-av';
import { create } from 'zustand';

import type { PermissionStatus } from '@/services';
import { fetchSongs } from '@/services/musicService';
import type { Song } from '@/types';

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

let sound: Audio.Sound | null = null;
let originalQueue: Song[] = [];
let lastTrackChange = 0;

async function unloadCurrentSound(): Promise<void> {
  if (sound) {
    await sound.unloadAsync();
    sound = null;
  }
}

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
      await Audio.setAudioModeAsync({
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Failed to configure audio mode:', error);
    }
  },

  setQueue: (songs, startIndex = 0) => {
    originalQueue = songs;
    set({ queue: songs, queueIndex: startIndex });
  },

  setCurrentSong: async (song) => {
    const now = Date.now();
    if (now - lastTrackChange < TRACK_CHANGE_DEBOUNCE_MS) return;
    lastTrackChange = now;

    set({ playbackError: null, isLoading: true });

    try {
      await unloadCurrentSound();

      const { sound: nextSound } = await Audio.Sound.createAsync(
        { uri: song.uri },
        { shouldPlay: true }
      );

      nextSound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
        if (!status.isLoaded) {
          if (status.error) {
            set({ playbackError: 'playback_failed', isPlaying: false, isLoading: false });
          }
          return;
        }

        set({
          isPlaying: status.isPlaying,
          position: status.positionMillis,
          duration: status.durationMillis || 0,
        });

        if (
          status.isPlaying &&
          status.durationMillis &&
          status.positionMillis >= status.durationMillis - 500
        ) {
          get().next();
        }
      });

      sound = nextSound;
      set({ currentSong: song, isLoading: false });
    } catch (error) {
      console.error('Failed to play song:', error);
      set({ playbackError: 'playback_failed', isLoading: false });
    }
  },

  play: async () => {
    try {
      if (sound) {
        await sound.playAsync();
        set({ isPlaying: true });
      }
    } catch (error) {
      console.error('Failed to play:', error);
      set({ playbackError: 'playback_failed' });
    }
  },

  pause: async () => {
    try {
      if (sound) {
        await sound.pauseAsync();
        set({ isPlaying: false });
      }
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
      const currentTrack = queue[queueIndex];
      if (currentTrack) {
        get().setCurrentSong(currentTrack);
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
    void get().setCurrentSong(queue[nextIndex]);
  },

  previous: () => {
    const now = Date.now();
    if (now - lastTrackChange < TRACK_CHANGE_DEBOUNCE_MS) return;
    lastTrackChange = now;

    const { queue, queueIndex, position } = get();
    if (queue.length === 0) return;

    if (position > 3000) {
      void get().seek(0);
      return;
    }

    const prevIndex = queueIndex <= 0 ? queue.length - 1 : queueIndex - 1;
    set({ queueIndex: prevIndex });
    void get().setCurrentSong(queue[prevIndex]);
  },

  seek: async (positionMs) => {
    try {
      if (sound) {
        await sound.setPositionAsync(positionMs);
        set({ position: positionMs });
      }
    } catch (error) {
      console.error('Failed to seek:', error);
    }
  },

  toggleRepeat: () => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(get().repeatMode);
    set({ repeatMode: modes[(currentIndex + 1) % modes.length] });
  },

  toggleShuffle: () => {
    const { shuffleEnabled, queue } = get();
    const nextEnabled = !shuffleEnabled;

    if (nextEnabled) {
      originalQueue = queue;
      const shuffled = [...queue];
      for (let index = shuffled.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
      }
      set({ shuffleEnabled: true, queue: shuffled });
      return;
    }

    set({ shuffleEnabled: false, queue: originalQueue });
  },

  playNext: (songId) => {
    const { queue, queueIndex } = get();
    const song = queue.find((item) => item.id === songId);
    if (!song) return;

    const nextQueue = [...queue];
    const existingIndex = nextQueue.findIndex((item) => item.id === songId);
    if (existingIndex !== -1) {
      nextQueue.splice(existingIndex, 1);
    }
    nextQueue.splice(queueIndex + 1, 0, song);
    set({ queue: nextQueue });
  },

  addToQueue: (songId) => {
    const { queue, songs } = get();
    const song = queue.find((item) => item.id === songId) ?? songs.find((item) => item.id === songId);
    if (!song || queue.some((item) => item.id === songId)) return;
    set({ queue: [...queue, song] });
  },

  setPermissionStatus: (status) => set({ permissionStatus: status }),

  loadSongs: async () => {
    set({ isLoadingSongs: true, songError: null });

    try {
      const songs = await fetchSongs();
      set({ songs, isLoadingSongs: false });
    } catch (error: unknown) {
      console.error('Failed to load songs:', error);
      const errorMessage =
        error instanceof Error && error.message.includes('AUDIO permission')
          ? 'Media library access requires a development build'
          : 'Failed to load songs';
      set({ songError: errorMessage, isLoadingSongs: false });
    }
  },
}));
