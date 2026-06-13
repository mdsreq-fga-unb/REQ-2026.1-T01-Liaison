import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import GalleryGrid from '../GalleryGrid';
import { GalleryPhoto } from '../../../services/api';

const MOCK_PHOTOS: GalleryPhoto[] = [
  { id: 'photo-1', image_url: 'http://test.com/img1.jpg', created_at: '2026-01-01T00:00:00Z' },
  { id: 'photo-2', image_url: 'http://test.com/img2.jpg', created_at: '2026-01-02T00:00:00Z' },
  { id: 'photo-3', image_url: '', created_at: '2026-01-03T00:00:00Z' },
];

describe('GalleryGrid', () => {
  it('renders the section title "Galeria de Fotos"', () => {
    render(<GalleryGrid photos={MOCK_PHOTOS} />);
    expect(screen.getByText('Galeria de Fotos')).toBeTruthy();
  });

  it('renders the photo count', () => {
    render(<GalleryGrid photos={MOCK_PHOTOS} />);
    expect(screen.getByText('3')).toBeTruthy();
  });

  it('displays photos (images and placeholders)', () => {
    render(<GalleryGrid photos={MOCK_PHOTOS} />);
    // photo-1 has an image_url, photo-3 has empty url → placeholder
    expect(screen.getByTestId('gallery-grid')).toBeTruthy();
  });

  it('does not show delete buttons when not editable', () => {
    render(<GalleryGrid photos={MOCK_PHOTOS} editable={false} />);
    expect(() => screen.getByTestId('delete-photo-photo-1')).toThrow();
  });

  it('shows delete buttons when editable', () => {
    render(<GalleryGrid photos={MOCK_PHOTOS} editable onDelete={jest.fn()} />);
    expect(screen.getByTestId('delete-photo-photo-1')).toBeTruthy();
    expect(screen.getByTestId('delete-photo-photo-2')).toBeTruthy();
    expect(screen.getByTestId('delete-photo-photo-3')).toBeTruthy();
  });

  it('shows add tile when editable', () => {
    render(<GalleryGrid photos={MOCK_PHOTOS} editable onAdd={jest.fn()} />);
    expect(screen.getByTestId('gallery-add-tile')).toBeTruthy();
    expect(screen.getByText('Adicionar')).toBeTruthy();
  });

  it('does not show add tile when not editable', () => {
    render(<GalleryGrid photos={MOCK_PHOTOS} editable={false} />);
    expect(() => screen.getByTestId('gallery-add-tile')).toThrow();
  });

  it('calls onDelete when delete button is pressed', () => {
    const onDelete = jest.fn();
    render(<GalleryGrid photos={MOCK_PHOTOS} editable onDelete={onDelete} />);
    fireEvent.press(screen.getByTestId('delete-photo-photo-1'));
    expect(onDelete).toHaveBeenCalledWith('photo-1');
  });

  it('calls onAdd when add tile is pressed', () => {
    const onAdd = jest.fn();
    render(<GalleryGrid photos={MOCK_PHOTOS} editable onAdd={onAdd} />);
    fireEvent.press(screen.getByTestId('gallery-add-tile'));
    expect(onAdd).toHaveBeenCalled();
  });

  it('renders empty grid without photos', () => {
    render(<GalleryGrid photos={[]} />);
    expect(screen.getByText('Galeria de Fotos')).toBeTruthy();
    // No count shown when photos.length is 0
    expect(screen.queryByText('0')).toBeNull();
  });

  it('calls onPhotoPress when photo is pressed', () => {
    const onPhotoPress = jest.fn();
    render(<GalleryGrid photos={MOCK_PHOTOS} onPhotoPress={onPhotoPress} />);
    fireEvent.press(screen.getByTestId('gallery-photo-photo-1'));
    expect(onPhotoPress).toHaveBeenCalledWith('http://test.com/img1.jpg');
  });

  it('renders photos with testID for press handling', () => {
    render(<GalleryGrid photos={MOCK_PHOTOS} onPhotoPress={jest.fn()} />);
    expect(screen.getByTestId('gallery-photo-photo-1')).toBeTruthy();
    expect(screen.getByTestId('gallery-photo-photo-2')).toBeTruthy();
    expect(screen.getByTestId('gallery-photo-photo-3')).toBeTruthy();
  });
});
