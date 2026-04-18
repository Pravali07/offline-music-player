import type { Song } from '@/types';

export type SystemCollectionType = 'album' | 'artist';

export type SystemCollection = {
  id: string;
  key: string;
  name: string;
  songCount: number;
  songIds: string[];
  type: SystemCollectionType;
  isSystem: true;
};

export const UNKNOWN_ALBUM = 'Unknown Album';
export const UNKNOWN_ARTIST = 'Unknown Artist';

export function normalizeAlbumName(album?: string): string {
  return normalizeValue(album, UNKNOWN_ALBUM);
}

export function normalizeArtistName(artist?: string): string {
  return normalizeValue(artist, UNKNOWN_ARTIST);
}

export function createCollectionKey(value: string): string {
  return encodeURIComponent(value);
}

export function buildSystemCollections(
  songs: Song[],
  type: SystemCollectionType
): SystemCollection[] {
  const groupedSongs = new Map<string, Song[]>();

  for (const song of songs) {
    const name =
      type === 'album' ? normalizeAlbumName(song.album) : normalizeArtistName(song.artist);
    const group = groupedSongs.get(name) ?? [];
    group.push(song);
    groupedSongs.set(name, group);
  }

  return Array.from(groupedSongs.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, collectionSongs]) => ({
      id: `system-${type}-${createCollectionKey(name)}`,
      key: createCollectionKey(name),
      name,
      songCount: collectionSongs.length,
      songIds: collectionSongs.map((song) => song.id),
      type,
      isSystem: true,
    }));
}

export function getSongsForSystemCollection(
  songs: Song[],
  type: SystemCollectionType,
  key: string
): Song[] {
  return songs.filter((song) => {
    const name =
      type === 'album' ? normalizeAlbumName(song.album) : normalizeArtistName(song.artist);
    return createCollectionKey(name) === key;
  });
}

function normalizeValue(value: string | undefined, fallback: string): string {
  const normalized = value?.trim();
  return normalized ? normalized : fallback;
}
