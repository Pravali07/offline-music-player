import { useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { SongListItem } from '@/components/SongListItem';
import { SongOptionsModal } from '@/components/SongOptionsModal';
import { ThemedView } from '@/components/themed-view';
import { useLibraryStore, usePlayerStore } from '@/stores';
import { Colors } from '@/utils/colors';
import type { Song } from '@/types';

export default function LikedSongsScreen() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const { likedSongIds, isLiked, toggleLike } = useLibraryStore();
  const { songs, currentSong, setQueue, setCurrentSong, playNext, addToQueue } = usePlayerStore();

  const likedSongs = songs.filter((song) => likedSongIds.includes(song.id));

  const handlePlaySong = (song: Song) => {
    const startIndex = likedSongs.findIndex((item) => item.id === song.id);
    setQueue(likedSongs, startIndex);
    setCurrentSong(song);
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Liked Songs' }} />
      {likedSongs.length === 0 ? (
        <EmptyState
          title="No Liked Songs"
          description="Use the heart toggle on any song or in the options menu to save it here."
        />
      ) : (
        <FlatList
          data={likedSongs}
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
  listContent: {
    paddingBottom: 120,
  },
});
