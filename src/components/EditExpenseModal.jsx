import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Calendar as CalendarIcon, Trash2, Zap, PiggyBank, Shield } from 'lucide-react';
import { DEFAULT_CATEGORIES, formatDateReadable, formatLocalYMD } from '../utils/storage';
import InteractiveCalendar from './InteractiveCalendar';

export default function EditExpenseModal({ 
  isOpen, 
  onClose, 
  transaction, 
  categories = DEFAULT_CATEGORIES, 
  onSaveEdit, 
  onDeleteTransaction, 
  currencySymbol = '₹' 
}) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('other');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [spendSource, setSpendSource] = useState('allowance');
  const [topupTarget, setTopupTarget] = useState('allowance');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const isTopup = transaction?.type === 'topup';

  useEffect(() => {
    if (transaction) {
      setAmount(String(transaction.amount || ''));
      setCategory(transaction.category || categories[0]?.id || 'other');
      setNote(transaction.note || '');
      setDate(transaction.date || formatLocalYMD(new Date()));
      setSpendSource(transaction.spendSource || 'allowance');
      setTopupTarget(transaction.topupTarget || 'allowance');
      setShowDatePicker(false);
    }
  }, [transaction, categories]);

  if (!isOpen || !transaction) return null;

  const handleDateSelect = (dateStr) => {
    if (dateStr) {
      setDate(dateStr);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    if (isTopup) {
      onSaveEdit({
        ...transaction,
        amount: Number(amount),
        category: 'income',
        note: note.trim() || 'Top-up / Extra Money',
        date,
        topupTarget
      });
    } else {
      onSaveEdit({
        ...transaction,
        amount: Number(amount),
        category,
        note: note.trim() || categories.find(c => c.id === category)?.name || 'Expense',
        date,
        spendSource
      });
    }

    onClose();
  };

  const handleDelete = () => {
    if (transaction?.id) {
      onDeleteTransaction(transaction.id);
      onClose();
    }
  };

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
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px' }}>{isTopup ? '💵' : '✏️'}</span>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {isTopup ? 'Edit Added Money' : 'Edit Expense'}
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

        <form onSubmit={handleSubmit}>
          {/* Amount Input */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">{isTopup ? 'Received Amount' : 'Amount'} ({currencySymbol})</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                fontSize: '18px',
                fontWeight: 700,
                color: isTopup ? 'var(--notion-green-text)' : 'var(--text-primary)',
                pointerEvents: 'none'
              }}>
                {isTopup ? `+${currencySymbol}` : currencySymbol}
              </span>
              <input
                type="number"
                inputMode="decimal"
                pattern="[0-9]*"
                step="any"
                required
                placeholder="0"
                className="form-input"
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  paddingLeft: isTopup ? '38px' : '32px',
                  height: '48px',
                  color: isTopup ? 'var(--notion-green-text)' : 'var(--text-primary)'
                }}
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* If Expense: Spend Source & Category */}
          {!isTopup && (
            <>
              {/* Spend Source Toggle */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Deduct From</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSpendSource('allowance')}
                    className="btn"
                    style={{
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      border: spendSource === 'allowance' ? '2px solid var(--text-primary)' : '1px solid var(--border-medium)',
                      background: spendSource === 'allowance' ? 'var(--bg-card-subtle)' : 'transparent',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    👛 Pocket Money
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpendSource('piggy_bank')}
                    className="btn"
                    style={{
                      padding: '8px 10px',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: 'var(--radius-sm)',
                      border: spendSource === 'piggy_bank' ? '2px solid var(--text-primary)' : '1px solid var(--border-medium)',
                      background: spendSource === 'piggy_bank' ? 'var(--bg-card-subtle)' : 'transparent',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    🐷 Piggy Bank
                  </button>
                </div>
              </div>

              {/* Category Picker */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Category</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                  maxHeight: '140px',
                  overflowY: 'auto',
                  padding: '2px'
                }}>
                  {categories.map(cat => {
                    const isSelected = category === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '7px 8px',
                          borderRadius: 'var(--radius-sm)',
                          background: isSelected ? 'var(--text-primary)' : 'var(--bg-card-subtle)',
                          color: isSelected ? 'var(--bg-app)' : 'var(--text-primary)',
                          border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          textAlign: 'left',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        <span>{cat.icon}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* If Top-up: Destination Selector */}
          {isTopup && (
            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-label">Allocated To</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '6px' }}>
                <button
                  type="button"
                  onClick={() => setTopupTarget('allowance')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: topupTarget === 'allowance' ? '1.5px solid var(--notion-green-text)' : '1px solid var(--border-subtle)',
                    background: topupTarget === 'allowance' ? 'var(--notion-green-bg)' : 'var(--bg-card-subtle)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Zap size={14} color="var(--notion-green-text)" /> Daily Budget Boost
                  </span>
                  {topupTarget === 'allowance' && <CheckCircle2 size={14} color="var(--notion-green-text)" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTopupTarget('piggy_bank')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: topupTarget === 'piggy_bank' ? '1.5px solid var(--notion-green-text)' : '1px solid var(--border-subtle)',
                    background: topupTarget === 'piggy_bank' ? 'var(--notion-green-bg)' : 'var(--bg-card-subtle)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <PiggyBank size={14} color="var(--notion-green-text)" /> Piggy Bank Vault
                  </span>
                  {topupTarget === 'piggy_bank' && <CheckCircle2 size={14} color="var(--notion-green-text)" />}
                </button>

                <button
                  type="button"
                  onClick={() => setTopupTarget('emergency')}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: topupTarget === 'emergency' ? '1.5px solid var(--notion-green-text)' : '1px solid var(--border-subtle)',
                    background: topupTarget === 'emergency' ? 'var(--notion-green-bg)' : 'var(--bg-card-subtle)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Shield size={14} color="var(--notion-green-text)" /> Emergency Reserve
                  </span>
                  {topupTarget === 'emergency' && <CheckCircle2 size={14} color="var(--notion-green-text)" />}
                </button>
              </div>
            </div>
          )}

          {/* Description / Note */}
          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="form-label">{isTopup ? 'Sender / Note' : 'Description / Note'}</label>
            <input
              type="text"
              inputMode="text"
              placeholder={isTopup ? 'e.g. Money from Papa' : 'e.g. Swiggy lunch, Tea & Samosa'}
              className="form-input"
              style={{ fontSize: '13px' }}
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {/* Date Picker Button */}
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Date</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="btn btn-secondary"
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  fontSize: '12px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'left'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CalendarIcon size={14} color="var(--text-secondary)" />
                  {formatDateReadable(date)}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Change</span>
              </button>
            </div>

            {showDatePicker && (
              <div style={{ marginTop: '10px' }}>
                <InteractiveCalendar
                  selectedDate={date}
                  onSelectDate={handleDateSelect}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ marginTop: '18px' }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '11px',
                fontSize: '13px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: isTopup ? 'var(--notion-green-text)' : undefined,
                borderColor: isTopup ? 'var(--notion-green-text)' : undefined,
                color: isTopup ? '#ffffff' : undefined
              }}
            >
              <CheckCircle2 size={16} /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
