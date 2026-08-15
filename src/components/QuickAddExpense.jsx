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

  const numAmt = Number(amount || 0);
  const hasEnteredAmount = numAmt > 0;

  const isPiggyInsufficient = spendSource === 'piggy_bank' && hasEnteredAmount && numAmt > availablePiggyBalance;
  const isAllowanceInsufficient = spendSource === 'allowance' && hasEnteredAmount && numAmt > availableAllowanceCash;
  const isAllowanceOverDailySafe = spendSource === 'allowance' && hasEnteredAmount && !isAllowanceInsufficient && numAmt > todaysSafe && todaysSafe > 0;
  const isInsufficient = spendSource === 'piggy_bank' ? isPiggyInsufficient : isAllowanceInsufficient;

  const currencySymbol = budgetData?.currency?.symbol || '₹';

  const handleSubmitCustom = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    if (isInsufficient) {
      const maxVal = spendSource === 'piggy_bank' ? availablePiggyBalance : availableAllowanceCash;
      alert(`Insufficient balance! Max available: ${currencySymbol}${maxVal}`);
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
    setDate(new Date().toISOString().substring(0, 10));
    setSpendSource('allowance');
    setShowDatePicker(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ alignItems: 'flex-end', padding: 0 }}>
      <div 
        className="modal-content" 
        style={{ 
          maxWidth: '500px', 
          width: '100%', 
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
          padding: '24px 20px',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Add Daily Expense
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Record your spend seamlessly
            </p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="btn-icon" 
            style={{ 
              background: 'var(--bg-card-subtle)', 
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} color="var(--text-primary)" />
          </button>
        </div>

        <form onSubmit={handleSubmitCustom}>
          {/* Spend Source Selector */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Deduct Funds From
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setSpendSource('allowance')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: spendSource === 'allowance' ? '2px solid var(--ios-blue)' : '1px solid var(--border-medium)',
                  background: spendSource === 'allowance' ? 'var(--ios-blue-bg)' : 'var(--bg-card-subtle)',
                  color: spendSource === 'allowance' ? 'var(--ios-blue)' : 'var(--text-primary)',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>👛 Pocket Money</span>
                <span style={{ fontSize: '11px', opacity: 0.85, fontWeight: 700 }}>
                  ({currencySymbol}{availableAllowanceCash})
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSpendSource('piggy_bank')}
                style={{
                  padding: '10px 8px',
                  borderRadius: 'var(--radius-md)',
                  border: spendSource === 'piggy_bank' ? '2px solid var(--ios-green)' : '1px solid var(--border-medium)',
                  background: spendSource === 'piggy_bank' ? 'var(--ios-green-bg)' : 'var(--bg-card-subtle)',
                  color: spendSource === 'piggy_bank' ? 'var(--ios-green)' : 'var(--text-primary)',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>🐷 Piggy Vault</span>
                <span style={{ fontSize: '11px', opacity: 0.85, fontWeight: 700 }}>
                  ({currencySymbol}{availablePiggyBalance})
                </span>
              </button>
            </div>

            {/* Validation alerts */}
            {isPiggyInsufficient && (
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ios-red)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
                ⚠️ Insufficient Vault balance (Max {currencySymbol}{availablePiggyBalance})
              </span>
            )}
            {isAllowanceInsufficient && (
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ios-red)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
                ⚠️ Insufficient Pocket Money balance (Max {currencySymbol}{availableAllowanceCash})
              </span>
            )}
            {isAllowanceOverDailySafe && (
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--ios-orange)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
                ⚠️ Exceeds daily safe limit (Safe Today: {currencySymbol}{todaysSafe})
              </span>
            )}
          </div>
          
          {/* Hero Amount Input Box */}
          {/* Amount Input with Non-Overlapping Currency Prefix */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Amount
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-card-subtle)',
              border: '1.5px solid var(--border-medium)',
              borderRadius: 'var(--radius-md)',
              padding: '0 14px',
              height: '52px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--ios-red)',
                marginRight: '10px',
                userSelect: 'none',
                flexShrink: 0
              }}>
                {currencySymbol}
              </span>
              <input
                type="number"
                step="1"
                required
                placeholder="0"
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: '22px',
                  fontWeight: 800,
                  color: 'var(--ios-red)',
                  outline: 'none',
                  padding: 0,
                  width: '100%'
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
