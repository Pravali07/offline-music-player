import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { SongListItem } from '@/components/SongListItem';
import { SongOptionsModal } from '@/components/SongOptionsModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLibraryStore, usePlayerStore } from '@/stores';
import {
  getSongsForSystemCollection,
  type SystemCollectionType,
} from '@/utils/libraryCollections';
import { Colors } from '@/utils/colors';
import { Radius, Spacing } from '@/utils/spacing';
import { Typography } from '@/utils/typography';
import type { Song } from '@/types';

export default function SystemCollectionScreen() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { type, key } = useLocalSearchParams<{ type: SystemCollectionType; key: string }>();
  const { isLiked, toggleLike } = useLibraryStore();
  const { songs, currentSong, setQueue, setCurrentSong, playNext, addToQueue } = usePlayerStore();

  const collectionSongs = getSongsForSystemCollection(songs, type, key);
  const title = collectionSongs[0]
    ? type === 'artist'
      ? collectionSongs[0].artist
      : collectionSongs[0].album
    : type === 'artist'
      ? 'Artist'
      : 'Album';

  const handlePlaySong = (song: Song) => {
    const startIndex = collectionSongs.findIndex((item) => item.id === song.id);
    setQueue(collectionSongs, startIndex);
    setCurrentSong(song);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title }} />
      <View style={styles.header}>
        <View style={styles.badge}>
          <IconSymbol name="folder" size={24} color={Colors.textSecondary} />
        </View>
        <View style={styles.headerInfo}>
          <ThemedText style={styles.title}>{title}</ThemedText>
          <ThemedText style={styles.subtitle}>
            System {type} • {collectionSongs.length} song{collectionSongs.length === 1 ? '' : 's'}
          </ThemedText>
        </View>
      </View>

      {collectionSongs.length === 0 ? (
        <EmptyState
          title="Nothing Here"
          description="This system collection will populate from your song metadata."
        />
      ) : (
        <FlatList
          data={collectionSongs}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <SongListItem
              song={item}
              isPlaying={currentSong?.id === item.id}
              onPress={handlePlaySong}
              onLongPress={() => setSelectedSong(item)}
              onPressOptions={() => setSelectedSong(item)}
              showOptions
              showLike
              isLiked={isLiked(item.id)}
              onToggleLike={toggleLike}
            />
          )}
        />
      )}

      <SongOptionsModal
        visible={selectedSong !== null}
        song={selectedSong}
        onClose={() => setSelectedSong(null)}
        onPlayNow={handlePlaySong}
        onPlayNext={(song) => playNext(song.id)}
        onAddToQueue={(song) => addToQueue(song.id)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  subtitle: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  listContent: {
    paddingBottom: 120,
  },
});
