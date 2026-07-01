import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../../context/AuthContext';
import ImageViewer from '../../components/profile/ImageViewer';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import {
  getStudentProfile,
  GalleryPhoto,
} from '../../services/api';

const PAGE_SIZE = 12;

export default function GalleryFullScreen() {
  const navigation = useNavigation<any>();
  const { accessToken } = useAuth();

  const [allPhotos, setAllPhotos] = useState<GalleryPhoto[]>([]);
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerUrl, setViewerUrl] = useState('');

  const loadPhotos = useCallback(async () => {
    if (!accessToken) return;
    try {
      setErrorMessage('');
      const data = await getStudentProfile(accessToken);
      setAllPhotos(data.gallery || []);
      setDisplayedCount(PAGE_SIZE);
    } catch {
      setErrorMessage('Não foi possível carregar as fotos.');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  function handleLoadMore() {
    setIsLoadingMore(true);
    // Simulate loading delay for UX
    setTimeout(() => {
      setDisplayedCount((prev) => Math.min(prev + PAGE_SIZE, allPhotos.length));
      setIsLoadingMore(false);
    }, 300);
  }

  function openViewer(photo: GalleryPhoto) {
    if (photo.image_url) {
      setViewerUrl(photo.image_url);
      setViewerVisible(true);
    }
  }

  const visiblePhotos = allPhotos.slice(0, displayedCount);
  const hasMore = displayedCount < allPhotos.length;

  if (isLoading) {
    return (
      <View style={styles.root}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            testID="gallery-full-back"
          >
            <Ionicons name="arrow-back" size={20} color={colors.neutral.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Galeria de Fotos</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.brand.gold} />
          <Text style={styles.loadingText}>Carregando fotos...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* ═══ FIXED: Navy Header ═══ */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          testID="gallery-full-back"
        >
          <Ionicons name="arrow-back" size={20} color={colors.neutral.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Galeria de Fotos</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ═══ Content ═══ */}
      {errorMessage ? (
        <View style={styles.errorContainer}>
          <Ionicons name="information-circle" size={48} color={colors.text.secondary} />
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPhotos}>
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.photoCount}>
            {allPhotos.length} {allPhotos.length === 1 ? 'foto' : 'fotos'}
          </Text>

          {visiblePhotos.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={48} color={colors.text.secondary} />
              <Text style={styles.emptyText}>Nenhuma foto na galeria</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {visiblePhotos.map((photo) => (
                <TouchableOpacity
                  key={photo.id}
                  testID={`gallery-full-photo-${photo.id}`}
                  style={styles.photoWrapper}
                  onPress={() => openViewer(photo)}
                  activeOpacity={0.9}
                >
                  {photo.image_url ? (
                    <Image
                      source={{ uri: photo.image_url }}
                      style={styles.photo}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.photo, styles.photoPlaceholder]}>
                      <Ionicons name="image-outline" size={24} color={colors.text.secondary} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Load More */}
          {hasMore && (
            <TouchableOpacity
              testID="gallery-full-load-more"
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
              disabled={isLoadingMore}
              activeOpacity={0.7}
            >
              {isLoadingMore ? (
                <ActivityIndicator size="small" color={colors.brand.gold} />
              ) : (
                <>
                  <Ionicons name="images-outline" size={16} color={colors.brand.gold} />
                  <Text style={styles.loadMoreText}>
                    Carregar mais fotos ({allPhotos.length - displayedCount} restantes)
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      )}

      {/* ═══ Image Viewer Modal ═══ */}
      <ImageViewer
        visible={viewerVisible}
        imageUrl={viewerUrl}
        onClose={() => setViewerVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.neutral.bg,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 12,
  },

  // Header
  header: {
    backgroundColor: colors.brand.navy,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
  },
  headerBackButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 18,
    color: colors.neutral.white,
  },
  headerSpacer: {
    width: 36,
  },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: colors.brand.gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryButtonText: {
    fontFamily: typography.button.fontFamily,
    fontSize: 15,
    color: colors.neutral.white,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Photo count
  photoCount: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 16,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 12,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoWrapper: {
    width: '31.5%',
    height: 114,
    borderRadius: 10,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    backgroundColor: colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Load More
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: 20,
    backgroundColor: colors.accent.lightBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.brand.gold,
  },
  loadMoreText: {
    fontFamily: typography.button.fontFamily,
    fontSize: 13,
    color: colors.brand.gold,
  },

  bottomSpacer: {
    height: 32,
  },
});
