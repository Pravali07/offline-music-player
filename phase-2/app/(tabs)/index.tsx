import { useEffect, useCallback, useState } from 'react';
import { FlatList, StyleSheet, RefreshControl } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { ErrorState } from '@/components/ErrorState';
import { LoadingState } from '@/components/LoadingState';
import { PermissionDeniedView } from '@/components/PermissionDeniedView';
import { SongListItem } from '@/components/SongListItem';
import { ThemedView } from '@/components/themed-view';
import { usePlayerStore } from '@/stores';
import {
  requestPermissions,
  getPermissionStatus,
  openPermissionSettings,
  createAppStateListener,
} from '@/services';
import { Colors } from '@/utils/colors';
import type { Song } from '@/types';

export default function SongsScreen() {
  const [isExpoGo, setIsExpoGo] = useState(false);

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
      const index = songs.findIndex((s) => s.id === song.id);
      setQueue(songs, index);
      setCurrentSong(song);
    },
    [songs, setQueue, setCurrentSong]
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

  const keyExtractor = useCallback((item: Song) => item.id, []);

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

  if (isLoadingSongs) {
    return (
      <ThemedView style={styles.container}>
        <LoadingState message="Loading your songs..." />
      </ThemedView>
    );
  }

  if (songError) {
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

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={songs}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        refreshControl={
          <RefreshControl
            refreshing={isLoadingSongs}
            onRefresh={loadSongs}
            tintColor={Colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
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
    paddingBottom: 80,
  },
});
