import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import StockProjection from './stockProjection.jsx';

describe('StockProjection Component', () => {
  test('renders form fields', () => {
    render(<StockProjection />);
    expect(screen.getByLabelText(/Growth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Previous Year/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Opening Stock/i)).toBeInTheDocument();
  });

  test('updates input values', () => {
    render(<StockProjection />);
    const growthInput = screen.getByLabelText(/Growth/i);
    fireEvent.change(growthInput, { target: { value: '10' } });
    expect(growthInput.value).toBe('10');
  });

  test('calculates and displays projected stock and projection', () => {
    render(<StockProjection />);
    fireEvent.change(screen.getByLabelText(/Growth/i), { target: { value: '10' } });
    fireEvent.change(screen.getByLabelText(/Previous Year/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/Opening Stock/i), { target: { value: '50' } });

    fireEvent.click(screen.getByText(/Calculate Projection/i));

    expect(screen.getByText(/Projected Stock:/i)).toBeInTheDocument();
  });

});