/**
 * Formats an amount in paise to Indian currency representation (e.g., ₹1,00,000.00).
 * Handles positive, negative, and zero amounts.
 */
export function formatPaiseToRupees(paise: number): string {
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = absPaise / 100;

  // Format using standard en-IN Indian number formatting
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);

  return `${isNegative ? '-' : ''}₹${formatted}`;
}

/**
 * Parses user input in Rupees (string) into integer paise.
 * Returns null if the string is invalid or has more than 2 decimal places.
 */
export function parseRupeesToPaise(input: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  // Regex matching positive numbers with optional up to 2 decimal places
  // (e.g. 100, 100.5, 100.50)
  const regex = /^-?\d+(\.\d{1,2})?$/;
  if (!regex.test(trimmed)) {
    return null;
  }

  const numericValue = parseFloat(trimmed);
  if (isNaN(numericValue)) {
    return null;
  }

  // Use Math.round to avoid floating point precision issues like 19.99 * 100 = 1998.9999999
  return Math.round(numericValue * 100);
}

/**
 * Formats raw paise into plain decimal string for form editing (e.g. 125050 -> "1250.50")
 */
export function paiseToPlainDecimalString(paise: number): string {
  return (paise / 100).toFixed(2);
}
