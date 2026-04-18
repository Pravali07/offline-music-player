import { useEffect, useCallback, useState, useMemo } from 'react';
import { FlatList, StyleSheet, RefreshControl, TextInput, TouchableOpacity, View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { PermissionDeniedView } from '@/components/PermissionDeniedView';
import { SongListItem } from '@/components/SongListItem';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { usePlayerStore } from '@/stores';
import {
  requestPermissions,
  getPermissionStatus,
  openPermissionSettings,
  createAppStateListener,
} from '@/services';
import { Colors } from '@/utils/colors';
import { Typography } from '@/utils/typography';
import { Spacing } from '@/utils/spacing';
import type { Song } from '@/types';

type SortOption = 'az' | 'za' | 'artist' | 'duration';

export function SongListScreen() {
  const [isExpoGo, setIsExpoGo] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('az');

  const {
    permissionStatus,
    songs,
    isLoadingSongs,
    songError,
    setPermissionStatus,
    loadSongs,
    currentSong,
    setCurrentSong,
    setQueue,
  } = usePlayerStore();

  const filteredSongs = useMemo(() => {
    const filtered = songs.filter((song) => {
      const query = searchQuery.toLowerCase();
      return (
        song.title.toLowerCase().includes(query) ||
        song.artist.toLowerCase().includes(query)
      );
    });

    return filtered.sort((a, b) => {
      switch (sortOption) {
        case 'az':
          return a.title.localeCompare(b.title);
        case 'za':
          return b.title.localeCompare(a.title);
        case 'artist':
          return a.artist.localeCompare(b.artist);
        case 'duration':
          return a.duration - b.duration;
        default:
          return 0;
      }
    });
  }, [songs, searchQuery, sortOption]);

  const initializePermissions = useCallback(async () => {
    const result = await getPermissionStatus();
    setPermissionStatus(result.status);
    setIsExpoGo(result.isExpoGo ?? false);

    if (result.status === 'granted') {
      loadSongs();
    }
  }, [setPermissionStatus, loadSongs]);

  const handleRequestPermission = useCallback(async () => {
    const result = await requestPermissions();
    setPermissionStatus(result.status);
    setIsExpoGo(result.isExpoGo ?? false);

    if (result.status === 'granted') {
      loadSongs();
    }
  }, [setPermissionStatus, loadSongs]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadSongs();
    setIsRefreshing(false);
  }, [loadSongs]);

  useEffect(() => {
    initializePermissions();

    const removeListener = createAppStateListener((status) => {
      setPermissionStatus(status);
      if (status === 'granted') {
        loadSongs();
      }
    });

    return () => removeListener();
  }, [initializePermissions, setPermissionStatus, loadSongs]);

  const handleSongPress = useCallback(
    (song: Song) => {
      const index = filteredSongs.findIndex((item) => item.id === song.id);
      setQueue(filteredSongs, index);
      setCurrentSong(song);
    },
    [filteredSongs, setQueue, setCurrentSong]
  );

  const renderItem = useCallback(
    ({ item }: { item: Song }) => (
      <SongListItem
        song={item}
        isPlaying={currentSong?.id === item.id}
        onPress={handleSongPress}
      />
    ),
    [currentSong, handleSongPress]
  );

  if (permissionStatus === 'denied' || permissionStatus === 'blocked' || isExpoGo) {
    return (
      <ThemedView style={styles.container}>
        <PermissionDeniedView
          onRequestPermission={handleRequestPermission}
          onOpenSettings={openPermissionSettings}
          isBlocked={permissionStatus === 'blocked'}
          isExpoGo={isExpoGo}
        />
      </ThemedView>
    );
  }

  if (permissionStatus === 'undetermined') {
    return (
      <ThemedView style={styles.container}>
        <PermissionDeniedView
          onRequestPermission={handleRequestPermission}
          onOpenSettings={openPermissionSettings}
          isBlocked={false}
          isExpoGo={isExpoGo}
        />
      </ThemedView>
    );
  }

  if (isLoadingSongs && songs.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <LoadingState message="Loading your songs..." />
      </ThemedView>
    );
  }

  if (songError && songs.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <ErrorState message={songError} onRetry={loadSongs} />
      </ThemedView>
    );
  }

  if (songs.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState
          title="No Songs Found"
          description="Add music to your device or Android emulator media storage to see songs here."
        />
      </ThemedView>
    );
  }

  const sortOptions: SortOption[] = ['az', 'za', 'artist', 'duration'];
  const sortLabels: Record<SortOption, string> = {
    az: 'A-Z',
    za: 'Z-A',
    artist: 'Artist',
    duration: 'Length',
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search songs..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.sortContainer}>
        {sortOptions.map((option) => (
          <TouchableOpacity
            key={option}
            style={[styles.sortButton, sortOption === option && styles.sortButtonActive]}
            onPress={() => setSortOption(option)}>
            <ThemedText
              style={[styles.sortButtonText, sortOption === option && styles.sortButtonTextActive]}>
              {sortLabels[option]}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredSongs}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState title="No Results" description="Try a different search term." />
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    backgroundColor: Colors.surface,
    borderRadius: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  sortContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  sortButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  sortButtonActive: {
    backgroundColor: Colors.primary,
  },
  sortButtonText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  sortButtonTextActive: {
    color: Colors.text,
    fontWeight: Typography.weights.semibold,
  },
  listContent: {
    paddingBottom: 80,
  },
});
