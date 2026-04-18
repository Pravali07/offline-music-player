import { useState } from 'react';
import { StyleSheet, View, Modal, TouchableOpacity, FlatList, TextInput, Alert } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLibraryStore } from '@/stores';
import { Colors } from '@/utils/colors';
import { Typography } from '@/utils/typography';
import { Spacing, Radius } from '@/utils/spacing';
import type { Song } from '@/types';

interface SongOptionsModalProps {
  visible: boolean;
  song: Song | null;
  onClose: () => void;
  onPlayNow?: (song: Song) => void;
  onPlayNext?: (song: Song) => void;
  onAddToQueue?: (song: Song) => void;
}

export function SongOptionsModal({
  visible,
  song,
  onClose,
  onPlayNow,
  onPlayNext,
  onAddToQueue,
}: SongOptionsModalProps) {
  const { albums, addSongToAlbum, createAlbum, isLiked, toggleLike } = useLibraryStore();
  const [showAlbumPicker, setShowAlbumPicker] = useState(false);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);

  const liked = song ? isLiked(song.id) : false;

  const handleAddToAlbum = (albumId: string) => {
    if (song) {
      addSongToAlbum(albumId, song.id);
      Alert.alert('Added', `Song added to album`);
      setShowAlbumPicker(false);
      onClose();
    }
  };

  const handleCreateAlbum = () => {
    if (newAlbumName.trim()) {
      const albumId = createAlbum(newAlbumName.trim());
      if (albumId && song) {
        addSongToAlbum(albumId, song.id);
        Alert.alert('Created', `Added song to "${newAlbumName.trim()}"`);
        onClose();
      }
      setNewAlbumName('');
      setShowCreateAlbum(false);
      setShowAlbumPicker(false);
    }
  };

  if (!song) return null;

  if (showAlbumPicker) {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Add to Album</ThemedText>
              <TouchableOpacity onPress={() => { setShowAlbumPicker(false); setShowCreateAlbum(false); }}>
                <IconSymbol name="xmark" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {showCreateAlbum ? (
              <View style={styles.createAlbumForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Album name"
                  placeholderTextColor={Colors.textSecondary}
                  value={newAlbumName}
                  onChangeText={setNewAlbumName}
                  autoFocus
                />
                <View style={styles.createAlbumButtons}>
                  <TouchableOpacity style={styles.cancelButton} onPress={() => setShowCreateAlbum(false)}>
                    <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.createButton} onPress={handleCreateAlbum}>
                    <ThemedText style={styles.createButtonText}>Create</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <FlatList
                  data={albums}
                  keyExtractor={item => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.albumItem} onPress={() => handleAddToAlbum(item.id)}>
                      <IconSymbol name="music.note" size={24} color={Colors.primary} />
                      <ThemedText style={styles.albumName}>{item.name}</ThemedText>
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={
                    <ThemedText style={styles.emptyText}>No albums yet. Create one first!</ThemedText>
                  }
                  style={styles.albumList}
                />
                <TouchableOpacity style={styles.newAlbumButton} onPress={() => setShowCreateAlbum(true)}>
                  <IconSymbol name="plus" size={24} color={Colors.primary} />
                  <ThemedText style={styles.newAlbumText}>Create New Album</ThemedText>
                </TouchableOpacity>
              </>
            )}
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <ThemedView style={styles.modalContent}>
          <View style={styles.songInfo}>
            <ThemedText style={styles.songTitle} numberOfLines={1}>{song.title}</ThemedText>
            <ThemedText style={styles.songArtist} numberOfLines={1}>{song.artist}</ThemedText>
          </View>

          <View style={styles.options}>
            {onPlayNow && (
              <TouchableOpacity style={styles.option} onPress={() => { onPlayNow(song); onClose(); }}>
                <IconSymbol name="play.fill" size={24} color={Colors.text} />
                <ThemedText style={styles.optionText}>Play Now</ThemedText>
              </TouchableOpacity>
            )}

            {onPlayNext && (
              <TouchableOpacity style={styles.option} onPress={() => { onPlayNext(song); onClose(); }}>
                <IconSymbol name="text.insert" size={24} color={Colors.text} />
                <ThemedText style={styles.optionText}>Play Next</ThemedText>
              </TouchableOpacity>
            )}

            {onAddToQueue && (
              <TouchableOpacity style={styles.option} onPress={() => { onAddToQueue(song); onClose(); }}>
                <IconSymbol name="text.append" size={24} color={Colors.text} />
                <ThemedText style={styles.optionText}>Add to Queue</ThemedText>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.option}
              onPress={() => {
                toggleLike(song.id);
                onClose();
              }}>
              <IconSymbol
                name={liked ? 'heart.fill' : 'heart'}
                size={24}
                color={liked ? Colors.primary : Colors.text}
              />
              <ThemedText style={styles.optionText}>
                {liked ? 'Remove from Liked Songs' : 'Add to Liked Songs'}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.option} onPress={() => setShowAlbumPicker(true)}>
              <IconSymbol name="folder.badge.plus" size={24} color={Colors.text} />
              <ThemedText style={styles.optionText}>Add to Album</ThemedText>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <ThemedText style={styles.closeButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingBottom: Spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  songInfo: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  songTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  songArtist: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  options: {
    padding: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  optionText: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  closeButton: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
  albumList: {
    maxHeight: 300,
    padding: Spacing.sm,
  },
  albumItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  albumName: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    padding: Spacing.lg,
  },
  newAlbumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
  },
  newAlbumText: {
    fontSize: Typography.sizes.base,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
  createAlbumForm: {
    padding: Spacing.md,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  createAlbumButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
  createButton: {
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
    fontWeight: Typography.weights.semibold,
  },
});
