import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import type { Song } from '@/types';

const MIN_DURATION_SECONDS = 30;
const PAGE_SIZE = 100;

export async function fetchSongs(): Promise<Song[]> {
  if (Platform.OS === 'web') {
    return [];
  }

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
      const durationMs = normalizeDurationMs(asset.duration);
      if (durationMs < MIN_DURATION_SECONDS * 1000) continue;

      const localUri = normalizeAudioUri(
        'localUri' in asset && typeof asset.localUri === 'string'
          ? asset.localUri
          : undefined,
        asset.uri
      );
      if (!localUri) continue;

      const song: Song = {
        id: asset.id,
        title: asset.filename?.replace(/\.[^.]+$/, '') ?? 'Unknown Title',
        artist: 'Unknown Artist',
        album: 'Unknown Album',
        duration: durationMs,
        uri: localUri,
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

function normalizeAudioUri(...candidates: Array<string | undefined>): string | null {
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (candidate.startsWith('file://')) return candidate;
    if (candidate.startsWith('/')) return `file://${candidate}`;
  }

  return null;
}

function normalizeDurationMs(duration: number): number {
  return duration > 1000 ? duration : Math.round(duration * 1000);
}
