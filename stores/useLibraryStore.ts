import { create } from 'zustand';
import { documentDirectory, readAsStringAsync, writeAsStringAsync, getInfoAsync } from 'expo-file-system/legacy';
import type { Album } from '@/types';

const STORE_FILE = documentDirectory + 'library-store.json';
const STORE_VERSION = 1;

interface LibraryState {
  likedSongIds: string[];
  albums: Album[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  loadLibrary: () => Promise<void>;
  saveLibrary: () => Promise<void>;
  toggleLike: (songId: string) => void;
  isLiked: (songId: string) => boolean;
  createAlbum: (name: string) => string | null;
  renameAlbum: (albumId: string, name: string) => void;
  deleteAlbum: (albumId: string) => void;
  addSongToAlbum: (albumId: string, songId: string) => void;
  removeSongFromAlbum: (albumId: string, songId: string) => void;
}

type LibraryStore = LibraryState;

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  likedSongIds: [],
  albums: [],
  isLoading: true,
  isLoaded: false,
  error: null,

  loadLibrary: async () => {
    try {
      const fileInfo = await getInfoAsync(STORE_FILE);
      
      if (!fileInfo.exists) {
        set({ isLoading: false, isLoaded: true });
        return;
      }

      const content = await readAsStringAsync(STORE_FILE);
      const data = JSON.parse(content);

      set({
        likedSongIds: data.likedSongIds || [],
        albums: data.albums || [],
        isLoading: false,
        isLoaded: true,
      });
    } catch (error) {
      console.error('Failed to load library:', error);
      set({ isLoading: false, isLoaded: true, error: 'store_corrupt' });
    }
  },

  saveLibrary: async () => {
    try {
      const { likedSongIds, albums } = get();
      const data = {
        likedSongIds,
        albums,
        version: STORE_VERSION,
      };
      await writeAsStringAsync(STORE_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save library:', error);
    }
  },

  toggleLike: (songId) => {
    const { likedSongIds, saveLibrary } = get();
    const isLiked = likedSongIds.includes(songId);
    
    const newLikedSongIds = isLiked
      ? likedSongIds.filter(id => id !== songId)
      : [...likedSongIds, songId];
    
    set({ likedSongIds: newLikedSongIds });
    saveLibrary();
  },

  isLiked: (songId) => {
    return get().likedSongIds.includes(songId);
  },

  createAlbum: (name) => {
    const { albums, saveLibrary } = get();
    const trimmedName = name.trim();
    if (!trimmedName) {
      return null;
    }

    const newAlbum: Album = {
      id: generateUUID(),
      name: trimmedName,
      songIds: [],
      createdAt: new Date().toISOString(),
    };
    set({ albums: [...albums, newAlbum] });
    saveLibrary();
    return newAlbum.id;
  },

  renameAlbum: (albumId, name) => {
    const { albums, saveLibrary } = get();
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }

    set({
      albums: albums.map(album =>
        album.id === albumId ? { ...album, name: trimmedName } : album
      ),
    });
    saveLibrary();
  },

  deleteAlbum: (albumId) => {
    const { albums, saveLibrary } = get();
    set({ albums: albums.filter(album => album.id !== albumId) });
    saveLibrary();
  },

  addSongToAlbum: (albumId, songId) => {
    const { albums, saveLibrary } = get();
    set({
      albums: albums.map(album =>
        album.id === albumId && !album.songIds.includes(songId)
          ? { ...album, songIds: [...album.songIds, songId] }
          : album
      ),
    });
    saveLibrary();
  },

  removeSongFromAlbum: (albumId, songId) => {
    const { albums, saveLibrary } = get();
    set({
      albums: albums.map(album =>
        album.id === albumId
          ? { ...album, songIds: album.songIds.filter(id => id !== songId) }
          : album
      ),
    });
    saveLibrary();
  },
}));

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
