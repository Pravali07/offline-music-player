import { useMemo, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';

import { EmptyState } from '@/components/EmptyState';
import { LoadingState } from '@/components/LoadingState';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useLibraryStore, usePlayerStore } from '@/stores';
import {
  buildSystemCollections,
  type SystemCollectionType,
} from '@/utils/libraryCollections';
import { Colors } from '@/utils/colors';
import { Radius, Spacing } from '@/utils/spacing';
import { Typography } from '@/utils/typography';

type TabType = 'liked' | 'albums' | 'artists';

export default function LibraryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('liked');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [draftAlbumName, setDraftAlbumName] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  const { likedSongIds, albums, isLoaded, createAlbum, renameAlbum, deleteAlbum } = useLibraryStore();
  const { songs } = usePlayerStore();

  const likedSongs = useMemo(
    () => songs.filter((song) => likedSongIds.includes(song.id)),
    [likedSongIds, songs]
  );
  const systemAlbums = useMemo(() => buildSystemCollections(songs, 'album'), [songs]);
  const systemArtists = useMemo(() => buildSystemCollections(songs, 'artist'), [songs]);

  const openAlbum = (albumId: string) => {
    router.push(`/album/${albumId}`);
  };

  const openSystemCollection = (type: SystemCollectionType, key: string) => {
    router.push({
      pathname: '/collection/[type]/[key]' as never,
      params: { type, key },
    });
  };

  const handleCreateAlbum = () => {
    const albumId = createAlbum(draftAlbumName);
    if (!albumId) {
      return;
    }

    setDraftAlbumName('');
    setShowCreateModal(false);
    openAlbum(albumId);
  };

  const handleRenameAlbum = () => {
    if (!selectedAlbumId) {
      return;
    }

    renameAlbum(selectedAlbumId, draftAlbumName);
    setDraftAlbumName('');
    setSelectedAlbumId(null);
    setShowRenameModal(false);
  };

  const promptAlbumActions = (albumId: string, albumName: string) => {
    Alert.alert('Album Actions', albumName, [
      {
        text: 'Rename',
        onPress: () => {
          setSelectedAlbumId(albumId);
          setDraftAlbumName(albumName);
          setShowRenameModal(true);
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Delete Album', `Delete "${albumName}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => deleteAlbum(albumId),
            },
          ]);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  if (!isLoaded) {
    return (
      <ThemedView style={styles.container}>
        <LoadingState message="Loading your library..." />
      </ThemedView>
    );
  }

  const userAlbums = albums.map((album) => ({
    id: album.id,
    key: album.id,
    name: album.name,
    songCount: album.songIds.length,
    isSystem: false as const,
  }));

  const renderCollectionItem = ({
    item,
  }: {
    item: { id: string; key: string; name: string; songCount: number; isSystem: boolean };
  }) => (
    <TouchableOpacity
      style={[styles.collectionItem, item.isSystem && styles.systemCollectionItem]}
      onPress={() =>
        item.isSystem
          ? openSystemCollection(activeTab === 'albums' ? 'album' : 'artist', item.key)
          : openAlbum(item.id)
      }
      onLongPress={() => !item.isSystem && promptAlbumActions(item.id, item.name)}>
      <View style={[styles.collectionIcon, item.isSystem && styles.systemCollectionIcon]}>
        <IconSymbol
          name={item.isSystem ? 'folder' : 'music.note'}
          size={24}
          color={item.isSystem ? Colors.textSecondary : Colors.primary}
        />
      </View>
      <View style={styles.collectionInfo}>
        <View style={styles.collectionTitleRow}>
          <ThemedText style={styles.collectionName} numberOfLines={1}>
            {item.name}
          </ThemedText>
          {item.isSystem && <ThemedText style={styles.systemBadge}>System</ThemedText>}
        </View>
        <ThemedText style={styles.collectionMeta}>
          {item.songCount} song{item.songCount === 1 ? '' : 's'}
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={24} color={Colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>Library</ThemedText>
      </View>

      <View style={styles.tabs}>
        {(['liked', 'albums', 'artists'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}>
            <ThemedText style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'liked' ? 'Liked Songs' : tab === 'albums' ? 'Albums' : 'Artists'}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'liked' && (
        <TouchableOpacity
          style={styles.heroCard}
          onPress={() => router.push({ pathname: '/liked-songs' as never })}>
          <View>
            <ThemedText style={styles.heroTitle}>Liked Songs</ThemedText>
            <ThemedText style={styles.heroSubtitle}>
              {likedSongs.length} liked track{likedSongs.length === 1 ? '' : 's'} saved to your
              library
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={24} color={Colors.primary} />
        </TouchableOpacity>
      )}

      {activeTab === 'albums' && (
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => {
            setDraftAlbumName('');
            setShowCreateModal(true);
          }}>
          <IconSymbol name="plus" size={22} color={Colors.primary} />
          <ThemedText style={styles.actionButtonText}>Create Album</ThemedText>
        </TouchableOpacity>
      )}

      {activeTab === 'liked' && likedSongs.length === 0 ? (
        <EmptyState
          title="No Liked Songs Yet"
          description="Tap the heart on any song, then come back here to find it fast."
        />
      ) : null}

      {activeTab === 'albums' && userAlbums.length + systemAlbums.length === 0 ? (
        <EmptyState
          title="No Albums Yet"
          description="Create a personal album or use the auto-grouped system albums."
        />
      ) : null}

      {activeTab === 'artists' && systemArtists.length === 0 ? (
        <EmptyState
          title="No Artists Yet"
          description="Artists will appear here once songs are loaded from your device."
        />
      ) : null}

      {activeTab === 'albums' && (
        <FlatList
          data={[...userAlbums, ...systemAlbums]}
          renderItem={renderCollectionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      {activeTab === 'artists' && (
        <FlatList
          data={systemArtists}
          renderItem={renderCollectionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        visible={showCreateModal || showRenameModal}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setShowCreateModal(false);
          setShowRenameModal(false);
          setSelectedAlbumId(null);
        }}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <ThemedText style={styles.modalTitle}>
              {showCreateModal ? 'Create Album' : 'Rename Album'}
            </ThemedText>
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
                onPress={() => {
                  setShowCreateModal(false);
                  setShowRenameModal(false);
                  setSelectedAlbumId(null);
                }}>
                <ThemedText style={styles.modalButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={showCreateModal ? handleCreateAlbum : handleRenameAlbum}>
                <ThemedText style={styles.modalButtonTextPrimary}>
                  {showCreateModal ? 'Create' : 'Save'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  title: {
    fontSize: Typography.sizes['3xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.text,
  },
  tabs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  tab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.text,
    fontWeight: Typography.weights.semibold,
  },
  heroCard: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceMuted,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  heroTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
  },
  heroSubtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  actionButtonText: {
    fontSize: Typography.sizes.base,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
  listContent: {
    paddingBottom: 120,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  systemCollectionItem: {
    backgroundColor: Colors.background,
  },
  collectionIcon: {
    width: Spacing['2xl'],
    height: Spacing['2xl'],
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemCollectionIcon: {
    backgroundColor: Colors.surfaceMuted,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  collectionName: {
    flex: 1,
    fontSize: Typography.sizes.base,
    color: Colors.text,
    fontWeight: Typography.weights.medium,
  },
  systemBadge: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  collectionMeta: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
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
    maxWidth: 420,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  modalInput: {
    backgroundColor: Colors.surfaceMuted,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    color: Colors.text,
    fontSize: Typography.sizes.base,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
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
    fontSize: Typography.sizes.base,
    color: Colors.textSecondary,
  },
  modalButtonTextPrimary: {
    fontSize: Typography.sizes.base,
    color: Colors.text,
    fontWeight: Typography.weights.semibold,
  },
});
