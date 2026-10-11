import { Member, Expense, MemberBalance, Settlement } from './types.js';
import { calculateShares } from './split.js';
import { formatPaiseToRupees } from './money.js';

/**
 * Calculates net balances for all members across the provided list of expenses.
 * Guarantees that the sum of all net balances strictly equals 0 paise.
 */
export function calculateBalances(members: Member[], expenses: Expense[]): MemberBalance[] {
  const paidMap: Record<string, number> = {};
  const owedMap: Record<string, number> = {};

  for (const m of members) {
    paidMap[m.id] = 0;
    owedMap[m.id] = 0;
  }

  for (const expense of expenses) {
    // Credit payer
    if (paidMap[expense.paidBy] !== undefined) {
      paidMap[expense.paidBy] += expense.amount;
    }

    // Debit participants
    const shares = calculateShares(expense.amount, expense.split);
    for (const [memberId, sharePaise] of Object.entries(shares)) {
      if (owedMap[memberId] !== undefined) {
        owedMap[memberId] += sharePaise;
      }
    }
  }

  return members.map(m => {
    const paidPaise = paidMap[m.id] || 0;
    const owedPaise = owedMap[m.id] || 0;
    const netPaise = paidPaise - owedPaise;

    let status: 'gets_back' | 'owes' | 'settled';
    let statusText: string;

    if (netPaise > 0) {
      status = 'gets_back';
      statusText = `gets back ${formatPaiseToRupees(netPaise)}`;
    } else if (netPaise < 0) {
      status = 'owes';
      statusText = `owes ${formatPaiseToRupees(Math.abs(netPaise))}`;
    } else {
      status = 'settled';
      statusText = 'settled up';
    }

    return {
      memberId: m.id,
      name: m.name,
      paidPaise,
      owedPaise,
      netPaise,
      statusText,
      status,
    };
  });
}

/**
 * Computes optimal peer-to-peer settlement transactions using a greedy min-cash-flow algorithm.
 */
export function computeSettlements(members: Member[], balances: MemberBalance[]): Settlement[] {
  const memberNameMap = new Map(members.map(m => [m.id, m.name]));

  // Debtors (net < 0) and Creditors (net > 0)
  const debtors = balances
    .filter(b => b.netPaise < 0)
    .map(b => ({ id: b.memberId, amount: Math.abs(b.netPaise) }))
    .sort((a, b) => b.amount - a.amount);

  const creditors = balances
    .filter(b => b.netPaise > 0)
    .map(b => ({ id: b.memberId, amount: b.netPaise }))
    .sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settledPaise = Math.min(debtor.amount, creditor.amount);

    if (settledPaise > 0) {
      settlements.push({
        fromId: debtor.id,
        fromName: memberNameMap.get(debtor.id) || debtor.id,
        toId: creditor.id,
        toName: memberNameMap.get(creditor.id) || creditor.id,
        amountPaise: settledPaise,
      });

      debtor.amount -= settledPaise;
      creditor.amount -= settledPaise;
    }

    if (debtor.amount === 0) dIdx++;
    if (creditor.amount === 0) cIdx++;
  }

  return settlements;
}
