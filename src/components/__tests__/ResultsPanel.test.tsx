import React from 'react';
import { render, screen } from '@testing-library/react';
import { ResultsPanel } from '../ResultsPanel';

describe('ResultsPanel', () => {
  it('renders multiple faces with correct info and bounding box values', () => {
    const results = [
      {
        face: 1,
        age: 25,
        gender: 'male',
        emotion: 'happy',
        box: { x: 10, y: 20, w: 100, h: 120 },
      },
      {
        face: 2,
        age: 30,
        gender: 'female',
        emotion: 'surprised',
        box: { x: 50, y: 60, w: 80, h: 90 },
      },
    ];
    render(<ResultsPanel results={results} />);
    expect(screen.getAllByText('Face ID').length).toBe(2);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('25 years')).toBeInTheDocument();
    expect(screen.getByText('30 years')).toBeInTheDocument();
    expect(screen.getByText('happy')).toBeInTheDocument();
    expect(screen.getByText('surprised')).toBeInTheDocument();
    // Check bounding box values
    expect(screen.getByText('10.00')).toBeInTheDocument();
    expect(screen.getByText('100.00')).toBeInTheDocument();
    expect(screen.getByText('50.00')).toBeInTheDocument();
    expect(screen.getByText('80.00')).toBeInTheDocument();
  });
});
