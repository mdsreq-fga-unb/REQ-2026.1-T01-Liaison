/**
 * Testes TDD (Red Phase) — AdvancedFiltersModal component (Issue #20)
 *
 * Modal de filtros avançados: localização (texto) + carga horária máx (workload_max).
 * Props: visible, onApply({ location, workload_max }), onClose.
 *
 * Cobre:
 * - Quando visible, mostra os campos de localização e carga horária máx
 * - Botão Aplicar chama onApply com { location, workload_max }
 * - Botão limpar/fechar chama onClose
 */

import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import AdvancedFiltersModal from './AdvancedFiltersModal';

const defaultProps = {
  visible: true,
  onApply: jest.fn(),
  onClose: jest.fn(),
};

describe('AdvancedFiltersModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the location input when visible', () => {
    render(<AdvancedFiltersModal {...defaultProps} />);
    expect(screen.getByTestId('filter-location-input')).toBeTruthy();
  });

  it('renders the workload max input when visible', () => {
    render(<AdvancedFiltersModal {...defaultProps} />);
    expect(screen.getByTestId('filter-workload-input')).toBeTruthy();
  });

  it('renders the apply button', () => {
    render(<AdvancedFiltersModal {...defaultProps} />);
    expect(screen.getByTestId('filter-apply-button')).toBeTruthy();
  });

  it('calls onApply with location and workload_max when apply is pressed', () => {
    const onApply = jest.fn();
    render(<AdvancedFiltersModal {...defaultProps} onApply={onApply} />);
    fireEvent.changeText(screen.getByTestId('filter-location-input'), 'Brasília');
    fireEvent.changeText(screen.getByTestId('filter-workload-input'), '10');
    fireEvent.press(screen.getByTestId('filter-apply-button'));
    expect(onApply).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({ location: 'Brasília', workload_max: '10' })
    );
  });

  it('calls onClose when close button is pressed', () => {
    const onClose = jest.fn();
    render(<AdvancedFiltersModal {...defaultProps} onClose={onClose} />);
    fireEvent.press(screen.getByTestId('filter-close-button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when not visible', () => {
    render(<AdvancedFiltersModal {...defaultProps} visible={false} />);
    expect(screen.queryByTestId('filter-location-input')).toBeNull();
  });
});
