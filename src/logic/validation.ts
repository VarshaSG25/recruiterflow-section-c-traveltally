import { ExpenseCategory, Member, Split } from './types.js';
import { formatPaiseToRupees, parseRupeesToPaise } from './money.js';

export interface FormState {
  description: string;
  amountRupees: string;
  paidBy: string;
  date: string;
  category: ExpenseCategory | '';
  splitType: 'equal' | 'exact' | 'percent';
  equalMembers: string[];
  exactAmounts: Record<string, string>; // memberId -> string amount in rupees
  percentages: Record<string, string>;  // memberId -> string percentage
}

export interface FormErrors {
  description?: string;
  amount?: string;
  paidBy?: string;
  date?: string;
  category?: string;
  split?: string;
  splitDetails?: Record<string, string>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: FormErrors;
  parsedAmountPaise?: number;
  finalSplit?: Split;
}

/**
 * Validates expense form submission and builds valid typed Split structure.
 * Pure function with zero dependencies on React or DOM.
 */
export function validateExpenseForm(
  form: FormState,
  allMembers: Member[],
  currentDateYmd: string = new Date().toISOString().split('T')[0]
): ValidationResult {
  const errors: FormErrors = {};

  // 1. Description validation
  const descTrimmed = form.description.trim();
  if (!descTrimmed) {
    errors.description = 'Description is required';
  } else if (descTrimmed.length > 60) {
    errors.description = 'Description must be at most 60 characters';
  }

  // 2. Amount validation
  let parsedAmountPaise: number | undefined;
  const amountStr = form.amountRupees.trim();
  if (!amountStr) {
    errors.amount = 'Amount is required';
  } else {
    // Check if it's a negative number
    if (amountStr.startsWith('-') || parseFloat(amountStr) < 0) {
      errors.amount = 'Amount must be more than ₹0';
    } else {
      const paise = parseRupeesToPaise(amountStr);
      if (paise === null) {
        errors.amount = 'Enter a valid amount with up to 2 decimal places';
      } else if (paise <= 0) {
        errors.amount = 'Amount must be more than ₹0';
      } else if (paise > 100000000) {
        // Max ₹10,00,000 = 1,000,000 * 100 paise = 100,000,000 paise
        errors.amount = 'Amount cannot exceed ₹10,00,000';
      } else {
        parsedAmountPaise = paise;
      }
    }
  }

  // 3. Paid By validation
  if (!form.paidBy) {
    errors.paidBy = 'Paid by is required';
  } else if (!allMembers.some(m => m.id === form.paidBy)) {
    errors.paidBy = 'Selected payer is invalid';
  }

  // 4. Date validation
  if (!form.date) {
    errors.date = 'Date is required';
  } else {
    if (form.date > currentDateYmd) {
      errors.date = 'The date cannot be in the future';
    }
  }

  // 5. Category validation
  const validCategories: ExpenseCategory[] = ['Food', 'Travel', 'Stay', 'Activities', 'Other'];
  if (!form.category) {
    errors.category = 'Category is required';
  } else if (!validCategories.includes(form.category as ExpenseCategory)) {
    errors.category = 'Category must be Food, Travel, Stay, Activities or Other';
  }

  // 6. Split validation
  let finalSplit: Split | undefined;

  if (form.splitType === 'equal') {
    if (form.equalMembers.length === 0) {
      errors.split = 'At least one member must be selected';
    } else {
      finalSplit = {
        type: 'equal',
        memberIds: [...form.equalMembers],
      };
    }
  } else if (form.splitType === 'exact') {
    let exactSumPaise = 0;
    const exactShares: Record<string, number> = {};
    const exactFieldErrors: Record<string, string> = {};
    let hasFieldErrors = false;

    for (const member of allMembers) {
      const valStr = (form.exactAmounts[member.id] || '').trim();
      if (!valStr || valStr === '0') {
        exactShares[member.id] = 0;
        continue;
      }

      if (valStr.startsWith('-') || parseFloat(valStr) < 0) {
        exactFieldErrors[member.id] = 'Amount must be ₹0 or more';
        hasFieldErrors = true;
        continue;
      }

      const paise = parseRupeesToPaise(valStr);
      if (paise === null) {
        exactFieldErrors[member.id] = 'Max 2 decimals';
        hasFieldErrors = true;
      } else {
        exactShares[member.id] = paise;
        exactSumPaise += paise;
      }
    }

    if (hasFieldErrors) {
      errors.splitDetails = exactFieldErrors;
    }

    if (parsedAmountPaise !== undefined) {
      if (exactSumPaise !== parsedAmountPaise) {
        const diff = parsedAmountPaise - exactSumPaise;
        if (diff > 0) {
          errors.split = `${formatPaiseToRupees(diff)} left to assign`;
        } else {
          errors.split = `${formatPaiseToRupees(Math.abs(diff))} over assigned`;
        }
      } else {
        finalSplit = {
          type: 'exact',
          shares: exactShares,
        };
      }
    }
  } else if (form.splitType === 'percent') {
    let percentSum = 0;
    const percentShares: Record<string, number> = {};
    const percentFieldErrors: Record<string, string> = {};
    let hasFieldErrors = false;

    for (const member of allMembers) {
      const valStr = (form.percentages[member.id] || '').trim();
      if (!valStr || valStr === '0') {
        percentShares[member.id] = 0;
        continue;
      }

      const regex = /^\d+(\.\d{1,2})?$/;
      if (!regex.test(valStr)) {
        percentFieldErrors[member.id] = 'Must be between 0-100 with up to 2 decimals';
        hasFieldErrors = true;
        continue;
      }

      const numVal = parseFloat(valStr);
      if (numVal < 0 || numVal > 100) {
        percentFieldErrors[member.id] = 'Must be between 0 and 100';
        hasFieldErrors = true;
      } else {
        percentShares[member.id] = numVal;
        percentSum += numVal;
      }
    }

    if (hasFieldErrors) {
      errors.splitDetails = percentFieldErrors;
    }

    // Check sum equals exactly 100 with 2 decimal precision
    const roundedSum = Math.round(percentSum * 100) / 100;
    if (roundedSum !== 100) {
      const diff = Math.round((100 - roundedSum) * 100) / 100;
      if (diff > 0) {
        errors.split = `${diff.toFixed(2)}% left to assign (must equal 100%)`;
      } else {
        errors.split = `${Math.abs(diff).toFixed(2)}% over assigned (must equal 100%)`;
      }
    } else {
      finalSplit = {
        type: 'percent',
        shares: percentShares,
      };
    }
  }

  const isValid = Object.keys(errors).length === 0 && parsedAmountPaise !== undefined && finalSplit !== undefined;

  return {
    isValid,
    errors,
    parsedAmountPaise,
    finalSplit,
  };
}
