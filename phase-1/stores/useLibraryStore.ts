import { create } from 'zustand';
import type { Album } from '@/types';

interface LibraryState {
  likedSongIds: string[];
  albums: Album[];
}

interface LibraryActions {
  setLikedSongIds: (songIds: string[]) => void;
  setAlbums: (albums: Album[]) => void;
}

type LibraryStore = LibraryState & LibraryActions;

export const useLibraryStore = create<LibraryStore>((set) => ({
  likedSongIds: [],
  albums: [],
  setLikedSongIds: (songIds) => set({ likedSongIds: songIds }),
  setAlbums: (albums) => set({ albums }),
}));
