import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Expense, ExpenseCategory, Member } from '../logic/types.js';
import initialData from '../data/sample-data.json';

const STORAGE_KEY = 'trip_splitter_data_v1';

interface TripState {
  members: Member[];
  expenses: Expense[];
  selectedCategory: ExpenseCategory | 'All';
  notification: string | null;
}

function loadInitialState(): TripState {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (serialized) {
      const parsed = JSON.parse(serialized);
      if (Array.isArray(parsed.members) && Array.isArray(parsed.expenses)) {
        return {
          members: parsed.members,
          expenses: parsed.expenses,
          selectedCategory: 'All',
          notification: null,
        };
      }
    }
  } catch {
    // If reading localStorage fails or data corrupted, fallback to canonical sample data
  }

  return {
    members: initialData.members,
    expenses: initialData.expenses as Expense[],
    selectedCategory: 'All',
    notification: null,
  };
}

function persistState(members: Member[], expenses: Expense[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ members, expenses }));
  } catch {
    // Graceful degrade if localStorage quota is exceeded or unavailable
  }
}

const initialState: TripState = loadInitialState();

export const expensesSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    addExpense: (state, action: PayloadAction<Expense>) => {
      // Newest expenses first or inserted at beginning
      state.expenses.unshift(action.payload);
      persistState(state.members, state.expenses);
      state.notification = `Expense "${action.payload.description}" was added successfully!`;
    },
    deleteExpense: (state, action: PayloadAction<string>) => {
      const index = state.expenses.findIndex(e => e.id === action.payload);
      if (index !== -1) {
        const deletedDesc = state.expenses[index].description;
        state.expenses.splice(index, 1);
        persistState(state.members, state.expenses);
        state.notification = `Expense "${deletedDesc}" was removed.`;
      }
    },
    setCategoryFilter: (state, action: PayloadAction<ExpenseCategory | 'All'>) => {
      state.selectedCategory = action.payload;
    },
    clearNotification: (state) => {
      state.notification = null;
    },
    resetToSampleData: (state) => {
      state.members = initialData.members;
      state.expenses = initialData.expenses as Expense[];
      state.selectedCategory = 'All';
      persistState(state.members, state.expenses);
      state.notification = 'Reset all data back to original sample expenses!';
    },
  },
});

export const {
  addExpense,
  deleteExpense,
  setCategoryFilter,
  clearNotification,
  resetToSampleData,
} = expensesSlice.actions;

export default expensesSlice.reducer;
