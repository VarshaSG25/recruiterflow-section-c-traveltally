import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/index.js';
import { addExpense } from '../store/expensesSlice.js';
import { 
  validateExpenseForm, 
  FormState, 
  FormErrors 
} from '../logic/validation.js';
import { parseRupeesToPaise, formatPaiseToRupees } from '../logic/money.js';
import { ExpenseCategory, Expense } from '../logic/types.js';
import { 
  ArrowLeft, 
  Save, 
  X, 
  HelpCircle, 
  AlertCircle,
  PieChart,
  DollarSign,
  Scale,
  Compass
} from 'lucide-react';

const CATEGORIES: ExpenseCategory[] = ['Food', 'Travel', 'Stay', 'Activities', 'Other'];

export const AddExpensePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const members = useAppSelector(state => state.trip.members);

  // Today's date in YYYY-MM-DD
  const todayYmd = new Date().toISOString().split('T')[0];

  // Initialize form state
  const [form, setForm] = useState<FormState>({
    description: '',
    amountRupees: '',
    paidBy: members[0]?.id || '',
    date: todayYmd,
    category: 'Food',
    splitType: 'equal',
    equalMembers: members.map(m => m.id), // default: all members selected
    exactAmounts: {},
    percentages: {},
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Parse amount in paise for live feedback preview
  const enteredPaise = parseRupeesToPaise(form.amountRupees) || 0;

  // Handle equal member checkbox toggle
  const toggleEqualMember = (memberId: string) => {
    setForm(prev => {
      const isSelected = prev.equalMembers.includes(memberId);
      const updated = isSelected
        ? prev.equalMembers.filter(id => id !== memberId)
        : [...prev.equalMembers, memberId];

      const nextState = { ...prev, equalMembers: updated };
      if (hasAttemptedSubmit) {
        const valRes = validateExpenseForm(nextState, members, todayYmd);
        setErrors(valRes.errors);
      }
      return nextState;
    });
  };

  // Toggle all members for equal split
  const toggleAllEqualMembers = () => {
    setForm(prev => {
      const allSelected = prev.equalMembers.length === members.length;
      const updated = allSelected ? [] : members.map(m => m.id);
      const nextState = { ...prev, equalMembers: updated };
      if (hasAttemptedSubmit) {
        const valRes = validateExpenseForm(nextState, members, todayYmd);
        setErrors(valRes.errors);
      }
      return nextState;
    });
  };

  // Handle exact amount change for a member
  const handleExactAmountChange = (memberId: string, value: string) => {
    setForm(prev => {
      const nextExact = { ...prev.exactAmounts, [memberId]: value };
      const nextState = { ...prev, exactAmounts: nextExact };
      if (hasAttemptedSubmit) {
        const valRes = validateExpenseForm(nextState, members, todayYmd);
        setErrors(valRes.errors);
      }
      return nextState;
    });
  };

  // Handle percentage change for a member
  const handlePercentChange = (memberId: string, value: string) => {
    setForm(prev => {
      const nextPercentages = { ...prev.percentages, [memberId]: value };
      const nextState = { ...prev, percentages: nextPercentages };
      if (hasAttemptedSubmit) {
        const valRes = validateExpenseForm(nextState, members, todayYmd);
        setErrors(valRes.errors);
      }
      return nextState;
    });
  };

  // Form submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    const result = validateExpenseForm(form, members, todayYmd);

    if (!result.isValid || !result.parsedAmountPaise || !result.finalSplit) {
      setErrors(result.errors);
      return;
    }

    const newExpense: Expense = {
      id: `e_${Date.now()}`,
      description: form.description.trim(),
      amount: result.parsedAmountPaise,
      paidBy: form.paidBy,
      date: form.date,
      category: form.category as ExpenseCategory,
      split: result.finalSplit,
    };

    dispatch(addExpense(newExpense));
    navigate('/');
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back button & Title */}
      <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-purple-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Expenses</span>
        </button>

        <span className="text-xs font-mono font-bold text-fuchsia-400 tracking-wider uppercase px-2.5 py-1 rounded-full bg-purple-900/60 border border-purple-500/30">
          Track • Split • Travel
        </span>
      </div>

      <div className="glass-purple-card rounded-3xl p-6 sm:p-8 space-y-6 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        {/* Ambient lighting orb */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="mb-2 relative z-10">
          <div className="flex items-center gap-2 text-xs font-mono text-fuchsia-400 font-bold mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>TravelTally Expense Logger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Add an expense
          </h1>
          <p className="text-sm text-purple-200/80 mt-1">
            Specify payment details and customize how the expense is divided among trip friends.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-6 relative z-10">
          {/* Description */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="expense-description" className="block text-sm font-bold text-white">
                Description <span className="text-rose-400">*</span>
              </label>
              <span className="text-xs text-purple-400 font-mono">
                {form.description.length}/60
              </span>
            </div>
            <input
              id="expense-description"
              type="text"
              maxLength={60}
              placeholder="e.g., Beach shack dinner, Scuba diving, Villa rental"
              value={form.description}
              onChange={e => {
                const nextDesc = e.target.value;
                setForm(prev => ({ ...prev, description: nextDesc }));
                if (hasAttemptedSubmit) {
                  const valRes = validateExpenseForm({ ...form, description: nextDesc }, members, todayYmd);
                  setErrors(valRes.errors);
                }
              }}
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'desc-error' : undefined}
              className={`w-full px-4 py-3 rounded-2xl border text-sm text-white placeholder:text-purple-400/50 bg-purple-950/60 transition-all focus:outline-none focus:ring-2 ${
                errors.description
                  ? 'border-rose-400/80 bg-rose-950/30 focus:ring-rose-500'
                  : 'border-purple-500/30 focus:border-purple-400 focus:ring-purple-500/30'
              }`}
            />
            {errors.description && (
              <p id="desc-error" role="alert" className="text-xs font-semibold text-rose-400 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          {/* Amount & Paid By Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Amount */}
            <div className="space-y-1.5">
              <label htmlFor="expense-amount" className="block text-sm font-bold text-white">
                Amount (₹) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 font-semibold text-sm">
                  ₹
                </span>
                <input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max="1000000"
                  placeholder="0.00"
                  value={form.amountRupees}
                  onChange={e => {
                    const nextAmt = e.target.value;
                    setForm(prev => ({ ...prev, amountRupees: nextAmt }));
                    if (hasAttemptedSubmit) {
                      const valRes = validateExpenseForm({ ...form, amountRupees: nextAmt }, members, todayYmd);
                      setErrors(valRes.errors);
                    }
                  }}
                  aria-invalid={!!errors.amount}
                  aria-describedby={errors.amount ? 'amount-error' : undefined}
                  className={`w-full pl-8 pr-4 py-3 rounded-2xl border text-sm text-white placeholder:text-purple-400/50 bg-purple-950/60 transition-all focus:outline-none focus:ring-2 ${
                    errors.amount
                      ? 'border-rose-400/80 bg-rose-950/30 focus:ring-rose-500'
                      : 'border-purple-500/30 focus:border-purple-400 focus:ring-purple-500/30'
                  }`}
                />
              </div>
              {errors.amount && (
                <p id="amount-error" role="alert" className="text-xs font-semibold text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.amount}</span>
                </p>
              )}
            </div>

            {/* Paid By */}
            <div className="space-y-1.5">
              <label htmlFor="expense-paid-by" className="block text-sm font-bold text-white">
                Paid by <span className="text-rose-400">*</span>
              </label>
              <select
                id="expense-paid-by"
                value={form.paidBy}
                onChange={e => {
                  const nextPayer = e.target.value;
                  setForm(prev => ({ ...prev, paidBy: nextPayer }));
                  if (hasAttemptedSubmit) {
                    const valRes = validateExpenseForm({ ...form, paidBy: nextPayer }, members, todayYmd);
                    setErrors(valRes.errors);
                  }
                }}
                aria-invalid={!!errors.paidBy}
                aria-describedby={errors.paidBy ? 'paidby-error' : undefined}
                className={`w-full px-4 py-3 rounded-2xl border text-sm text-white bg-purple-950/80 transition-all focus:outline-none focus:ring-2 ${
                  errors.paidBy
                    ? 'border-rose-400/80 bg-rose-950/30 focus:ring-rose-500'
                    : 'border-purple-500/30 focus:border-purple-400 focus:ring-purple-500/30'
                }`}
              >
                {members.map(m => (
                  <option key={m.id} value={m.id} className="bg-purple-950 text-white">
                    {m.name}
                  </option>
                ))}
              </select>
              {errors.paidBy && (
                <p id="paidby-error" role="alert" className="text-xs font-semibold text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.paidBy}</span>
                </p>
              )}
            </div>
          </div>

          {/* Date & Category Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Date */}
            <div className="space-y-1.5">
              <label htmlFor="expense-date" className="block text-sm font-bold text-white">
                Date <span className="text-rose-400">*</span>
              </label>
              <input
                id="expense-date"
                type="date"
                max={todayYmd}
                value={form.date}
                onChange={e => {
                  const nextDate = e.target.value;
                  setForm(prev => ({ ...prev, date: nextDate }));
                  if (hasAttemptedSubmit) {
                    const valRes = validateExpenseForm({ ...form, date: nextDate }, members, todayYmd);
                    setErrors(valRes.errors);
                  }
                }}
                aria-invalid={!!errors.date}
                aria-describedby={errors.date ? 'date-error' : undefined}
                className={`w-full px-4 py-3 rounded-2xl border text-sm text-white bg-purple-950/80 transition-all focus:outline-none focus:ring-2 ${
                  errors.date
                    ? 'border-rose-400/80 bg-rose-950/30 focus:ring-rose-500'
                    : 'border-purple-500/30 focus:border-purple-400 focus:ring-purple-500/30'
                }`}
              />
              {errors.date && (
                <p id="date-error" role="alert" className="text-xs font-semibold text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.date}</span>
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label htmlFor="expense-category" className="block text-sm font-bold text-white">
                Category <span className="text-rose-400">*</span>
              </label>
              <select
                id="expense-category"
                value={form.category}
                onChange={e => {
                  const nextCat = e.target.value as ExpenseCategory;
                  setForm(prev => ({ ...prev, category: nextCat }));
                  if (hasAttemptedSubmit) {
                    const valRes = validateExpenseForm({ ...form, category: nextCat }, members, todayYmd);
                    setErrors(valRes.errors);
                  }
                }}
                aria-invalid={!!errors.category}
                aria-describedby={errors.category ? 'cat-error' : undefined}
                className={`w-full px-4 py-3 rounded-2xl border text-sm text-white bg-purple-950/80 transition-all focus:outline-none focus:ring-2 ${
                  errors.category
                    ? 'border-rose-400/80 bg-rose-950/30 focus:ring-rose-500'
                    : 'border-purple-500/30 focus:border-purple-400 focus:ring-purple-500/30'
                }`}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-purple-950 text-white">
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p id="cat-error" role="alert" className="text-xs font-semibold text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{errors.category}</span>
                </p>
              )}
            </div>
          </div>

          {/* Split Type Selector */}
          <div className="space-y-4 pt-3 border-t border-purple-500/20">
            <div>
              <span className="block text-sm font-bold text-white">
                Split Strategy <span className="text-rose-400">*</span>
              </span>
              <p className="text-xs text-purple-300 mt-0.5">
                Choose how the expense will be apportioned across friends
              </p>
            </div>

            {/* Split Type Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1.5 bg-purple-950/80 rounded-2xl border border-purple-500/20" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={form.splitType === 'equal'}
                onClick={() => {
                  setForm(prev => ({ ...prev, splitType: 'equal' }));
                  setErrors(prev => ({ ...prev, split: undefined, splitDetails: undefined }));
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  form.splitType === 'equal'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/60 border border-purple-400/40'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Equally</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={form.splitType === 'exact'}
                onClick={() => {
                  setForm(prev => ({ ...prev, splitType: 'exact' }));
                  setErrors(prev => ({ ...prev, split: undefined, splitDetails: undefined }));
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  form.splitType === 'exact'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/60 border border-purple-400/40'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Exact (₹)</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={form.splitType === 'percent'}
                onClick={() => {
                  setForm(prev => ({ ...prev, splitType: 'percent' }));
                  setErrors(prev => ({ ...prev, split: undefined, splitDetails: undefined }));
                }}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
                  form.splitType === 'percent'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-950/60 border border-purple-400/40'
                    : 'text-purple-300 hover:text-white'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>Percentages (%)</span>
              </button>
            </div>

            {/* Global Split Error Message */}
            {errors.split && (
              <div 
                role="alert" 
                className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs font-semibold text-rose-300 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errors.split}</span>
              </div>
            )}

            {/* Split Type 1: Equally */}
            {form.splitType === 'equal' && (
              <div className="bg-purple-950/50 p-4 rounded-2xl border border-purple-500/25 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                    Select Participants ({form.equalMembers.length}/{members.length})
                  </span>
                  <button
                    type="button"
                    onClick={toggleAllEqualMembers}
                    className="text-xs font-semibold text-fuchsia-400 hover:text-fuchsia-300"
                  >
                    {form.equalMembers.length === members.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {members.map(member => {
                    const isChecked = form.equalMembers.includes(member.id);
                    return (
                      <label
                        key={member.id}
                        className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-purple-900/60 border-purple-400/50 text-white shadow-xs'
                            : 'bg-purple-950/30 border-purple-500/20 text-purple-300 hover:bg-purple-900/30'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleEqualMember(member.id)}
                            className="w-4 h-4 text-purple-600 rounded border-purple-400/40 bg-purple-950 focus:ring-purple-500"
                          />
                          <span>{member.name}</span>
                        </div>
                        {isChecked && enteredPaise > 0 && form.equalMembers.length > 0 && (
                          <span className="text-xs font-mono font-bold text-fuchsia-400">
                            {formatPaiseToRupees(Math.round(enteredPaise / form.equalMembers.length))}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Split Type 2: Exact Amounts */}
            {form.splitType === 'exact' && (
              <div className="bg-purple-950/50 p-4 rounded-2xl border border-purple-500/25 space-y-3">
                <div className="flex items-center justify-between text-xs text-purple-300">
                  <span className="font-bold uppercase tracking-wider">
                    Enter Amount for Each Friend
                  </span>
                  <span className="font-medium">
                    Total to assign: <strong className="text-white font-mono">{formatPaiseToRupees(enteredPaise)}</strong>
                  </span>
                </div>

                <div className="space-y-2.5">
                  {members.map(member => {
                    const fieldError = errors.splitDetails?.[member.id];
                    return (
                      <div key={member.id} className="flex items-center gap-3">
                        <label htmlFor={`exact-${member.id}`} className="w-24 text-sm font-semibold text-white shrink-0">
                          {member.name}
                        </label>
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 font-semibold text-xs">
                            ₹
                          </span>
                          <input
                            id={`exact-${member.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={form.exactAmounts[member.id] || ''}
                            onChange={e => handleExactAmountChange(member.id, e.target.value)}
                            className={`w-full pl-7 pr-3 py-2 rounded-xl border text-sm text-white bg-purple-950/80 transition-colors focus:outline-none focus:ring-2 ${
                              fieldError
                                ? 'border-rose-400/80 focus:ring-rose-500'
                                : 'border-purple-500/30 focus:border-purple-400 focus:ring-purple-500/30'
                            }`}
                          />
                        </div>
                        {fieldError && (
                          <span className="text-xs font-semibold text-rose-400 shrink-0">
                            {fieldError}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Split Type 3: Percentages */}
            {form.splitType === 'percent' && (
              <div className="bg-purple-950/50 p-4 rounded-2xl border border-purple-500/25 space-y-3">
                <div className="flex items-center justify-between text-xs text-purple-300">
                  <span className="font-bold uppercase tracking-wider">
                    Enter Percentage for Each Friend
                  </span>
                  <span className="font-medium">
                    Target sum: <strong className="text-white font-mono">100.00%</strong>
                  </span>
                </div>

                <div className="space-y-2.5">
                  {members.map(member => {
                    const fieldError = errors.splitDetails?.[member.id];
                    return (
                      <div key={member.id} className="flex items-center gap-3">
                        <label htmlFor={`percent-${member.id}`} className="w-24 text-sm font-semibold text-white shrink-0">
                          {member.name}
                        </label>
                        <div className="relative flex-1">
                          <input
                            id={`percent-${member.id}`}
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="0.00"
                            value={form.percentages[member.id] || ''}
                            onChange={e => handlePercentChange(member.id, e.target.value)}
                            className={`w-full pl-3 pr-8 py-2 rounded-xl border text-sm text-white bg-purple-950/80 transition-colors focus:outline-none focus:ring-2 ${
                              fieldError
                                ? 'border-rose-400/80 focus:ring-rose-500'
                                : 'border-purple-500/30 focus:border-purple-400 focus:ring-purple-500/30'
                            }`}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 font-semibold text-xs">
                            %
                          </span>
                        </div>
                        {fieldError && (
                          <span className="text-xs font-semibold text-rose-400 shrink-0">
                            {fieldError}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions: Save & Cancel */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-purple-500/20">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-purple-300 hover:text-white hover:bg-purple-900/50 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold neon-btn text-white shadow-xl transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Save expense</span>
            </button>
          </div>
        </form>
      </div>

      {/* Helpful Hint Callout */}
      <div className="p-4 bg-purple-950/50 rounded-2xl border border-purple-500/20 flex items-start gap-3 text-xs text-purple-300">
        <HelpCircle className="w-4 h-4 text-fuchsia-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Zero-loss paisa guarantee:</span> Even when amounts cannot be divided cleanly by 3, splitting uses deterministic remainder distribution so every paisa is accounted for, and all group balances sum to exactly ₹0.00.
        </div>
      </div>
    </main>
  );
};
