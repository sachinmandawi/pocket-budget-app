import React from 'react';
import { Plus, Calendar, ArrowUpRight, Sparkles, Wallet } from 'lucide-react';
import { formatCurrencyAmount } from '../utils/currencies';

export default function DailyGauge({ stats, onOpenQuickAdd, onNavigateToPage, onOpenSetPocket }) {
  const {
    todaysAllowedTotal,
    spentToday,
    todaysSafeRemaining,
    remainingTotalInHand,
    currentDayNumber,
    totalDaysInMonth,
    cyclePeriodLabel,
    totalTopupsThisMonth = 0
  } = stats;

  const isOverspentToday = todaysSafeRemaining < 0;
  const spentPercent = todaysAllowedTotal > 0 ? Math.min(100, Math.max(0, (spentToday / todaysAllowedTotal) * 100)) : 0;

  const currencySymbol = stats.currencySymbol || stats.currency?.symbol || '₹';

  return (
    <div className="notion-card" style={{ padding: '16px', marginBottom: '14px' }}>
      {/* Page Metadata / Status Row */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '6px', 
        marginBottom: '12px' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="notion-tag notion-tag-gray">
            Day {currentDayNumber}/{totalDaysInMonth}
          </span>
          {totalTopupsThisMonth > 0 && (
            <span className="notion-tag notion-tag-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px' }}>
              <ArrowUpRight size={10} /> +{formatCurrencyAmount(currencySymbol, totalTopupsThisMonth)} Added
            </span>
          )}
        </div>

        <span 
          className="notion-tag notion-tag-gray" 
          style={{ 
            color: 'var(--text-tertiary)',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            flexShrink: 0
          }}
        >
          <Calendar size={11} style={{ flexShrink: 0 }} /> 
          <span>{cyclePeriodLabel}</span>
        </span>
      </div>

      {/* Main Remaining Daily Budget Number */}
      <div style={{ padding: '8px 0 10px' }}>
        <span style={{ 
          fontSize: '11px', 
          color: 'var(--text-secondary)', 
          fontWeight: 600, 
          display: 'block',
          marginBottom: '2px'
        }}>
          {isOverspentToday ? "Today's Overspend" : "Today's Safe Daily Limit"}
        </span>
        <div style={{ 
          fontSize: '32px', 
          fontWeight: 700, 
          color: isOverspentToday ? 'var(--notion-red-text)' : 'var(--text-primary)', 
          letterSpacing: '-0.8px', 
          lineHeight: 1.1 
        }}>
          {isOverspentToday ? '-' : ''}{formatCurrencyAmount(currencySymbol, Math.abs(todaysSafeRemaining))}
        </div>
      </div>

      {/* Slim Progress Bar */}
      <div style={{ marginBottom: '14px' }}>
        <div className="progress-bar-bg" style={{ height: '5px', borderRadius: '3px' }}>
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${spentPercent}%`, 
              backgroundColor: isOverspentToday ? 'var(--notion-red-text)' : 'var(--text-primary)',
              borderRadius: '3px'
            }} 
          />
        </div>
      </div>

      {/* Properties Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '6px',
        marginBottom: '14px',
        background: 'var(--bg-card-subtle)',
        padding: '8px',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ padding: '4px 6px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Limit</span>
          <strong style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{formatCurrencyAmount(currencySymbol, todaysAllowedTotal)}</strong>
        </div>

        <div style={{ padding: '4px 6px', borderLeft: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Spent</span>
          <strong style={{ fontSize: '13px', fontWeight: 600, color: 'var(--notion-red-text)' }}>{formatCurrencyAmount(currencySymbol, spentToday)}</strong>
        </div>

        <div style={{ padding: '4px 6px', borderLeft: '1px solid var(--border-subtle)' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block', marginBottom: '2px' }}>In Hand</span>
          <strong style={{ fontSize: '13px', fontWeight: 600, color: 'var(--notion-blue-text)' }}>{formatCurrencyAmount(currencySymbol, remainingTotalInHand)}</strong>
        </div>
      </div>

      {/* 3 Action Buttons Row: Log Spend | Set Pocket Money | + Add Money */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
        <button 
          type="button"
          onClick={() => onOpenQuickAdd && onOpenQuickAdd('expense')}
          className="btn btn-primary"
          style={{
            padding: '9px 4px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            borderRadius: 'var(--radius-sm)',
            whiteSpace: 'nowrap'
          }}
        >
          <Plus size={14} /> Log Spend
        </button>

        <button 
          type="button"
          onClick={() => onOpenSetPocket ? onOpenSetPocket() : (onNavigateToPage && onNavigateToPage('settings_allowance'))}
          className="btn btn-secondary"
          style={{
            padding: '9px 4px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-card-subtle)',
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap'
          }}
          title="Set Monthly Pocket Money & Payday"
        >
          <Wallet size={14} color="var(--text-secondary)" /> Set Pocket
        </button>

        <button 
          type="button"
          onClick={() => onOpenQuickAdd && onOpenQuickAdd('topup')}
          className="btn btn-secondary"
          style={{
            padding: '9px 4px',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--notion-green-text)',
            color: 'var(--notion-green-text)',
            background: 'var(--notion-green-bg)',
            whiteSpace: 'nowrap'
          }}
        >
          <ArrowUpRight size={14} /> + Add Money
        </button>
      </div>
    </div>
  );
}
