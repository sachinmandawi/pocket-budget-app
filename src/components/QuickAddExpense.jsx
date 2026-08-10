import React, { useState } from 'react';
import { X, CheckCircle2, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { DEFAULT_CATEGORIES, formatDateReadable, calculatePiggyBankSavings, calculateBudgetStats } from '../utils/storage';
import CustomDropdown from './CustomDropdown';
import InteractiveCalendar from './InteractiveCalendar';

export default function QuickAddExpense({ categories = DEFAULT_CATEGORIES, onAddExpense, isOpen, onClose, budgetData }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'chai_snacks');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [spendSource, setSpendSource] = useState('allowance');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const stats = calculateBudgetStats(budgetData);
  const { totalSaved: availablePiggyBalance } = calculatePiggyBankSavings(budgetData);

  const availableAllowanceCash = Math.max(0, stats.remainingTotalInHand || 0);
  const todaysSafe = Math.max(0, stats.todaysSafeRemaining || 0);

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
    icon: cat.icon
  }));

  const handleDateSelectFromCalendar = (dateStr) => {
    if (dateStr) {
      setDate(dateStr);
      setShowDatePicker(false);
    }
  };

  const isPiggyInsufficient = spendSource === 'piggy_bank' && Number(amount || 0) > availablePiggyBalance;
  const isAllowanceInsufficient = spendSource === 'allowance' && (Number(amount || 0) > availableAllowanceCash || availableAllowanceCash <= 0);
  const isAllowanceOverDailySafe = spendSource === 'allowance' && !isAllowanceInsufficient && Number(amount || 0) > todaysSafe && todaysSafe > 0;
  const isInsufficient = spendSource === 'piggy_bank' ? isPiggyInsufficient : isAllowanceInsufficient;

  const handleSubmitCustom = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    if (isInsufficient) {
      const maxVal = spendSource === 'piggy_bank' ? availablePiggyBalance : availableAllowanceCash;
      alert(`Insufficient balance! Max available: ₹${maxVal}`);
      return;
    }

    onAddExpense({
      amount: Number(amount),
      category,
      note: note || categories.find(c => c.id === category)?.name || 'Expense',
      date,
      spendSource,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setAmount('');
    setNote('');
    setSpendSource('allowance');
    setShowDatePicker(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ paddingBottom: '24px' }}>
        <div className="modal-grab-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
            Log Expense
          </h3>
          <button 
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ width: '32px', height: '32px', padding: 0, borderRadius: '50%' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmitCustom}>
          {/* Spend Source Selector (Main Allowance vs Piggy Bank Vault) */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Deduct From (Spend Source)
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSpendSource('allowance')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: spendSource === 'allowance' ? '2px solid var(--ios-blue)' : '1px solid var(--border-subtle)',
                  background: spendSource === 'allowance' ? 'var(--ios-blue-bg)' : 'var(--bg-card-subtle)',
                  color: spendSource === 'allowance' ? 'var(--ios-blue)' : 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                👛 Main Allowance
              </button>

              <button
                type="button"
                onClick={() => setSpendSource('piggy_bank')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: spendSource === 'piggy_bank' ? '2px solid var(--ios-green)' : '1px solid var(--border-subtle)',
                  background: spendSource === 'piggy_bank' ? 'var(--ios-green-bg)' : 'var(--bg-card-subtle)',
                  color: spendSource === 'piggy_bank' ? 'var(--ios-green)' : 'var(--text-secondary)',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                🐷 Piggy Bank
              </button>
            </div>

            {/* Small Compact Warnings for Insufficient Balance / Daily Over Limit */}
            {isPiggyInsufficient && (
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ios-red)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
                ⚠️ Insufficient Vault balance (Max ₹{availablePiggyBalance})
              </span>
            )}
            {isAllowanceInsufficient && (
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ios-red)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
                ⚠️ Insufficient Allowance balance (Max ₹{availableAllowanceCash})
              </span>
            )}
            {isAllowanceOverDailySafe && (
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ios-orange)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
                ⚠️ Exceeds daily safe limit (Safe Today: ₹{todaysSafe})
              </span>
            )}
          </div>
          {/* Hero Amount Input Box */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Amount
            </span>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{
                position: 'absolute',
                left: '14px',
                fontSize: '20px',
                fontWeight: 800,
                color: 'var(--ios-red)'
              }}>
                ₹
              </span>
              <input
                type="number"
                step="1"
                required
                placeholder="0"
                className="form-input"
                style={{
                  paddingLeft: '34px',
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--ios-red)',
                  height: '46px',
                  borderRadius: 'var(--radius-md)'
                }}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Category
            </span>
            <CustomDropdown
              options={categoryOptions}
              value={category}
              onChange={val => setCategory(val)}
            />
          </div>

          {/* Note Input */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Note / Details
            </span>
            <input
              type="text"
              placeholder="e.g. Chai & Snacks"
              className="form-input"
              style={{ fontSize: '14px', height: '44px' }}
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {/* Date Picker Button */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Transaction Date
            </span>
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--bg-input)',
                border: showDatePicker ? '1px solid var(--ios-blue)' : 'none',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={16} color="var(--ios-blue)" />
                <span>{formatDateReadable(date)}</span>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--ios-blue)', fontWeight: 700 }}>
                {showDatePicker ? 'Close' : 'Change Date'}
              </span>
            </button>

            {showDatePicker && (
              <div style={{ marginTop: '10px', animation: 'fadeIn 0.15s ease-out' }}>
                <InteractiveCalendar
                  selectedDate={date}
                  onSelectDate={handleDateSelectFromCalendar}
                />
              </div>
            )}
          </div>

          {/* Primary Save Button */}
          <button 
            type="submit" 
            disabled={isInsufficient}
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              padding: '10px 16px', 
              fontSize: '13px', 
              fontWeight: 700,
              boxShadow: isInsufficient ? 'none' : '0 3px 10px rgba(37, 99, 235, 0.25)',
              opacity: isInsufficient ? 0.5 : 1,
              cursor: isInsufficient ? 'not-allowed' : 'pointer'
            }}
          >
            <CheckCircle2 size={16} /> Save Expense
          </button>
        </form>
      </div>
    </div>
  );
}
