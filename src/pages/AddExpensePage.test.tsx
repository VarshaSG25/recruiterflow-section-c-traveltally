import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import expensesReducer from '../store/expensesSlice.js';
import { AddExpensePage } from './AddExpensePage.js';

function renderWithProviders(ui: React.ReactElement) {
  const store = configureStore({
    reducer: {
      trip: expensesReducer,
    },
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          {ui}
        </MemoryRouter>
      </Provider>
    ),
  };
}

describe('AddExpensePage Component (React Testing Library)', () => {
  it('renders all form fields with visible labels and accessible controls', () => {
    renderWithProviders(<AddExpensePage />);

    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount \(₹\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Paid by/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save expense/i })).toBeInTheDocument();
  });

  it('displays field errors when submitting an empty form', async () => {
    renderWithProviders(<AddExpensePage />);

    const saveButton = screen.getByRole('button', { name: /Save expense/i });
    fireEvent.click(saveButton);

    // Errors should appear next to invalid fields
    expect(await screen.findByText(/Description is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/Amount is required/i)).toBeInTheDocument();
  });

  it('displays error message when amount is negative', async () => {
    renderWithProviders(<AddExpensePage />);

    const amountInput = screen.getByLabelText(/Amount \(₹\)/i);
    fireEvent.change(amountInput, { target: { value: '-250' } });

    const saveButton = screen.getByRole('button', { name: /Save expense/i });
    fireEvent.click(saveButton);

    expect(await screen.findByText(/Amount must be more than ₹0/i)).toBeInTheDocument();
  });

  it('successfully saves valid input and adds expense to Redux store', async () => {
    const { store } = renderWithProviders(<AddExpensePage />);

    const initialCount = store.getState().trip.expenses.length;

    // Fill valid data
    const descInput = screen.getByLabelText(/Description/i);
    fireEvent.change(descInput, { target: { value: 'Goa Sunset Cruise' } });

    const amountInput = screen.getByLabelText(/Amount \(₹\)/i);
    fireEvent.change(amountInput, { target: { value: '1500.00' } });

    const dateInput = screen.getByLabelText(/Date/i);
    fireEvent.change(dateInput, { target: { value: '2026-03-12' } });

    const saveButton = screen.getByRole('button', { name: /Save expense/i });
    fireEvent.click(saveButton);

    const newCount = store.getState().trip.expenses.length;
    expect(newCount).toBe(initialCount + 1);

    const latest = store.getState().trip.expenses[0];
    expect(latest.description).toBe('Goa Sunset Cruise');
    expect(latest.amount).toBe(150000); // 1500.00 in paise
  });
});
