import React from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors } from '../../theme/colors';
import { radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GalleryPhoto } from '../../services/api';

export interface GalleryGridProps {
  photos: GalleryPhoto[];
  editable?: boolean;
  onDelete?: (photoId: string) => void;
  onAdd?: () => void;
  onPhotoPress?: (url: string) => void;
  testID?: string;
}

export default function GalleryGrid({
  photos,
  editable = false,
  onDelete,
  onAdd,
  onPhotoPress,
  testID = 'gallery-grid',
}: GalleryGridProps) {
  const screenWidth = Dimensions.get('window').width;
  const numColumns = 3;
  const gap = 8;
  const horizontalPadding = 40;
  const itemSize = Math.floor(
    (screenWidth - horizontalPadding - (numColumns - 1) * gap) / numColumns,
  );

  return (
    <View testID={testID} style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Galeria de Fotos</Text>
        {photos.length > 0 && (
          <Text style={styles.countText}>{photos.length}</Text>
        )}
      </View>

      <View style={styles.grid}>
        {photos.map((photo) => {
          const handlePhotoPress = () => {
            if (photo.image_url && onPhotoPress) {
              onPhotoPress(photo.image_url);
            }
          };

          return (
            <View key={photo.id} style={[styles.photoWrapper, { width: itemSize, height: itemSize }]}>
              <TouchableOpacity
                testID={`gallery-photo-${photo.id}`}
                style={styles.photoTouchable}
                onPress={handlePhotoPress}
                activeOpacity={onPhotoPress ? 0.8 : 1}
                disabled={!photo.image_url || !onPhotoPress}
                accessibilityLabel="Ver foto"
              >
                {photo.image_url ? (
                  <Image
                    source={{ uri: photo.image_url }}
                    style={styles.photo}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <Ionicons name="image-outline" size={24} color={colors.text.secondary} />
                  </View>
                )}
              </TouchableOpacity>
              {editable && onDelete && (
                <TouchableOpacity
                  testID={`delete-photo-${photo.id}`}
                  style={styles.deleteButton}
                  onPress={() => onDelete(photo.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close" size={12} color={colors.neutral.white} />
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {editable && (
          <TouchableOpacity
            key="__add__"
            testID="gallery-add-tile"
            style={[styles.addTile, { width: itemSize, height: itemSize }]}
            onPress={onAdd}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={28} color={colors.brand.gold} />
            <Text style={styles.addText}>Adicionar</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 16,
    color: colors.text.primary,
  },
  countText: {
    fontFamily: typography.body.fontFamily,
    fontSize: 13,
    color: colors.text.secondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  photoWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  photoTouchable: {
    flex: 1,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.neutral.border,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTile: {
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.neutral.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral.white,
  },
  addText: {
    fontFamily: typography['body-sm'].fontFamily,
    fontSize: 11,
    color: colors.brand.gold,
    marginTop: 4,
  },
});
