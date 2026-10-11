import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import { 
  deleteExpense, 
  setCategoryFilter, 
  clearNotification, 
  resetToSampleData 
} from '../store/expensesSlice.js';
import { calculateBalances, computeSettlements } from '../logic/balance.js';
import { formatPaiseToRupees } from '../logic/money.js';
import { describeSplit } from '../logic/split.js';
import { ExpenseCategory, Expense } from '../logic/types.js';
import { 
  Trash2, 
  Plus, 
  Filter, 
  ArrowRight, 
  CheckCircle, 
  RotateCcw, 
  AlertCircle, 
  X,
  CreditCard,
  Users,
  Compass
} from 'lucide-react';

const CATEGORIES: (ExpenseCategory | 'All')[] = [
  'All',
  'Food',
  'Travel',
  'Stay',
  'Activities',
  'Other',
];

export const ExpensesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { members, expenses, selectedCategory, notification } = useAppSelector(state => state.trip);

  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [showSettlementModal, setShowSettlementModal] = useState(false);

  // Calculate balances using pure logic outside component
  const balances = useMemo(() => {
    return calculateBalances(members, expenses);
  }, [members, expenses]);

  // Compute optimal settlement transactions
  const settlements = useMemo(() => {
    return computeSettlements(members, balances);
  }, [members, balances]);

  // Verify net sum invariant
  const totalNetPaise = useMemo(() => {
    return balances.reduce((sum, b) => sum + b.netPaise, 0);
  }, [balances]);

  // Member map for quick lookup
  const memberNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of members) {
      map[m.id] = m.name;
    }
    return map;
  }, [members]);

  // Filter expenses and sort newest date first
  const filteredExpenses = useMemo(() => {
    let list = [...expenses];
    if (selectedCategory !== 'All') {
      list = list.filter(e => e.category === selectedCategory);
    }
    // Sort newest date first
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, selectedCategory]);

  // Total of expenses currently shown
  const currentTotalPaise = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const confirmDelete = () => {
    if (expenseToDelete) {
      dispatch(deleteExpense(expenseToDelete.id));
      setExpenseToDelete(null);
    }
  };

  const getCategoryBadgeClass = (category: ExpenseCategory) => {
    switch (category) {
      case 'Food':
        return 'bg-amber-950/60 text-amber-300 border-amber-500/30';
      case 'Travel':
        return 'bg-sky-950/60 text-sky-300 border-sky-500/30';
      case 'Stay':
        return 'bg-purple-950/60 text-purple-300 border-purple-500/40';
      case 'Activities':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-900/60 text-slate-300 border-slate-500/30';
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div 
          role="status"
          aria-live="polite"
          className="flex items-center justify-between p-4 bg-purple-900/40 border border-purple-400/40 rounded-2xl text-purple-100 shadow-lg backdrop-blur-xl transition-all"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-fuchsia-400 shrink-0" />
            <p className="text-sm font-semibold">{notification}</p>
          </div>
          <button
            type="button"
            onClick={() => dispatch(clearNotification())}
            className="p-1 hover:bg-purple-800/50 rounded-lg text-purple-300 transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header section with TravelTally brand and 2D Travel Pill Cards */}
      <div className="glass-purple-card rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        {/* Subtle glowing orb in card */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-900/60 border border-purple-400/30 text-purple-300 text-xs font-mono font-bold tracking-wider uppercase">
              <Compass className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Track • Split • Travel</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center">
              <span>TravelTally</span>
            </h1>
            <p className="text-sm sm:text-base text-purple-200/80 max-w-xl">
              Shared trip expense tracking with zero-loss paisa splitting for Aarav, Diya, Kabir, Meera, and Rohan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowSettlementModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold bg-purple-900/50 border border-purple-400/40 text-purple-100 hover:bg-purple-800/60 hover:border-purple-400/70 shadow-lg shadow-purple-950/60 transition-all hover:-translate-y-0.5"
            >
              <CreditCard className="w-4 h-4 text-fuchsia-400" />
              <span>Settle Up Debts</span>
            </button>

            <Link
              to="/expenses/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold neon-btn text-white transition-all hover:-translate-y-0.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </Link>
          </div>
        </div>

        {/* 2D Aesthetic Travel Activity Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mt-6 pt-6 border-t border-purple-500/20 text-xs">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-950/40 border border-purple-500/15 text-purple-200">
            <span className="text-base">🏡</span>
            <span className="font-semibold truncate">Villa Booking</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-950/40 border border-purple-500/15 text-purple-200">
            <span className="text-base">🍤</span>
            <span className="font-semibold truncate">Beach Shack</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-950/40 border border-purple-500/15 text-purple-200">
            <span className="text-base">🤿</span>
            <span className="font-semibold truncate">Scuba Diving</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-950/40 border border-purple-500/15 text-purple-200">
            <span className="text-base">🛵</span>
            <span className="font-semibold truncate">Scooter Rental</span>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-950/40 border border-purple-500/15 text-purple-200">
            <span className="text-base">🚕</span>
            <span className="font-semibold truncate">Airport Cab</span>
          </div>
        </div>
      </div>

      {/* Member Balances Cards */}
      <section aria-labelledby="balances-heading" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-300" />
            <h2 id="balances-heading" className="text-base font-bold text-white tracking-wide">
              Friend Balances
            </h2>
          </div>
          <div className="text-xs font-mono text-purple-300">
            Net balance sum: <span className="font-bold text-white">{formatPaiseToRupees(totalNetPaise)}</span>
            {totalNetPaise === 0 && <span className="text-emerald-400 ml-1.5 font-bold">✓ Balanced</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {balances.map(b => {
            const isGetsBack = b.status === 'gets_back';
            const isOwes = b.status === 'owes';

            return (
              <div
                key={b.memberId}
                className={`p-4 rounded-2xl border transition-all backdrop-blur-xl hover:-translate-y-1 hover:shadow-xl ${
                  isGetsBack
                    ? 'bg-gradient-to-br from-emerald-950/60 to-purple-950/40 border-emerald-500/40 shadow-emerald-950/20'
                    : isOwes
                    ? 'bg-gradient-to-br from-rose-950/60 to-purple-950/40 border-rose-500/40 shadow-rose-950/20'
                    : 'bg-purple-950/50 border-purple-500/25 shadow-black/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-sm tracking-wide">{b.name}</span>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      isGetsBack
                        ? 'bg-emerald-900/60 text-emerald-300 border-emerald-400/40'
                        : isOwes
                        ? 'bg-rose-900/60 text-rose-300 border-rose-400/40'
                        : 'bg-purple-900/60 text-purple-300 border-purple-400/30'
                    }`}
                  >
                    {isGetsBack ? 'credit' : isOwes ? 'debt' : 'settled'}
                  </span>
                </div>
                <div
                  className={`text-base font-extrabold tracking-tight ${
                    isGetsBack
                      ? 'text-emerald-400'
                      : isOwes
                      ? 'text-rose-400'
                      : 'text-purple-300'
                  }`}
                >
                  {b.statusText}
                </div>
                <div className="text-[11px] font-mono text-purple-300/80 mt-1.5 flex justify-between border-t border-purple-500/15 pt-1.5">
                  <span>Paid: {formatPaiseToRupees(b.paidPaise)}</span>
                  <span>Share: {formatPaiseToRupees(b.owedPaise)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Filter & Total Summary Toolbar */}
      <section className="glass-purple-card p-4 sm:p-6 rounded-3xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Category filter pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400 mr-1.5 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-fuchsia-400" /> Category:
            </span>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => dispatch(setCategoryFilter(cat))}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/60 border border-purple-400/40'
                    : 'bg-purple-950/60 text-purple-300 hover:text-white hover:bg-purple-900/60 border border-purple-500/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Total & sample reset */}
          <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-purple-500/20">
            <div className="text-right">
              <div className="text-xs text-purple-300 font-medium">Total shown</div>
              <div className="text-2xl font-black text-white font-mono tracking-tight text-neon-glow">
                {formatPaiseToRupees(currentTotalPaise)}
              </div>
            </div>

            <button
              type="button"
              onClick={() => dispatch(resetToSampleData())}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-purple-200 hover:text-white bg-purple-900/60 hover:bg-purple-800/70 border border-purple-500/30 rounded-xl transition-all shadow-xs"
              title="Reset data back to sample trip expenses"
            >
              <RotateCcw className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Reset sample</span>
            </button>
          </div>
        </div>

        {/* Expenses Table or Empty State */}
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-16 px-4 border border-dashed border-purple-500/30 rounded-2xl bg-purple-950/20">
            <div className="w-12 h-12 mx-auto rounded-full bg-purple-900/40 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No expenses found</h3>
            <p className="text-sm text-purple-300/80 mt-1 max-w-sm mx-auto">
              {selectedCategory !== 'All'
                ? `There are no recorded expenses in the "${selectedCategory}" category.`
                : 'No expenses have been added yet for this trip.'}
            </p>
            <div className="mt-5">
              <Link
                to="/expenses/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold neon-btn text-white shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Add first expense</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:mx-0 rounded-2xl border border-purple-500/20 bg-purple-950/30">
            <table className="min-w-full divide-y divide-purple-500/20 text-left">
              <thead>
                <tr className="bg-purple-950/70 text-[11px] font-bold text-purple-300 uppercase tracking-wider">
                  <th scope="col" className="py-3.5 px-4 font-mono">Date</th>
                  <th scope="col" className="py-3.5 px-4">Description</th>
                  <th scope="col" className="py-3.5 px-4">Category</th>
                  <th scope="col" className="py-3.5 px-4">Paid by</th>
                  <th scope="col" className="py-3.5 px-4 text-right">Amount</th>
                  <th scope="col" className="py-3.5 px-4">Split</th>
                  <th scope="col" className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/15 text-sm">
                {filteredExpenses.map(expense => (
                  <tr
                    key={expense.id}
                    className="hover:bg-purple-900/30 transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-purple-300 font-mono text-xs">
                      {expense.date}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 font-bold text-white">
                      {expense.description}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getCategoryBadgeClass(
                          expense.category
                        )}`}
                      >
                        {expense.category}
                      </span>
                    </td>

                    {/* Paid by */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-purple-100">
                        {memberNameMap[expense.paidBy] || expense.paidBy}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-right font-extrabold text-white font-mono">
                      {formatPaiseToRupees(expense.amount)}
                    </td>

                    {/* Split info */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-purple-300 text-xs">
                      {describeSplit(expense.split, members)}
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-center">
                      <button
                        type="button"
                        onClick={() => setExpenseToDelete(expense)}
                        className="p-1.5 text-purple-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors"
                        title={`Delete ${expense.description}`}
                        aria-label={`Delete ${expense.description}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Delete Confirmation Modal */}
      {expenseToDelete && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className="glass-purple-card rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-purple-500/40">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 id="delete-modal-title" className="text-base font-bold text-white">
                  Delete Expense?
                </h3>
                <p className="text-sm text-purple-200/80 mt-1">
                  Are you sure you want to delete &ldquo;
                  <span className="font-semibold text-white">{expenseToDelete.description}</span>
                  &rdquo; ({formatPaiseToRupees(expenseToDelete.amount)})?
                  All member balances will update immediately.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setExpenseToDelete(null)}
                className="px-4 py-2 rounded-xl text-sm font-medium text-purple-300 hover:bg-purple-900/50 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-950/60 transition-colors"
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settle Up / Direct Debts Modal */}
      {showSettlementModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settle-modal-title"
        >
          <div className="glass-purple-card rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-purple-500/40">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-purple-900/60 border border-purple-400/40 text-fuchsia-400 flex items-center justify-center">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="settle-modal-title" className="text-base font-bold text-white">
                    Debt Simplification & Settlements
                  </h3>
                  <p className="text-xs text-purple-300">
                    Fewest payments needed to completely square up the group
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettlementModal(false)}
                className="p-1 rounded-lg text-purple-400 hover:text-white hover:bg-purple-900/50"
                aria-label="Close settlement modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {settlements.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">Everyone is all settled up!</p>
                <p className="text-xs text-purple-300 mt-0.5">No outstanding debts remain.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {settlements.map((s, idx) => (
                  <div
                    key={`${s.fromId}-${s.toId}-${idx}`}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{s.fromName}</span>
                      <ArrowRight className="w-4 h-4 text-purple-400" />
                      <span className="font-bold text-white">{s.toName}</span>
                    </div>
                    <div className="font-extrabold text-fuchsia-400 font-mono text-base">
                      {formatPaiseToRupees(s.amountPaise)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettlementModal(false)}
                className="px-5 py-2 rounded-xl text-sm font-bold neon-btn text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
