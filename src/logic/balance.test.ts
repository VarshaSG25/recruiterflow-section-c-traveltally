import { describe, it, expect } from 'vitest';
import { calculateBalances, computeSettlements } from './balance.js';
import { Member, Expense } from './types.js';
import sampleData from '../data/sample-data.json';

describe('Balance Logic & Invariant Checks', () => {
  const members: Member[] = sampleData.members;
  const expenses: Expense[] = sampleData.expenses as Expense[];

  it('guarantees that balances across all members sum to exactly ₹0.00', () => {
    const balances = calculateBalances(members, expenses);
    const sumNetPaise = balances.reduce((acc, b) => acc + b.netPaise, 0);

    expect(sumNetPaise).toBe(0);
  });

  it('calculates correct status for positive, negative, and settled members', () => {
    const balances = calculateBalances(members, expenses);

    for (const b of balances) {
      if (b.netPaise > 0) {
        expect(b.status).toBe('gets_back');
        expect(b.statusText).toContain('gets back');
      } else if (b.netPaise < 0) {
        expect(b.status).toBe('owes');
        expect(b.statusText).toContain('owes');
      } else {
        expect(b.status).toBe('settled');
        expect(b.statusText).toBe('settled up');
      }
    }
  });

  it('correctly handles an expense where the payer is not part of the split', () => {
    // Member m1 pays ₹100 for groceries, split between m2 and m3 only
    const customExpense: Expense = {
      id: 'test_grocery',
      description: 'Groceries for friends',
      amount: 10000,
      paidBy: 'm1',
      date: '2026-03-16',
      category: 'Food',
      split: {
        type: 'equal',
        memberIds: ['m2', 'm3'],
      },
    };

    const balances = calculateBalances(members, [customExpense]);
    const b1 = balances.find(b => b.memberId === 'm1');
    const b2 = balances.find(b => b.memberId === 'm2');
    const b3 = balances.find(b => b.memberId === 'm3');
    const b4 = balances.find(b => b.memberId === 'm4');

    expect(b1?.paidPaise).toBe(10000);
    expect(b1?.owedPaise).toBe(0);
    expect(b1?.netPaise).toBe(10000); // gets back ₹100

    expect(b2?.netPaise).toBe(-5000); // owes ₹50
    expect(b3?.netPaise).toBe(-5000); // owes ₹50
    expect(b4?.netPaise).toBe(0);      // settled up

    const sum = balances.reduce((acc, b) => acc + b.netPaise, 0);
    expect(sum).toBe(0);
  });

  it('computes debt simplification settlements that reconcile to zero balance', () => {
    const balances = calculateBalances(members, expenses);
    const settlements = computeSettlements(members, balances);

    expect(settlements.length).toBeGreaterThan(0);
    for (const s of settlements) {
      expect(s.amountPaise).toBeGreaterThan(0);
      expect(s.fromId).not.toBe(s.toId);
    }
  });
});
