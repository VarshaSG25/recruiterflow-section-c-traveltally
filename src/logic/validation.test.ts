import { describe, it, expect } from 'vitest';
import { validateExpenseForm, FormState } from './validation.js';
import { Member } from './types.js';

describe('Form Validation Logic (Pure Functions)', () => {
  const members: Member[] = [
    { id: 'm1', name: 'Aarav' },
    { id: 'm2', name: 'Diya' },
    { id: 'm3', name: 'Kabir' },
  ];
  const currentDate = '2026-03-15';

  it('reports errors for missing description, invalid amounts, and future dates', () => {
    const invalidForm: FormState = {
      description: '',
      amountRupees: '-50', // negative
      paidBy: 'm1',
      date: '2026-03-20', // future date
      category: 'Food',
      splitType: 'equal',
      equalMembers: ['m1'],
      exactAmounts: {},
      percentages: {},
    };

    const result = validateExpenseForm(invalidForm, members, currentDate);

    expect(result.isValid).toBe(false);
    expect(result.errors.description).toBe('Description is required');
    expect(result.errors.amount).toBe('Amount must be more than ₹0');
    expect(result.errors.date).toBe('The date cannot be in the future');
  });

  it('flags description exceeding 60 characters', () => {
    const longDesc = 'A'.repeat(61);
    const form: FormState = {
      description: longDesc,
      amountRupees: '100',
      paidBy: 'm1',
      date: '2026-03-12',
      category: 'Food',
      splitType: 'equal',
      equalMembers: ['m1', 'm2'],
      exactAmounts: {},
      percentages: {},
    };

    const result = validateExpenseForm(form, members, currentDate);
    expect(result.isValid).toBe(false);
    expect(result.errors.description).toContain('at most 60 characters');
  });

  it('validates equal split requires at least one member selected', () => {
    const form: FormState = {
      description: 'Dinner',
      amountRupees: '100',
      paidBy: 'm1',
      date: '2026-03-12',
      category: 'Food',
      splitType: 'equal',
      equalMembers: [], // no one selected
      exactAmounts: {},
      percentages: {},
    };

    const result = validateExpenseForm(form, members, currentDate);
    expect(result.isValid).toBe(false);
    expect(result.errors.split).toBe('At least one member must be selected');
  });

  it('reports exact amounts left to assign or over assigned', () => {
    // Total is ₹100, but assigned ₹80 -> ₹20.00 left to assign
    const formUnder: FormState = {
      description: 'Cab',
      amountRupees: '100',
      paidBy: 'm1',
      date: '2026-03-12',
      category: 'Travel',
      splitType: 'exact',
      equalMembers: [],
      exactAmounts: { m1: '50', m2: '30' }, // total 80
      percentages: {},
    };

    const resultUnder = validateExpenseForm(formUnder, members, currentDate);
    expect(resultUnder.isValid).toBe(false);
    expect(resultUnder.errors.split).toContain('left to assign');

    // Assigned ₹120 -> ₹20.00 over assigned
    const formOver: FormState = {
      ...formUnder,
      exactAmounts: { m1: '70', m2: '50' }, // total 120
    };

    const resultOver = validateExpenseForm(formOver, members, currentDate);
    expect(resultOver.isValid).toBe(false);
    expect(resultOver.errors.split).toContain('over assigned');
  });

  it('validates percentages must sum exactly to 100%', () => {
    const form: FormState = {
      description: 'Hotel',
      amountRupees: '500',
      paidBy: 'm1',
      date: '2026-03-12',
      category: 'Stay',
      splitType: 'percent',
      equalMembers: [],
      exactAmounts: {},
      percentages: { m1: '60', m2: '30' }, // sum 90%
    };

    const result = validateExpenseForm(form, members, currentDate);
    expect(result.isValid).toBe(false);
    expect(result.errors.split).toContain('10.00% left to assign (must equal 100%)');
  });

  it('accepts completely valid form input and returns parsed paise and split object', () => {
    const validForm: FormState = {
      description: 'Scuba Diving at Grand Island',
      amountRupees: '10500.50',
      paidBy: 'm2',
      date: '2026-03-14',
      category: 'Activities',
      splitType: 'equal',
      equalMembers: ['m1', 'm2', 'm3'],
      exactAmounts: {},
      percentages: {},
    };

    const result = validateExpenseForm(validForm, members, currentDate);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual({});
    expect(result.parsedAmountPaise).toBe(1050050);
    expect(result.finalSplit).toEqual({
      type: 'equal',
      memberIds: ['m1', 'm2', 'm3'],
    });
  });
});
