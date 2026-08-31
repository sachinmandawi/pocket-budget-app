import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  X, 
  Calendar, 
  Download, 
  Share2, 
  Check, 
  ChevronDown, 
  Filter, 
  Sparkles,
  Loader2
} from 'lucide-react';
import { formatDateReadable, formatLocalYMD, calculateBudgetStats } from '../utils/storage';
import { exportTransactionsToPdf } from '../utils/pdfExport';
import { formatCurrencyAmount } from '../utils/currencies';
import InteractiveCalendar from './InteractiveCalendar';

export default function ExportPdfModal({ isOpen, onClose, budgetData }) {
  const [rangeType, setRangeType] = useState('current_cycle'); // 'current_cycle' | 'this_month' | 'last_30_days' | 'all_time' | 'custom'
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatLocalYMD(d);
  });
  const [customEnd, setCustomEnd] = useState(() => formatLocalYMD(new Date()));
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all'); // 'all' | 'allowance' | 'piggy_bank'

  const [isGenerating, setIsGenerating] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const stats = useMemo(() => calculateBudgetStats(budgetData || {}), [budgetData]);
  const currencySymbol = budgetData?.currency?.symbol || '₹';
  const allTransactions = budgetData?.transactions || [];

  // Filter transactions based on options
  const { filteredTransactions, periodLabel } = useMemo(() => {
    const today = new Date();
    const todayStr = formatLocalYMD(today);

    let startStr = '';
    let endStr = '';
    let label = '';

    if (rangeType === 'current_cycle') {
      startStr = stats.cycleStartStr || '';
      endStr = stats.cycleEndStr || '';
      label = stats.cyclePeriodLabel || 'Current Cycle';
    } else if (rangeType === 'this_month') {
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const lastDay = new Date(y, today.getMonth() + 1, 0).getDate();
      startStr = `${y}-${m}-01`;
      endStr = `${y}-${m}-${String(lastDay).padStart(2, '0')}`;
      label = `${today.toLocaleString('default', { month: 'short' })} ${y}`;
    } else if (rangeType === 'last_30_days') {
      const past30 = new Date();
      past30.setDate(past30.getDate() - 30);
      startStr = formatLocalYMD(past30);
      endStr = todayStr;
      label = `${formatDateReadable(startStr)} – ${formatDateReadable(endStr)}`;
    } else if (rangeType === 'custom') {
      startStr = customStart;
      endStr = customEnd;
      label = `${formatDateReadable(startStr)} – ${formatDateReadable(endStr)}`;
    } else if (rangeType === 'all_time') {
      label = 'All Time Statement';
    }

    const filtered = allTransactions.filter(tx => {
      if (!tx) return false;
      const txDate = tx.date || tx.createdAt?.split('T')[0] || '';

      // Date filter
      if (rangeType !== 'all_time' && startStr && endStr) {
        if (txDate < startStr || txDate > endStr) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) return false;

      // Source filter
      if (selectedSource === 'allowance' && (tx.spendSource === 'piggy_bank' || tx.type === 'topup')) return false;
      if (selectedSource === 'piggy_bank' && tx.spendSource !== 'piggy_bank') return false;

      return true;
    });

    filtered.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    return { filteredTransactions: filtered, periodLabel: label };
  }, [allTransactions, rangeType, customStart, customEnd, selectedCategory, selectedSource, stats]);

  const totalExpenseSum = filteredTransactions
    .filter(t => t.type !== 'topup')
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const handleExport = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setExportSuccess(false);

    try {
      await exportTransactionsToPdf({
        transactions: filteredTransactions,
        stats,
        budgetData,
        dateRangeLabel: periodLabel,
        currencySymbol
      });
      setExportSuccess(true);
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Could not export PDF: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
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
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-xl)',
          padding: '20px 20px 28px'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--ios-blue-bg)',
              color: 'var(--ios-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Export PDF Statement
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
                Bank-style official financial statement
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="btn btn-secondary btn-sm"
            style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%' }}
          >
            <X size={15} />
          </button>
        </div>

        {/* 1. Date Range Presets */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Statement Period
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {[
              { id: 'current_cycle', label: 'Current Cycle', sub: stats.cyclePeriodLabel },
              { id: 'this_month', label: 'Calendar Month', sub: '1st to End of Month' },
              { id: 'last_30_days', label: 'Last 30 Days', sub: 'Recent 30 Days' },
              { id: 'all_time', label: 'All Time Ledger', sub: 'Complete History' }
            ].map(preset => (
              <button
                key={preset.id}
                type="button"
                onClick={() => setRangeType(preset.id)}
                style={{
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-md)',
                  background: rangeType === preset.id ? 'var(--text-primary)' : 'var(--bg-card-subtle)',
                  color: rangeType === preset.id ? 'var(--bg-app)' : 'var(--text-primary)',
                  border: rangeType === preset.id ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: rangeType === preset.id ? 700 : 600 }}>
                  {preset.label}
                </div>
                <div style={{ fontSize: '10px', opacity: rangeType === preset.id ? 0.8 : 0.6, marginTop: '2px' }}>
                  {preset.sub}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Custom Date Range Selection (if needed) */}
        {rangeType === 'custom' && (
          <div style={{ marginBottom: '14px', background: 'var(--bg-card-subtle)', padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>From</span>
                <button
                  type="button"
                  onClick={() => setShowStartCalendar(!showStartCalendar)}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', fontSize: '11.5px', justifyContent: 'space-between' }}
                >
                  <span>{formatDateReadable(customStart)}</span>
                  <Calendar size={12} />
                </button>
                {showStartCalendar && (
                  <div style={{ marginTop: '6px' }}>
                    <InteractiveCalendar
                      selectedDate={customStart}
                      onSelectDate={(d) => { if (d) setCustomStart(d); }}
                    />
                  </div>
                )}
              </div>

              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>To</span>
                <button
                  type="button"
                  onClick={() => setShowEndCalendar(!showEndCalendar)}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', fontSize: '11.5px', justifyContent: 'space-between' }}
                >
                  <span>{formatDateReadable(customEnd)}</span>
                  <Calendar size={12} />
                </button>
                {showEndCalendar && (
                  <div style={{ marginTop: '6px' }}>
                    <InteractiveCalendar
                      selectedDate={customEnd}
                      onSelectDate={(d) => { if (d) setCustomEnd(d); }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. Spend Source Filter */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Account / Spend Source
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
            {[
              { id: 'all', label: 'All Accounts', icon: '🏦' },
              { id: 'allowance', label: 'Pocket Money', icon: '👛' },
              { id: 'piggy_bank', label: 'Piggy Bank', icon: '🐷' }
            ].map(src => (
              <button
                key={src.id}
                type="button"
                onClick={() => setSelectedSource(src.id)}
                style={{
                  padding: '7px 8px',
                  borderRadius: 'var(--radius-md)',
                  background: selectedSource === src.id ? 'var(--text-primary)' : 'var(--bg-card-subtle)',
                  color: selectedSource === src.id ? 'var(--bg-app)' : 'var(--text-primary)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '11.5px',
                  fontWeight: selectedSource === src.id ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <span>{src.icon}</span>
                <span>{src.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Live Summary Preview Card */}
        <div style={{
          background: 'var(--bg-card-subtle)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          padding: '12px 14px',
          marginBottom: '18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block' }}>
              Statement Preview ({periodLabel})
            </span>
            <strong style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 700 }}>
              {filteredTransactions.length} {filteredTransactions.length === 1 ? 'Transaction' : 'Transactions'}
            </strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block' }}>
              Total Expenses
            </span>
            <strong style={{ fontSize: '15px', color: 'var(--notion-red-text)', fontWeight: 700 }}>
              {currencySymbol}{totalExpenseSum.toLocaleString()}
            </strong>
          </div>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={handleExport}
          disabled={isGenerating || filteredTransactions.length === 0}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '12px 16px',
            fontSize: '13.5px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            background: exportSuccess ? 'var(--ios-green)' : undefined
          }}
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="spin-animation" />
              <span>Generating Statement...</span>
            </>
          ) : exportSuccess ? (
            <>
              <Check size={16} />
              <span>PDF Generated Successfully!</span>
            </>
          ) : (
            <>
              <Share2 size={16} />
              <span>Generate & Share PDF Statement</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
