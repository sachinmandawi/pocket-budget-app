import React, { useState } from 'react';
import { X, CheckCircle2, Calendar as CalendarIcon } from 'lucide-react';
import { DEFAULT_CATEGORIES, formatDateReadable } from '../utils/storage';
import CustomDropdown from './CustomDropdown';
import InteractiveCalendar from './InteractiveCalendar';

export default function QuickAddExpense({ categories = DEFAULT_CATEGORIES, onAddExpense, isOpen, onClose }) {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'chai_snacks');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  const handleSubmitCustom = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    onAddExpense({
      amount: Number(amount),
      category,
      note: note || categories.find(c => c.id === category)?.name || 'Expense',
      date,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    setAmount('');
    setNote('');
    setShowDatePicker(false);
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-grab-handle" />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Log Expense
          </h3>
          <button 
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ width: '32px', height: '32px', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmitCustom}>
          <div className="form-group">
            <label className="form-label">Amount (₹)</label>
            <input
              type="number"
              step="1"
              required
              placeholder="0"
              className="form-input"
              style={{ fontSize: '32px', fontWeight: 800, color: 'var(--ios-red)' }}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <CustomDropdown
              options={categoryOptions}
              value={category}
              onChange={val => setCategory(val)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Note / Details</label>
            <input
              type="text"
              placeholder="e.g. Chai with friends"
              className="form-input"
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>

          {/* Custom Formatted Date Picker (Displays "10 Aug 2026") */}
          <div className="form-group">
            <label className="form-label">Date</label>
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '13px 16px',
                background: 'var(--bg-input)',
                border: showDatePicker ? '1px solid var(--ios-blue)' : 'none',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '15px',
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
              <div style={{ marginTop: '10px' }}>
                <InteractiveCalendar
                  selectedDate={date}
                  onSelectDate={handleDateSelectFromCalendar}
                />
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', marginTop: '10px' }}>
            <CheckCircle2 size={18} /> Save Expense
          </button>
        </form>
      </div>
    </div>
  );
}
