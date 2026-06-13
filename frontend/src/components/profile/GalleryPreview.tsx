import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { GalleryPhoto } from '../../services/api';

export interface GalleryPreviewProps {
  photos: GalleryPhoto[];
  onViewAll?: () => void;
  onPhotoPress?: (photo: GalleryPhoto) => void;
  testID?: string;
}

export default function GalleryPreview({
  photos,
  onViewAll,
  onPhotoPress,
  testID = 'gallery-preview',
}: GalleryPreviewProps) {
  if (!photos || photos.length === 0) {
    return (
      <View testID={testID} style={styles.emptyContainer}>
        <Ionicons name="images-outline" size={32} color={colors.text.secondary} />
        <Text style={styles.emptyText}>Nenhuma foto na galeria</Text>
      </View>
    );
  }

  const heroPhoto = photos[0];
  const gridPhotos = photos.slice(1, 5);
  const hasMore = photos.length > 5;

  return (
    <View testID={testID} style={styles.container}>
      {/* Hero Photo */}
      <TouchableOpacity
        testID="gallery-hero-photo"
        style={styles.heroContainer}
        onPress={() => onPhotoPress?.(heroPhoto)}
        activeOpacity={0.9}
      >
        {heroPhoto.image_url ? (
          <Image
            source={{ uri: heroPhoto.image_url }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.heroImage, styles.heroPlaceholder]}>
            <Ionicons name="image-outline" size={32} color={colors.text.secondary} />
          </View>
        )}
      </TouchableOpacity>

      {/* Grid of smaller photos */}
      {gridPhotos.length > 0 && (
        <View style={styles.grid}>
          {gridPhotos.map((photo) => (
            <TouchableOpacity
              key={photo.id}
              testID={`gallery-thumb-${photo.id}`}
              style={styles.thumbWrapper}
              onPress={() => onPhotoPress?.(photo)}
              activeOpacity={0.9}
            >
              {photo.image_url ? (
                <Image
                  source={{ uri: photo.image_url }}
                  style={styles.thumbImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.thumbImage, styles.thumbPlaceholder]}>
                  <Ionicons name="image-outline" size={18} color={colors.text.secondary} />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* "Ver todas as fotos" button */}
      {hasMore && (
        <TouchableOpacity
          testID="gallery-view-all"
          style={styles.viewAllButton}
          onPress={onViewAll}
          activeOpacity={0.7}
        >
          <Ionicons name="images-outline" size={16} color={colors.brand.gold} />
          <Text style={styles.viewAllText}>
            Ver todas as fotos ({photos.length})
          </Text>
          <Ionicons name="chevron-forward" size={14} color={colors.brand.gold} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 8,
  },

  // Hero
  heroContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroPlaceholder: {
    backgroundColor: colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  thumbWrapper: {
    width: '48%',
    height: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    backgroundColor: colors.neutral.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // View All
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: colors.accent.lightBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.brand.gold,
  },
  viewAllText: {
    fontFamily: typography.button.fontFamily,
    fontSize: 13,
    color: colors.brand.gold,
  },
});
