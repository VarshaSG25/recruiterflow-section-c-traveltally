import { Member, Split } from './types.js';

/**
 * Calculates each participating member's share in paise for a given expense.
 * Guarantees zero-loss paisa precision: sum of shares === expenseAmountPaise.
 */
export function calculateShares(expenseAmountPaise: number, split: Split): Record<string, number> {
  const result: Record<string, number> = {};

  if (split.type === 'equal') {
    const { memberIds } = split;
    if (memberIds.length === 0) {
      return result;
    }

    const count = memberIds.length;
    const baseShare = Math.floor(expenseAmountPaise / count);
    const remainder = expenseAmountPaise % count;

    // Zero-paisa loss rule:
    // Distribute remainder paise one-by-one to the first `remainder` members in array order.
    memberIds.forEach((id, index) => {
      const extraPaisa = index < remainder ? 1 : 0;
      result[id] = baseShare + extraPaisa;
    });

    return result;
  }

  if (split.type === 'exact') {
    // Exact split already specifies amounts in paise
    for (const [id, sharePaise] of Object.entries(split.shares)) {
      result[id] = sharePaise;
    }
    return result;
  }

  if (split.type === 'percent') {
    const entries = Object.entries(split.shares);
    if (entries.length === 0) {
      return result;
    }

    // Calculate raw paise and floor shares
    const items = entries.map(([id, pct]) => {
      const rawPaise = (expenseAmountPaise * pct) / 100;
      const floored = Math.floor(rawPaise);
      const fraction = rawPaise - floored;
      return { id, floored, fraction };
    });

    const sumFloored = items.reduce((acc, item) => acc + item.floored, 0);
    const discrepancy = expenseAmountPaise - sumFloored; // extra paise to allocate

    // Sort by largest fractional remainder to give extra paise where rounding lost most
    const sorted = [...items].sort((a, b) => b.fraction - a.fraction);

    const bonusMap: Record<string, number> = {};
    for (let i = 0; i < discrepancy; i++) {
      const targetId = sorted[i % sorted.length].id;
      bonusMap[targetId] = (bonusMap[targetId] || 0) + 1;
    }

    for (const item of items) {
      result[item.id] = item.floored + (bonusMap[item.id] || 0);
    }

    return result;
  }

  return result;
}

/**
 * Returns human-readable description of how an expense is split.
 * E.g., "Equally, 4 people", "Exact amounts, 3 people", "Percentages, 3 people"
 */
export function describeSplit(split: Split, members: Member[]): string {
  if (split.type === 'equal') {
    const count = split.memberIds.length;
    if (count === members.length) {
      return `Equally, all ${count} people`;
    }
    return `Equally, ${count} ${count === 1 ? 'person' : 'people'}`;
  }

  if (split.type === 'exact') {
    const count = Object.keys(split.shares).length;
    return `Exact amounts, ${count} ${count === 1 ? 'person' : 'people'}`;
  }

  if (split.type === 'percent') {
    const count = Object.keys(split.shares).length;
    return `Percentages, ${count} ${count === 1 ? 'person' : 'people'}`;
  }

  return 'Custom split';
}
