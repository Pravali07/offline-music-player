import { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { SongListItem } from '@/components/SongListItem';
import { SongOptionsModal } from '@/components/SongOptionsModal';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLibraryStore, usePlayerStore } from '@/stores';
import { Colors } from '@/utils/colors';
import { Radius, Spacing } from '@/utils/spacing';
import { Typography } from '@/utils/typography';
import type { Song } from '@/types';

export default function AlbumDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showAddSongsModal, setShowAddSongsModal] = useState(false);
  const [draftAlbumName, setDraftAlbumName] = useState('');

  const {
    albums,
    isLiked,
    toggleLike,
    addSongToAlbum,
    removeSongFromAlbum,
    renameAlbum,
    deleteAlbum,
  } = useLibraryStore();
  const { songs, currentSong, setQueue, setCurrentSong, playNext, addToQueue } = usePlayerStore();

  const album = useMemo(() => albums.find((item) => item.id === id), [albums, id]);
  const albumSongs = useMemo(
    () => songs.filter((song) => album?.songIds.includes(song.id)),
    [album?.songIds, songs]
  );
  const availableSongs = useMemo(
    () => songs.filter((song) => !album?.songIds.includes(song.id)),
    [album?.songIds, songs]
  );

  if (!album) {
    return (
      <ThemedView style={styles.container}>
        <EmptyState title="Album Not Found" description="This album may have been deleted." />
      </ThemedView>
    );
  }

  const handlePlaySong = (song: Song) => {
    const startIndex = albumSongs.findIndex((item) => item.id === song.id);
    setQueue(albumSongs, startIndex);
    setCurrentSong(song);
  };

  const handleRemoveSong = (song: Song) => {
    Alert.alert('Remove Song', `Remove "${song.title}" from "${album.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => removeSongFromAlbum(album.id, song.id),
      },
    ]);
  };

  const handleDeleteAlbum = () => {
    Alert.alert('Delete Album', `Delete "${album.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteAlbum(album.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen options={{ title: album.name }} />
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.artworkBadge}>
              <IconSymbol name="music.note" size={28} color={Colors.primary} />
            </View>
            <View style={styles.headerInfo}>
              <ThemedText style={styles.albumName}>{album.name}</ThemedText>
              <ThemedText style={styles.albumMeta}>
                {albumSongs.length} song{albumSongs.length === 1 ? '' : 's'}
              </ThemedText>
            </View>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={() => setShowAddSongsModal(true)}>
              <IconSymbol name="plus" size={18} color={Colors.primary} />
              <ThemedText style={styles.headerActionText}>Add Songs</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerAction}
              onPress={() => {
                setDraftAlbumName(album.name);
                setShowRenameModal(true);
              }}>
              <IconSymbol name="ellipsis" size={18} color={Colors.textSecondary} />
              <ThemedText style={styles.headerActionSecondary}>Rename</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerAction} onPress={handleDeleteAlbum}>
              <IconSymbol name="xmark" size={18} color={Colors.error} />
              <ThemedText style={styles.headerActionDanger}>Delete</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        {albumSongs.length > 0 ? (
          <FlatList
            data={albumSongs}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <SongListItem
                song={item}
                isPlaying={currentSong?.id === item.id}
                onPress={handlePlaySong}
                onLongPress={() => handleRemoveSong(item)}
                onPressOptions={() => setSelectedSong(item)}
                showOptions
                showLike
                isLiked={isLiked(item.id)}
                onToggleLike={toggleLike}
              />
            )}
          />
        ) : (
          <EmptyState
            title="Album Is Empty"
            description="Use Add Songs to build this album from your device library."
          />
        )}

        <Modal
          visible={showRenameModal || showAddSongsModal}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setShowRenameModal(false);
            setShowAddSongsModal(false);
          }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {showRenameModal ? (
                <>
                  <ThemedText style={styles.modalTitle}>Rename Album</ThemedText>
                  <TextInput
                    style={styles.modalInput}
                    value={draftAlbumName}
                    onChangeText={setDraftAlbumName}
                    placeholder="Album name"
                    placeholderTextColor={Colors.textSecondary}
                    autoFocus
                  />
                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.modalButton}
                      onPress={() => setShowRenameModal(false)}>
                      <ThemedText style={styles.modalButtonText}>Cancel</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalButton, styles.modalButtonPrimary]}
                      onPress={() => {
                        renameAlbum(album.id, draftAlbumName);
                        setShowRenameModal(false);
                      }}>
                      <ThemedText style={styles.modalButtonTextPrimary}>Save</ThemedText>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <ThemedText style={styles.modalTitle}>Add Songs to {album.name}</ThemedText>
                  <FlatList
                    data={availableSongs}
                    keyExtractor={(item) => item.id}
                    style={styles.songPicker}
                    ListEmptyComponent={
                      <ThemedText style={styles.emptyPickerText}>
                        Every discovered song is already in this album.
                      </ThemedText>
                    }
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.songPickerRow}
                        onPress={() => addSongToAlbum(album.id, item.id)}>
                        <View style={styles.songPickerInfo}>
                          <ThemedText style={styles.songPickerTitle} numberOfLines={1}>
                            {item.title}
                          </ThemedText>
                          <ThemedText style={styles.songPickerSubtitle} numberOfLines={1}>
                            {item.artist}
                          </ThemedText>
                        </View>
                        <IconSymbol name="plus" size={20} color={Colors.primary} />
                      </TouchableOpacity>
                    )}
                  />
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={() => setShowAddSongsModal(false)}>
                    <ThemedText style={styles.modalButtonTextPrimary}>Done</ThemedText>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

        <SongOptionsModal
          visible={selectedSong !== null}
          song={selectedSong}
          onClose={() => setSelectedSong(null)}
          onPlayNow={handlePlaySong}
          onPlayNext={(song) => playNext(song.id)}
          onAddToQueue={(song) => addToQueue(song.id)}
        />
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: Spacing.md,
    gap: Spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  artworkBadge: {
    width: 64,
    height: 64,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  albumName: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  albumMeta: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  headerActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  headerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
  },
  headerActionText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
  },
  headerActionSecondary: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  headerActionDanger: {
    fontSize: Typography.sizes.sm,
    color: Colors.error,
  },
  listContent: {
    paddingBottom: 120,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  modalInput: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surfaceMuted,
  },
  modalButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  modalButtonText: {
    color: Colors.textSecondary,
    fontSize: Typography.sizes.base,
  },
  modalButtonTextPrimary: {
    color: Colors.text,
    fontSize: Typography.sizes.base,
    fontWeight: Typography.weights.semibold,
  },
  songPicker: {
    maxHeight: 320,
  },
  songPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  songPickerInfo: {
    flex: 1,
  },
  songPickerTitle: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  songPickerSubtitle: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  emptyPickerText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    paddingVertical: Spacing.lg,
  },
});
