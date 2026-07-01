import { act, fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';
import { Image, Modal, TouchableOpacity } from 'react-native';

import ImageViewer from '../ImageViewer';

/**
 * Helper: safely counts instances of a given component type.
 * Returns 0 if no instances are found instead of throwing.
 */
function countByType<P>(type: React.ComponentType<P>): number {
  try {
    // @ts-expect-error — UNSAFE_getAllByType throws when 0 matches, so we catch it
    return screen.UNSAFE_getAllByType(type).length;
  } catch {
    return 0;
  }
}

describe('ImageViewer', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Scenario 1: Visible with image ────────────────────────────────
  it('renders modal with close button and image when visible=true and imageUrl is provided', () => {
    render(
      <ImageViewer
        visible={true}
        imageUrl="https://example.com/photo.jpg"
        onClose={mockOnClose}
      />
    );

    // Close button is rendered
    const closeButton = screen.getByTestId('image-viewer-close');
    expect(closeButton).toBeTruthy();

    // Image is rendered (Image component exists in tree)
    const images = screen.UNSAFE_getAllByType(Image);
    expect(images.length).toBe(1);
    expect(images[0].props.source).toEqual({ uri: 'https://example.com/photo.jpg' });

    // Modal is rendered and is transparent with fade animation
    const modal = screen.UNSAFE_getByType(Modal);
    expect(modal.props.visible).toBe(true);
    expect(modal.props.transparent).toBe(true);
    expect(modal.props.animationType).toBe('fade');
  });

  // ── Scenario 2: Visible without image ─────────────────────────────
  it('renders modal with close button and placeholder icon when visible=true and imageUrl is empty', () => {
    render(
      <ImageViewer
        visible={true}
        imageUrl=""
        onClose={mockOnClose}
      />
    );

    // Close button is rendered
    expect(screen.getByTestId('image-viewer-close')).toBeTruthy();

    // No Image component (placeholder icon is shown instead)
    expect(countByType(Image)).toBe(0);

    // Placeholder icon text is rendered (Ionicons "image-outline" mock renders as [icon:image-outline])
    expect(screen.getByText('[icon:image-outline]')).toBeTruthy();
  });

  // ── Scenario 3: Not visible ───────────────────────────────────────
  it('does not render close button or image content when visible=false', () => {
    render(
      <ImageViewer
        visible={false}
        imageUrl="https://example.com/photo.jpg"
        onClose={mockOnClose}
      />
    );

    // When visible=false, Modal does not render its children in RNTL
    // (matching React Native's behaviour on real devices)
    expect(() => screen.getByTestId('image-viewer-close')).toThrow();

    // Modal is still in the tree with visible=false
    const modal = screen.UNSAFE_getByType(Modal);
    expect(modal.props.visible).toBe(false);

    // onClose has not been called (no user interaction happened)
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // ── Scenario 4: Close button press ────────────────────────────────
  it('calls onClose when the close button (testID image-viewer-close) is pressed', () => {
    render(
      <ImageViewer
        visible={true}
        imageUrl="https://example.com/photo.jpg"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByTestId('image-viewer-close');
    fireEvent.press(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // ── Scenario 5: Backdrop press ────────────────────────────────────
  it('calls onClose when the backdrop TouchableOpacity (wrapping the image) is pressed', () => {
    render(
      <ImageViewer
        visible={true}
        imageUrl="https://example.com/photo.jpg"
        onClose={mockOnClose}
      />
    );

    // The component has two TouchableOpacity elements:
    //   1. close button (testID="image-viewer-close")
    //   2. backdrop area wrapping the image (no testID)
    const allTouchables = screen.UNSAFE_getAllByType(TouchableOpacity);
    const backdropTouchable = allTouchables.find(
      (t) => t.props.testID !== 'image-viewer-close'
    );

    expect(backdropTouchable).toBeDefined();
    fireEvent.press(backdropTouchable!);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // ── Scenario 6: onRequestClose (Android back button) ──────────────
  it('calls onClose when Modal onRequestClose fires (Android hardware back button)', () => {
    render(
      <ImageViewer
        visible={true}
        imageUrl="https://example.com/photo.jpg"
        onClose={mockOnClose}
      />
    );

    const modal = screen.UNSAFE_getByType(Modal);
    expect(modal.props.onRequestClose).toBe(mockOnClose);

    // Simulate the Modal firing onRequestClose (Android back button)
    act(() => {
      modal.props.onRequestClose();
    });

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // ── Edge case: Multiple close calls ───────────────────────────────
  it('does not call onClose unexpectedly when no interaction occurs', () => {
    render(
      <ImageViewer
        visible={true}
        imageUrl="https://example.com/photo.jpg"
        onClose={mockOnClose}
      />
    );

    // No interaction — onClose should not be called
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  // ── Edge case: Custom testID prop ─────────────────────────────────
  it('forwards custom testID prop to the Modal component', () => {
    render(
      <ImageViewer
        visible={true}
        imageUrl="https://example.com/photo.jpg"
        onClose={mockOnClose}
        testID="custom-viewer"
      />
    );

    expect(screen.getByTestId('custom-viewer')).toBeTruthy();
    // Close button testID is NOT affected by the custom Modal testID
    expect(screen.getByTestId('image-viewer-close')).toBeTruthy();
  });

  // ── Edge case: Close button accessibility ─────────────────────────
  it('renders close button with accessibility label', () => {
    render(
      <ImageViewer
        visible={true}
        imageUrl="https://example.com/photo.jpg"
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByTestId('image-viewer-close');
    expect(closeButton.props.accessibilityLabel).toBe('Fechar visualizador');
  });

  // ── Edge case: Placeholder renders with empty string imageUrl ─────
  it('renders placeholder when imageUrl is an empty string and no Image is present', () => {
    render(
      <ImageViewer
        visible={true}
        imageUrl=""
        onClose={mockOnClose}
      />
    );

    // Placeholder icon renders (mock: [icon:image-outline])
    expect(screen.getByText('[icon:image-outline]')).toBeTruthy();

    // No Image component in the tree
    expect(countByType(Image)).toBe(0);
  });

  // ── Edge case: Close icon renders (Ionicons "close") ──────────────
  it('renders the close icon inside the close button', () => {
    render(
      <ImageViewer
        visible={true}
        imageUrl="https://example.com/photo.jpg"
        onClose={mockOnClose}
      />
    );

    // The Ionicons "close" mock renders as [icon:close]
    expect(screen.getByText('[icon:close]')).toBeTruthy();
  });
});
