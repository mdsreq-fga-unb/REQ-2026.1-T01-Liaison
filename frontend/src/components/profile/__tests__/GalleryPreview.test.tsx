import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import GalleryPreview, { GalleryPreviewProps } from '../GalleryPreview';
import { GalleryPhoto } from '../../../services/api';

// ── Mock Data ───────────────────────────────────────────────────────

const MOCK_PHOTOS: GalleryPhoto[] = [
  { id: 'p1', image_url: 'http://test.com/1.jpg', created_at: '2026-01-01' },
  { id: 'p2', image_url: 'http://test.com/2.jpg', created_at: '2026-01-02' },
  { id: 'p3', image_url: '', created_at: '2026-01-03' },
  { id: 'p4', image_url: 'http://test.com/4.jpg', created_at: '2026-01-04' },
  { id: 'p5', image_url: 'http://test.com/5.jpg', created_at: '2026-01-05' },
  { id: 'p6', image_url: 'http://test.com/6.jpg', created_at: '2026-01-06' },
];

// ── Helpers ─────────────────────────────────────────────────────────

const renderGallery = (overrides: Partial<GalleryPreviewProps> = {}) => {
  const defaultProps: GalleryPreviewProps = {
    photos: MOCK_PHOTOS,
  };
  return render(<GalleryPreview {...defaultProps} {...overrides} />);
};

// ── Tests ───────────────────────────────────────────────────────────

describe('GalleryPreview', () => {
  // ── Scenario 1: Empty photos array ──────────────────────────────

  describe('empty state', () => {
    it('renders empty state with "Nenhuma foto na galeria" text when photos is an empty array', () => {
      render(<GalleryPreview photos={[]} />);

      expect(screen.getByText('Nenhuma foto na galeria')).toBeTruthy();
      expect(screen.getByText('[icon:images-outline]')).toBeTruthy();
    });

    it('renders empty state when photos is null or undefined', () => {
      // @ts-expect-error – testing runtime null handling
      const { rerender } = render(<GalleryPreview photos={null} />);
      expect(screen.getByText('Nenhuma foto na galeria')).toBeTruthy();

      rerender(<GalleryPreview photos={undefined as unknown as GalleryPhoto[]} />);
      expect(screen.getByText('Nenhuma foto na galeria')).toBeTruthy();
    });

    it('does not render hero photo or "Ver todas" in empty state', () => {
      render(<GalleryPreview photos={[]} />);

      expect(() => screen.getByTestId('gallery-hero-photo')).toThrow();
      expect(() => screen.getByTestId('gallery-view-all')).toThrow();
    });

    it('uses the testID prop on the empty container', () => {
      render(<GalleryPreview photos={[]} testID="custom-empty" />);
      expect(screen.getByTestId('custom-empty')).toBeTruthy();
    });
  });

  // ── Scenario 2: Single photo ────────────────────────────────────

  describe('single photo', () => {
    const singlePhoto = MOCK_PHOTOS.slice(0, 1);

    it('renders hero photo with testID gallery-hero-photo', () => {
      render(<GalleryPreview photos={singlePhoto} />);
      expect(screen.getByTestId('gallery-hero-photo')).toBeTruthy();
    });

    it('does not render any grid thumbnails', () => {
      render(<GalleryPreview photos={singlePhoto} />);
      expect(() => screen.getByTestId('gallery-thumb-p2')).toThrow();
    });

    it('does not render "Ver todas" button (only >5 triggers it)', () => {
      render(<GalleryPreview photos={singlePhoto} />);
      expect(() => screen.getByTestId('gallery-view-all')).toThrow();
    });

    it('renders the hero image when image_url is present', () => {
      render(<GalleryPreview photos={singlePhoto} />);
      // Valid image_url → Image is rendered, no placeholder icon
      expect(screen.queryByText('[icon:image-outline]')).toBeNull();
    });
  });

  // ── Scenario 3: 5 photos ───────────────────────────────────────

  describe('five photos', () => {
    const fivePhotos = MOCK_PHOTOS.slice(0, 5); // p1–p5

    it('renders hero photo', () => {
      render(<GalleryPreview photos={fivePhotos} />);
      expect(screen.getByTestId('gallery-hero-photo')).toBeTruthy();
    });

    it('renders 4 grid thumbnails (photos[1] through photos[4])', () => {
      render(<GalleryPreview photos={fivePhotos} />);

      // p2, p3, p4, p5 should be in the grid
      expect(screen.getByTestId('gallery-thumb-p2')).toBeTruthy();
      expect(screen.getByTestId('gallery-thumb-p3')).toBeTruthy();
      expect(screen.getByTestId('gallery-thumb-p4')).toBeTruthy();
      expect(screen.getByTestId('gallery-thumb-p5')).toBeTruthy();
    });

    it('does NOT render "Ver todas" button (only >5 triggers it)', () => {
      render(<GalleryPreview photos={fivePhotos} />);
      expect(screen.queryByTestId('gallery-view-all')).toBeNull();
    });
  });

  // ── Scenario 4: 6+ photos ──────────────────────────────────────

  describe('six or more photos', () => {
    it('renders hero photo', () => {
      render(<GalleryPreview photos={MOCK_PHOTOS} />);
      expect(screen.getByTestId('gallery-hero-photo')).toBeTruthy();
    });

    it('renders 4 grid thumbnails', () => {
      render(<GalleryPreview photos={MOCK_PHOTOS} />);

      expect(screen.getByTestId('gallery-thumb-p2')).toBeTruthy();
      expect(screen.getByTestId('gallery-thumb-p3')).toBeTruthy();
      expect(screen.getByTestId('gallery-thumb-p4')).toBeTruthy();
      expect(screen.getByTestId('gallery-thumb-p5')).toBeTruthy();
    });

    it('does NOT render p6 as a grid thumbnail (grid capped at 4)', () => {
      render(<GalleryPreview photos={MOCK_PHOTOS} />);
      expect(() => screen.getByTestId('gallery-thumb-p6')).toThrow();
    });

    it('renders "Ver todas as fotos" button with correct photo count', () => {
      render(<GalleryPreview photos={MOCK_PHOTOS} />);

      const viewAllButton = screen.getByTestId('gallery-view-all');
      expect(viewAllButton).toBeTruthy();
      expect(screen.getByText('Ver todas as fotos (6)')).toBeTruthy();
    });

    it('renders "Ver todas" with correct count when there are 7 photos', () => {
      const sevenPhotos: GalleryPhoto[] = [
        ...MOCK_PHOTOS,
        { id: 'p7', image_url: 'http://test.com/7.jpg', created_at: '2026-01-07' },
      ];
      render(<GalleryPreview photos={sevenPhotos} />);

      expect(screen.getByText('Ver todas as fotos (7)')).toBeTruthy();
    });
  });

  // ── Scenario 5: onViewAll callback ─────────────────────────────

  describe('onViewAll callback', () => {
    it('calls onViewAll when "Ver todas" button is pressed', () => {
      const onViewAll = jest.fn();
      render(<GalleryPreview photos={MOCK_PHOTOS} onViewAll={onViewAll} />);

      fireEvent.press(screen.getByTestId('gallery-view-all'));
      expect(onViewAll).toHaveBeenCalledTimes(1);
    });

    it('does not throw when onViewAll is undefined and "Ver todas" is pressed', () => {
      render(<GalleryPreview photos={MOCK_PHOTOS} />);

      // Should not throw — onViewAll is optional and the component
      // passes it directly to onPress (TouchableOpacity handles undefined gracefully)
      expect(() => {
        fireEvent.press(screen.getByTestId('gallery-view-all'));
      }).not.toThrow();
    });

    it('does not show "Ver todas" button when hasMore is false, so callback cannot fire', () => {
      const onViewAll = jest.fn();
      render(<GalleryPreview photos={MOCK_PHOTOS.slice(0, 5)} onViewAll={onViewAll} />);

      expect(screen.queryByTestId('gallery-view-all')).toBeNull();
      expect(onViewAll).not.toHaveBeenCalled();
    });
  });

  // ── Scenario 6: onPhotoPress callback (hero photo) ─────────────

  describe('onPhotoPress callback — hero photo', () => {
    it('calls onPhotoPress with the hero photo (first in array) when hero is pressed', () => {
      const onPhotoPress = jest.fn();
      const photos = MOCK_PHOTOS.slice(0, 3);
      render(<GalleryPreview photos={photos} onPhotoPress={onPhotoPress} />);

      fireEvent.press(screen.getByTestId('gallery-hero-photo'));

      expect(onPhotoPress).toHaveBeenCalledTimes(1);
      expect(onPhotoPress).toHaveBeenCalledWith(photos[0]); // p1
    });

    it('calls onPhotoPress with hero photo from a different array', () => {
      const onPhotoPress = jest.fn();
      const customPhotos: GalleryPhoto[] = [
        { id: 'hero', image_url: 'http://test.com/hero.jpg', created_at: '2026-01-01' },
        { id: 'other', image_url: 'http://test.com/other.jpg', created_at: '2026-01-02' },
      ];
      render(<GalleryPreview photos={customPhotos} onPhotoPress={onPhotoPress} />);

      fireEvent.press(screen.getByTestId('gallery-hero-photo'));

      expect(onPhotoPress).toHaveBeenCalledWith(customPhotos[0]);
    });

    it('does not throw when onPhotoPress is undefined and hero is pressed', () => {
      render(<GalleryPreview photos={MOCK_PHOTOS.slice(0, 1)} />);

      expect(() => {
        fireEvent.press(screen.getByTestId('gallery-hero-photo'));
      }).not.toThrow();
    });
  });

  // ── Scenario 7: onPhotoPress callback (grid thumb) ─────────────

  describe('onPhotoPress callback — grid thumbnail', () => {
    it('calls onPhotoPress with the correct photo when a grid thumb is pressed', () => {
      const onPhotoPress = jest.fn();
      render(<GalleryPreview photos={MOCK_PHOTOS} onPhotoPress={onPhotoPress} />);

      // p2 is the first grid thumb (index 1)
      fireEvent.press(screen.getByTestId('gallery-thumb-p2'));
      expect(onPhotoPress).toHaveBeenCalledWith(MOCK_PHOTOS[1]); // p2
    });

    it('calls onPhotoPress with the last grid thumb photo', () => {
      const onPhotoPress = jest.fn();
      render(<GalleryPreview photos={MOCK_PHOTOS} onPhotoPress={onPhotoPress} />);

      // p5 is the last grid thumb (index 4)
      fireEvent.press(screen.getByTestId('gallery-thumb-p5'));
      expect(onPhotoPress).toHaveBeenCalledWith(MOCK_PHOTOS[4]); // p5
    });

    it('calls onPhotoPress separately for each grid thumb pressed', () => {
      const onPhotoPress = jest.fn();
      render(<GalleryPreview photos={MOCK_PHOTOS} onPhotoPress={onPhotoPress} />);

      fireEvent.press(screen.getByTestId('gallery-thumb-p2'));
      fireEvent.press(screen.getByTestId('gallery-thumb-p4'));

      expect(onPhotoPress).toHaveBeenCalledTimes(2);
      expect(onPhotoPress).toHaveBeenNthCalledWith(1, MOCK_PHOTOS[1]); // p2
      expect(onPhotoPress).toHaveBeenNthCalledWith(2, MOCK_PHOTOS[3]); // p4
    });

    it('does not throw when onPhotoPress is undefined and a grid thumb is pressed', () => {
      render(<GalleryPreview photos={MOCK_PHOTOS} />);

      expect(() => {
        fireEvent.press(screen.getByTestId('gallery-thumb-p2'));
      }).not.toThrow();
    });
  });

  // ── Scenario 8: Photo with empty image_url — placeholder ───────

  describe('empty image_url placeholder', () => {
    it('renders placeholder icon instead of Image for grid thumb with empty image_url', () => {
      render(<GalleryPreview photos={MOCK_PHOTOS} />);

      // p3 (index 2) has empty image_url; it is in the grid (indices 1–4)
      // The placeholder uses Ionicons "image-outline" which mocks to `[icon:image-outline]`
      const placeholders = screen.getAllByText('[icon:image-outline]');

      // p1 (hero) has valid URL — no hero placeholder
      // p2, p4, p5 have valid URLs
      // Only p3 (grid thumb) has empty image_url → 1 placeholder
      expect(placeholders.length).toBe(1);
    });

    it('renders placeholder icon for hero photo when hero image_url is empty', () => {
      const photosWithEmptyHero: GalleryPhoto[] = [
        { id: 'empty-hero', image_url: '', created_at: '2026-01-01' },
        { id: 'valid-thumb', image_url: 'http://test.com/thumb.jpg', created_at: '2026-01-02' },
      ];
      render(<GalleryPreview photos={photosWithEmptyHero} />);

      // The hero container should exist and contain the placeholder icon
      const heroContainer = screen.getByTestId('gallery-hero-photo');
      expect(heroContainer).toBeTruthy();

      // There should be exactly 1 placeholder icon (hero); grid thumb has valid URL
      const placeholders = screen.getAllByText('[icon:image-outline]');
      expect(placeholders.length).toBe(1);
    });

    it('renders no placeholder icons when all photos have valid image_url', () => {
      const allValid: GalleryPhoto[] = [
        { id: 'v1', image_url: 'http://test.com/a.jpg', created_at: '2026-01-01' },
        { id: 'v2', image_url: 'http://test.com/b.jpg', created_at: '2026-01-02' },
      ];
      render(<GalleryPreview photos={allValid} />);

      expect(screen.queryByText('[icon:image-outline]')).toBeNull();
    });
  });

  // ── Custom testID prop ─────────────────────────────────────────

  describe('testID prop', () => {
    it('applies default testID "gallery-preview" to the container', () => {
      render(<GalleryPreview photos={MOCK_PHOTOS} />);
      expect(screen.getByTestId('gallery-preview')).toBeTruthy();
    });

    it('applies custom testID to the container', () => {
      render(<GalleryPreview photos={MOCK_PHOTOS} testID="my-gallery" />);
      expect(screen.getByTestId('my-gallery')).toBeTruthy();
    });

    it('applies custom testID to the empty container', () => {
      render(<GalleryPreview photos={[]} testID="my-empty" />);
      expect(screen.getByTestId('my-empty')).toBeTruthy();
    });
  });
});
