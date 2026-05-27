import { render, screen } from '@testing-library/react-native';
import React from 'react';

import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  it('renders 4 steps', () => {
    render(<ProgressBar currentStep={1} totalSteps={4} />);
    // Deve ter 4 indicadores de step
    const steps = screen.getAllByTestId('progress-step');
    expect(steps).toHaveLength(4);
  });

  it('highlights the current step', () => {
    render(<ProgressBar currentStep={2} totalSteps={4} />);
    const activeStep = screen.getByTestId('progress-step-active');
    expect(activeStep).toBeTruthy();
  });

  it('shows step numbers', () => {
    render(<ProgressBar currentStep={1} totalSteps={4} />);
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
  });

  it('marks steps before current as completed', () => {
    render(<ProgressBar currentStep={3} totalSteps={4} />);
    const completedSteps = screen.getAllByTestId('progress-step-completed');
    // Steps 1 e 2 devem estar completos quando currentStep=3
    expect(completedSteps.length).toBeGreaterThanOrEqual(2);
  });

  it('marks steps after current as pending', () => {
    render(<ProgressBar currentStep={2} totalSteps={4} />);
    const pendingSteps = screen.getAllByTestId('progress-step-pending');
    // Steps 3 e 4 devem estar pendentes quando currentStep=2
    expect(pendingSteps.length).toBeGreaterThanOrEqual(2);
  });

  it('renders step 1 as active when currentStep is 1', () => {
    render(<ProgressBar currentStep={1} totalSteps={4} />);
    expect(screen.getByTestId('progress-step-active')).toBeTruthy();
  });

  it('renders step 4 as active when currentStep is 4', () => {
    render(<ProgressBar currentStep={4} totalSteps={4} />);
    const activeStep = screen.getByTestId('progress-step-active');
    expect(activeStep).toBeTruthy();
  });
});
