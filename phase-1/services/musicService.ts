import * as MediaLibrary from 'expo-media-library';
import type { Song } from '@/types';

const MIN_DURATION_MS = 30_000;
const PAGE_SIZE = 100;

export async function fetchSongs(): Promise<Song[]> {
  const songs: Song[] = [];
  let hasNextPage = true;
  let after: string | null = null;

  while (hasNextPage) {
    const { assets, endCursor, hasNextPage: hasMore } =
      await MediaLibrary.getAssetsAsync({
        mediaType: MediaLibrary.MediaType.audio,
        first: PAGE_SIZE,
        after: after ?? undefined,
      });

    const assetInfos = await Promise.all(
      assets.map((asset) => MediaLibrary.getAssetInfoAsync(asset.id))
    );

    for (const asset of assetInfos) {
      if (asset.duration < MIN_DURATION_MS) continue;

      const song: Song = {
        id: asset.id,
        title: asset.filename?.replace(/\.[^.]+$/, '') ?? 'Unknown Title',
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        duration: asset.duration,
        uri: asset.uri,
        artwork: asset.uri,
      };

      songs.push(song);
    }

    hasNextPage = hasMore;
    after = endCursor;
  }

  return deduplicateSongs(songs);
}

function deduplicateSongs(songs: Song[]): Song[] {
  const seen = new Set<string>();
  return songs.filter((song) => {
    if (seen.has(song.uri)) return false;
    seen.add(song.uri);
    return true;
  });
}
