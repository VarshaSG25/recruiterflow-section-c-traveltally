import { describe, it, expect } from 'vitest';
import { calculateShares, describeSplit } from './split.js';
import { Member, Split } from './types.js';

describe('Split Logic & Zero-loss Paisa Distribution', () => {
  const members: Member[] = [
    { id: 'm1', name: 'Aarav' },
    { id: 'm2', name: 'Diya' },
    { id: 'm3', name: 'Kabir' },
    { id: 'm4', name: 'Meera' },
    { id: 'm5', name: 'Rohan' },
  ];

  it('splits ₹100 equally between 3 people as ₹33.34 + ₹33.33 + ₹33.33 with zero paise lost', () => {
    // ₹100 in paise is 10000
    const amountPaise = 10000;
    const split: Split = {
      type: 'equal',
      memberIds: ['m1', 'm2', 'm3'],
    };

    const shares = calculateShares(amountPaise, split);

    // Explicit checks mandated by assignment brief:
    // Person 1 gets the extra remainder paisa: 3334 paise (₹33.34)
    expect(shares['m1']).toBe(3334);
    // Person 2 gets 3333 paise (₹33.33)
    expect(shares['m2']).toBe(3333);
    // Person 3 gets 3333 paise (₹33.33)
    expect(shares['m3']).toBe(3333);

    // Sum strictly equals 10000 paise
    const total = shares['m1'] + shares['m2'] + shares['m3'];
    expect(total).toBe(10000);
  });

  it('splits cleanly divisible amounts with exact symmetry', () => {
    // ₹300 (30000 paise) between 3 people
    const shares = calculateShares(30000, {
      type: 'equal',
      memberIds: ['m1', 'm2', 'm3'],
    });

    expect(shares['m1']).toBe(10000);
    expect(shares['m2']).toBe(10000);
    expect(shares['m3']).toBe(10000);
  });

  it('correctly allocates percentage split without losing paise', () => {
    // ₹1,499.99 (149999 paise) split 33.33%, 33.33%, 33.34%
    const shares = calculateShares(149999, {
      type: 'percent',
      shares: {
        m1: 33.33,
        m2: 33.33,
        m3: 33.34,
      },
    });

    const sum = Object.values(shares).reduce((a, b) => a + b, 0);
    expect(sum).toBe(149999);
  });

  it('handles exact split accurately', () => {
    const shares = calculateShares(75000, {
      type: 'exact',
      shares: {
        m1: 50000,
        m2: 25000,
      },
    });

    expect(shares['m1']).toBe(50000);
    expect(shares['m2']).toBe(25000);
    expect(shares['m1'] + shares['m2']).toBe(75000);
  });

  it('produces informative split descriptions', () => {
    expect(describeSplit({ type: 'equal', memberIds: ['m1', 'm2'] }, members)).toBe('Equally, 2 people');
    expect(describeSplit({ type: 'equal', memberIds: ['m1', 'm2', 'm3', 'm4', 'm5'] }, members)).toBe('Equally, all 5 people');
    expect(describeSplit({ type: 'exact', shares: { m1: 1000, m2: 2000 } }, members)).toBe('Exact amounts, 2 people');
    expect(describeSplit({ type: 'percent', shares: { m1: 60, m2: 40 } }, members)).toBe('Percentages, 2 people');
  });
});
