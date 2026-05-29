import { fireEvent, render, screen } from '@testing-library/react-native';
import React from 'react';

import Checkbox from './Checkbox';

describe('Checkbox', () => {
  it('renders the label text', () => {
    render(<Checkbox label="Aceito os termos" checked={false} onChange={() => {}} />);
    expect(screen.getByText('Aceito os termos')).toBeTruthy();
  });

  it('renders unchecked state initially', () => {
    render(<Checkbox label="Termos" checked={false} onChange={() => {}} />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox.props.accessibilityState?.checked).toBe(false);
  });

  it('renders checked state when checked prop is true', () => {
    render(<Checkbox label="Termos" checked={true} onChange={() => {}} />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox.props.accessibilityState?.checked).toBe(true);
  });

  it('calls onChange when pressed', () => {
    const onChange = jest.fn();
    render(<Checkbox label="Termos" checked={false} onChange={onChange} />);
    fireEvent.press(screen.getByTestId('checkbox'));
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('calls onChange with new state when toggled', () => {
    const onChange = jest.fn();
    render(<Checkbox label="Termos" checked={false} onChange={onChange} />);
    fireEvent.press(screen.getByTestId('checkbox'));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('calls onChange with false when unchecked', () => {
    const onChange = jest.fn();
    render(<Checkbox label="Termos" checked={true} onChange={onChange} />);
    fireEvent.press(screen.getByTestId('checkbox'));
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it('renders error message when error prop is provided', () => {
    render(
      <Checkbox
        label="Termos"
        checked={false}
        onChange={() => {}}
        error="Você deve aceitar os termos"
      />,
    );
    expect(screen.getByText('Você deve aceitar os termos')).toBeTruthy();
  });
});
