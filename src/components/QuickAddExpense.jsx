import React, { useState } from 'react';
import { X, CheckCircle2, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { DEFAULT_CATEGORIES, formatDateReadable, formatLocalYMD, calculatePiggyBankSavings, calculateBudgetStats } from '../utils/storage';
import CustomDropdown from './CustomDropdown';
import InteractiveCalendar from './InteractiveCalendar';

export default function QuickAddExpense({ categories = DEFAULT_CATEGORIES, onAddExpense, isOpen, onClose, budgetData }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'chai_snacks');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(formatLocalYMD(new Date()));
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
    setDate(formatLocalYMD(new Date()));
    setSpendSource('allowance');
    setShowDatePicker(false);
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" style={{ alignItems: 'flex-end', padding: 0 }} onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '480px', 
          width: '100%', 
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          padding: '20px 18px',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px' }}>📝</span>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              New Expense
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            style={{ 
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)'
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmitCustom}>
          {/* Spend Source Selector */}
          <div style={{ marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Deduct Funds From
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <button
                type="button"
                onClick={() => setSpendSource('allowance')}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: spendSource === 'allowance' ? '1px solid var(--text-primary)' : '1px solid var(--border-medium)',
                  background: spendSource === 'allowance' ? 'var(--notion-gray-bg)' : 'transparent',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>👛 Pocket Money</span>
                <span className="notion-tag notion-tag-gray" style={{ fontSize: '10px' }}>
                  {currencySymbol}{availableAllowanceCash}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setSpendSource('piggy_bank')}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: spendSource === 'piggy_bank' ? '1px solid var(--notion-green-text)' : '1px solid var(--border-medium)',
                  background: spendSource === 'piggy_bank' ? 'var(--notion-green-bg)' : 'transparent',
                  color: spendSource === 'piggy_bank' ? 'var(--notion-green-text)' : 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>🐷 Piggy Bank</span>
                <span className="notion-tag notion-tag-green" style={{ fontSize: '10px' }}>
                  {currencySymbol}{availablePiggyBalance}
                </span>
              </button>
            </div>

            {/* Validation alerts */}
            {isPiggyInsufficient && (
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--notion-red-text)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
                ⚠️ Insufficient Piggy Bank balance (Max {currencySymbol}{availablePiggyBalance})
              </span>
            )}
            {isAllowanceInsufficient && (
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--notion-red-text)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
                ⚠️ Insufficient Pocket Money balance (Max {currencySymbol}{availableAllowanceCash})
              </span>
            )}
            {isAllowanceOverDailySafe && (
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--notion-orange-text)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
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
                fontWeight: 700,
                color: 'var(--notion-red-text)',
                marginRight: '10px',
                userSelect: 'none',
                flexShrink: 0
              }}>
                {currencySymbol}
              </span>
              <input
                type="number"
                inputMode="decimal"
                pattern="[0-9]*"
                step="1"
                required
                placeholder="0"
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  fontSize: '22px',
                  fontWeight: 700,
                  color: 'var(--notion-red-text)',
                  outline: 'none',
                  padding: 0,
                  width: '100%'
                }}
                value={amount}
                onChange={e => setAmount(e.target.value)}
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
              inputMode="text"
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
                border: showDatePicker ? '1px solid var(--border-medium)' : 'none',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={16} color="var(--text-secondary)" />
                <span>{formatDateReadable(date)}</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
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
              boxShadow: 'none',
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
