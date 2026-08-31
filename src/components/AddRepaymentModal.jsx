import React, { useState, useEffect } from 'react';
import { X, Check, ArrowDownLeft, ArrowUpRight, Calendar } from 'lucide-react';
import { formatLocalYMD, formatDateReadable } from '../utils/storage';
import InteractiveCalendar from './InteractiveCalendar';

export default function AddRepaymentModal({ isOpen, onClose, debt, currencySymbol = '₹', onAddRepayment }) {
  // ✅ ALL hooks MUST be before any conditional return (React Rules of Hooks)
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(formatLocalYMD(new Date()));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [note, setNote] = useState('');
  const [depositToPiggy, setDepositToPiggy] = useState(false);
  const [error, setError] = useState('');

  const remaining = (isOpen && debt)
    ? Math.max(0, Number(debt.remainingAmount ?? (debt.amount - (debt.settledAmount || 0))))
    : 0;

  useEffect(() => {
    if (isOpen && debt) {
      const rem = Math.max(0, Number(debt.remainingAmount ?? (debt.amount - (debt.settledAmount || 0))));
      setAmount(String(rem || ''));
      setDate(formatLocalYMD(new Date()));
      setShowDatePicker(false);
      setNote(debt.type === 'lent' ? 'Received via UPI/Cash' : 'Paid via UPI/Cash');
      setDepositToPiggy(debt.type === 'lent');
      setError('');
    }
  }, [isOpen, debt?.id]);

  // ✅ Conditional return AFTER all hooks
  if (!isOpen || !debt) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (numAmount > remaining + 0.01) {
      setError(`Amount cannot exceed remaining balance (${currencySymbol}${remaining})`);
      return;
    }

    onAddRepayment({
      debtId: debt.id,
      amount: numAmount,
      date: date || formatLocalYMD(new Date()),
      note: note.trim() || (debt.type === 'lent' ? 'Repayment received' : 'Repayment made'),
      depositToPiggy: debt.type === 'lent' ? depositToPiggy : false
    });

    onClose();
  };

  return (
    <div className="modal-overlay" style={{ alignItems: 'flex-end', padding: 0, zIndex: 1000 }} onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: '480px', 
          width: '100%', 
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          padding: '20px 18px 24px',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-full)',
              background: debt.type === 'lent' ? 'var(--ios-green-bg)' : 'var(--ios-red-bg)',
              color: debt.type === 'lent' ? 'var(--ios-green)' : 'var(--ios-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {debt.type === 'lent' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                {debt.type === 'lent' ? 'Record Money Received' : 'Record Payment Made'}
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>
                {debt.personName} • Remaining: <strong style={{ color: 'var(--text-primary)' }}>{currencySymbol}{remaining}</strong>
              </p>
            </div>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div style={{
              padding: '8px 12px',
              background: 'var(--ios-red-bg)',
              color: 'var(--ios-red)',
              borderRadius: 'var(--radius-md)',
              fontSize: '12px',
              fontWeight: 500
            }}>
              {error}
            </div>
          )}

          {/* Amount Field */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Amount Returning ({currencySymbol})
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="number"
                step="any"
                inputMode="decimal"
                value={amount}
                onChange={e => { setAmount(e.target.value); setError(''); }}
                placeholder="0"
                style={{
                  width: '100%',
                  fontSize: '22px',
                  fontWeight: 700,
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            {/* Quick Amount Chips */}
            <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setAmount(String(remaining))}
                style={{
                  fontSize: '11px',
                  padding: '4px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: amount === String(remaining) ? 'var(--ios-blue-bg)' : 'var(--bg-card-subtle)',
                  color: amount === String(remaining) ? 'var(--ios-blue)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Full: {currencySymbol}{remaining}
              </button>
              {remaining > 10 && (
                <button
                  type="button"
                  onClick={() => setAmount(String(Math.round(remaining / 2)))}
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-card-subtle)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontWeight: 500
                  }}
                >
                  Half: {currencySymbol}{Math.round(remaining / 2)}
                </button>
              )}
            </div>
          </div>

          {/* Date Field */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Date
            </label>
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                background: 'var(--bg-input)',
                border: showDatePicker ? '1px solid var(--border-medium)' : '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                boxSizing: 'border-box'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={15} color="var(--text-secondary)" />
                <span>{formatDateReadable(date)}</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                {showDatePicker ? 'Close' : 'Change'}
              </span>
            </button>

            {showDatePicker && (
              <div style={{ marginTop: '8px', animation: 'fadeIn 0.15s ease-out' }}>
                <InteractiveCalendar
                  selectedDate={date}
                  onSelectDate={(d) => {
                    if (d) setDate(d);
                  }}
                />
              </div>
            )}
          </div>

          {/* Note / Payment Mode Field */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Note / Method
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="e.g. GPay, Cash, Bank Transfer"
              style={{
                width: '100%',
                fontSize: '13px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-input)',
                color: 'var(--text-primary)',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Optional: Deposit directly into Piggy Bank Vault for Lent money */}
          {debt.type === 'lent' && (
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer',
              fontSize: '12px',
              color: 'var(--text-primary)'
            }}>
              <input
                type="checkbox"
                checked={depositToPiggy}
                onChange={e => setDepositToPiggy(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--ios-blue)' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🐷</span>
                <div>
                  <span style={{ fontWeight: 600 }}>Save in Piggy Bank Vault</span>
                  <p style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', margin: 0 }}>
                    Add this returned money to your lifetime savings vault
                  </p>
                </div>
              </div>
            </label>
          )}

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '10px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Check size={16} /> Save Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
