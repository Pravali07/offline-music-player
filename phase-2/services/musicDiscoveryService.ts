import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';
import type { Song } from '@/types';

const MIN_DURATION_SECONDS = 30;
const PAGE_SIZE = 100;

interface AssetInfo {
  id: string;
  uri: string;
  filename?: string;
  duration?: number;
  title?: string;
  artist?: string;
  album?: string;
  albumArtwork?: string;
  localUri?: string;
}

export async function fetchSongs(): Promise<Song[]> {
  if (Platform.OS === 'web') {
    return [];
  }

  const songs: Song[] = [];
  let hasNextPage = true;
  let after: string | null = null;

  while (hasNextPage) {
    const response = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: PAGE_SIZE,
      after: after ?? undefined,
    });

    const assetInfos = await Promise.all(
      response.assets.map((asset) => MediaLibrary.getAssetInfoAsync(asset.id))
    );

    for (const asset of assetInfos) {
      const typedAsset = asset as unknown as AssetInfo;
      
      const durationMs = normalizeDurationMs(typedAsset.duration);
      if (durationMs < MIN_DURATION_SECONDS * 1000) continue;

      const localUri = normalizeAudioUri(typedAsset.localUri, typedAsset.uri);
      if (!localUri) continue;

      const song: Song = {
        id: typedAsset.id,
        title: typedAsset.title || extractFilename(typedAsset.filename) || 'Unknown Title',
        artist: typedAsset.artist || 'Unknown Artist',
        album: typedAsset.album || 'Unknown Album',
        duration: durationMs,
        uri: localUri,
        artwork: typedAsset.albumArtwork || undefined,
      };

      songs.push(song);
    }

    hasNextPage = response.hasNextPage;
    after = response.endCursor;
  }

  return deduplicateByUri(songs);
}

function extractFilename(filename?: string): string | undefined {
  if (!filename) return undefined;
  return filename.replace(/\.[^.]+$/, '');
}

function deduplicateByUri(songs: Song[]): Song[] {
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

function normalizeDurationMs(duration?: number): number {
  if (!duration) return 0;
  return duration > 1000 ? duration : Math.round(duration * 1000);
}
