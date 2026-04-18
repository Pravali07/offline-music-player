import { create } from 'zustand';
import type { Album } from '@/types';

interface LibraryState {
  likedSongIds: string[];
  albums: Album[];
}

interface LibraryActions {
  toggleLike: (songId: string) => void;
  addAlbum: (name: string) => string;
  removeAlbum: (albumId: string) => void;
  renameAlbum: (albumId: string, newName: string) => void;
  addSongToAlbum: (albumId: string, songId: string) => void;
  removeSongFromAlbum: (albumId: string, songId: string) => void;
}

type LibraryStore = LibraryState & LibraryActions;

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  likedSongIds: [],
  albums: [],

  toggleLike: (songId) =>
    set((state) => ({
      likedSongIds: state.likedSongIds.includes(songId)
        ? state.likedSongIds.filter((id) => id !== songId)
        : [...state.likedSongIds, songId],
    })),

  addAlbum: (name) => {
    const id = `album_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newAlbum: Album = {
      id,
      name,
      songIds: [],
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ albums: [...state.albums, newAlbum] }));
    return id;
  },

  removeAlbum: (albumId) =>
    set((state) => ({
      albums: state.albums.filter((album) => album.id !== albumId),
    })),

  renameAlbum: (albumId, newName) =>
    set((state) => ({
      albums: state.albums.map((album) =>
        album.id === albumId ? { ...album, name: newName } : album
      ),
    })),

  addSongToAlbum: (albumId, songId) =>
    set((state) => ({
      albums: state.albums.map((album) =>
        album.id === albumId && !album.songIds.includes(songId)
          ? { ...album, songIds: [...album.songIds, songId] }
          : album
      ),
    })),

  removeSongFromAlbum: (albumId, songId) =>
    set((state) => ({
      albums: state.albums.map((album) =>
        album.id === albumId
          ? { ...album, songIds: album.songIds.filter((id) => id !== songId) }
          : album
      ),
    })),
}));
