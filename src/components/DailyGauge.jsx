import React from 'react';
import { Plus, Calendar, ShieldCheck } from 'lucide-react';
import { formatCurrencyAmount } from '../utils/currencies';

export default function DailyGauge({ stats, onOpenQuickAdd }) {
  const {
    todaysAllowedTotal,
    spentToday,
    todaysSafeRemaining,
    remainingTotalInHand,
    currentDayNumber,
    totalDaysInMonth,
    cyclePeriodLabel
  } = stats;

  const isOverspentToday = todaysSafeRemaining < 0;
  const spentPercent = todaysAllowedTotal > 0 ? Math.min(100, Math.max(0, (spentToday / todaysAllowedTotal) * 100)) : 0;

  let themeTagClass = 'notion-tag-green';
  let statusText = 'Safe to Spend';

  if (isOverspentToday) {
    themeTagClass = 'notion-tag-red';
    statusText = 'Over Limit';
  } else if (spentPercent > 75) {
    themeTagClass = 'notion-tag-orange';
    statusText = 'Near Cap';
  }

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
        <span className="notion-tag notion-tag-gray">
          Day {currentDayNumber}/{totalDaysInMonth}
        </span>

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

      {/* Action Button */}
      <button 
        type="button"
        onClick={onOpenQuickAdd}
        className="btn btn-primary"
        style={{
          width: '100%',
          padding: '8px 12px',
          fontSize: '13px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          borderRadius: 'var(--radius-sm)'
        }}
      >
        <Plus size={15} /> Log Spend
      </button>
    </div>
  );
}
