import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './stockProjectionMain.jsx';

describe('StockProjectionMain Component', () => {
  test('renders heading', () => {
    render(<App />);
    expect(screen.getByText(/Stock Projection Tool/i)).toBeInTheDocument();
  });

  test('renders all item names in the table', () => {
    render(<App />);
    const items = [
      "Chicken", "Strips", "Fillets", "Livers", "Chilli Bean", "Rice", "Pap",
      "Coleslaw", "Spinach", "Rolls", "Pulled Chicken"
    ];
    items.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  test('growth percentage input updates value', () => {
    render(<App />);
    const growthInput = screen.getByLabelText(/Growth Percentage/i);
    fireEvent.change(growthInput, { target: { value: '15' } });
    expect(growthInput.value).toBe('15');
  });

  test('projection updates when opening stock and previous month are entered', () => {
    render(<App />);
    const openingStockInputs = screen.getAllByRole('spinbutton', { name: '' }).filter((input, idx) => idx % 2 === 0);
    const previousMonthInputs = screen.getAllByRole('spinbutton', { name: '' }).filter((input, idx) => idx % 2 === 1);

    // Enter values for the first row
    fireEvent.change(openingStockInputs[0], { target: { value: '10' } });
    fireEvent.change(previousMonthInputs[0], { target: { value: '100' } });

    // Growth is default 10%
    // ProjectedStock = 100 + (100 * 0.1) = 110
    // Projection = 110 - 10 = 100.00

    const projectionCell = screen.getAllByRole('cell')[3]; // First row, projection column
    expect(projectionCell).toHaveTextContent('100.00');
  });

  test('projection cell is empty if inputs are empty', () => {
    render(<App />);
    const projectionCells = screen.getAllByRole('cell').filter((_, idx) => (idx + 1) % 4 === 0);
    projectionCells.forEach(cell => {
      expect(cell.textContent).toBe('');
    });
  });
});