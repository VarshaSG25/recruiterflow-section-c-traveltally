export type ExpenseCategory = 'Food' | 'Travel' | 'Stay' | 'Activities' | 'Other';

export interface Member {
  id: string;
  name: string;
}

export interface EqualSplit {
  type: 'equal';
  memberIds: string[];
}

export interface ExactSplit {
  type: 'exact';
  shares: Record<string, number>; // in paise
}

export interface PercentSplit {
  type: 'percent';
  shares: Record<string, number>; // in percentage (e.g. 33.33)
}

export type Split = EqualSplit | ExactSplit | PercentSplit;

export interface Expense {
  id: string;
  description: string;
  amount: number; // in paise (e.g. 125050 for ₹1,250.50)
  paidBy: string; // member id
  date: string;   // YYYY-MM-DD
  category: ExpenseCategory;
  split: Split;
}

export interface MemberBalance {
  memberId: string;
  name: string;
  paidPaise: number;
  owedPaise: number;
  netPaise: number;
  statusText: string;
  status: 'gets_back' | 'owes' | 'settled';
}

export interface Settlement {
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  amountPaise: number;
}
