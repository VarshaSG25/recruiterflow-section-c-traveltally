import { describe, it, expect } from 'vitest';
import { formatPaiseToRupees, parseRupeesToPaise, paiseToPlainDecimalString } from './money.js';

describe('Money Logic & Currency Formatting', () => {
  it('formats amounts in paise to Indian currency representation correctly', () => {
    // 10000000 paise = ₹1,00,000.00
    expect(formatPaiseToRupees(10000000)).toBe('₹1,00,000.00');

    // 125050 paise = ₹1,250.50
    expect(formatPaiseToRupees(125050)).toBe('₹1,250.50');

    // 0 paise = ₹0.00
    expect(formatPaiseToRupees(0)).toBe('₹0.00');

    // Negative paise handling
    expect(formatPaiseToRupees(-5000)).toBe('-₹50.00');
  });

  it('parses valid rupee strings into integer paise', () => {
    expect(parseRupeesToPaise('1250.50')).toBe(125050);
    expect(parseRupeesToPaise('100')).toBe(10000);
    expect(parseRupeesToPaise('0.05')).toBe(5);
    expect(parseRupeesToPaise('1000000')).toBe(100000000);
  });

  it('rejects invalid rupee inputs or excessive decimal places', () => {
    expect(parseRupeesToPaise('')).toBeNull();
    expect(parseRupeesToPaise('abc')).toBeNull();
    expect(parseRupeesToPaise('12.345')).toBeNull(); // more than 2 decimal places
  });

  it('converts paise to plain decimal strings', () => {
    expect(paiseToPlainDecimalString(125050)).toBe('1250.50');
    expect(paiseToPlainDecimalString(10000)).toBe('100.00');
  });
});
