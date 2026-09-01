import React from 'react';
import { Plus, ArrowUpRight, Wallet, Calendar } from 'lucide-react';
import { formatCurrencyAmount } from '../utils/currencies';

export default function DailyGauge({ stats, onOpenQuickAdd, onNavigateToPage, onOpenSetPocket }) {
  const {
    todaysAllowedTotal,
    spentToday,
    spentTodayPiggy = 0,
    spentTodayTotal = spentToday,
    todaysSafeRemaining,
    remainingTotalInHand,
    currentDayNumber,
    totalDaysInMonth,
    cyclePeriodLabel,
    totalTopupsThisMonth = 0
  } = stats;

  const isOverspentToday = todaysSafeRemaining < 0;
  const spentPercent = todaysAllowedTotal > 0
    ? Math.min(100, Math.max(0, (spentTodayTotal / todaysAllowedTotal) * 100))
    : 0;
  const currencySymbol = stats.currencySymbol || stats.currency?.symbol || '₹';

  return (
    <div className="notion-card" style={{ padding: '18px 18px 16px', marginBottom: '10px' }}>

      {/* Top meta row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span className="notion-tag notion-tag-gray">
          Day {currentDayNumber} / {totalDaysInMonth}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={10} />
          {cyclePeriodLabel}
        </span>
      </div>

      {/* Big number */}
      <div style={{ marginBottom: '14px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '4px', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
          {isOverspentToday ? "Today's Overspend" : "Today's Remaining"}
        </p>
        <div style={{
          fontSize: '36px',
          fontWeight: 700,
          color: isOverspentToday ? 'var(--notion-red-text)' : 'var(--text-primary)',
          letterSpacing: '-1px',
          lineHeight: 1
        }}>
          {isOverspentToday ? '-' : ''}{formatCurrencyAmount(currencySymbol, Math.abs(todaysSafeRemaining))}
        </div>
        {totalTopupsThisMonth > 0 && (
          <span className="notion-tag notion-tag-green" style={{ marginTop: '6px', fontSize: '10px' }}>
            <ArrowUpRight size={9} />
            +{formatCurrencyAmount(currencySymbol, totalTopupsThisMonth)} added
          </span>
        )}
      </div>

      {/* Thin progress bar */}
      <div className="progress-bar-bg" style={{ marginBottom: '16px' }}>
        <div
          className="progress-bar-fill"
          style={{
            width: `${spentPercent}%`,
            backgroundColor: isOverspentToday ? 'var(--notion-red-text)' : 'var(--text-primary)'
          }}
        />
      </div>

      {/* 3-col stats strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0',
        marginBottom: '14px',
        background: 'var(--bg-card-subtle)',
        borderRadius: 'var(--radius-sm)',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)'
      }}>
        {[
          { label: 'Limit', value: formatCurrencyAmount(currencySymbol, todaysAllowedTotal), color: 'var(--text-primary)' },
          { label: 'Spent', value: formatCurrencyAmount(currencySymbol, spentTodayTotal), color: 'var(--notion-red-text)' },
          { label: 'Total Left', value: formatCurrencyAmount(currencySymbol, remainingTotalInHand), color: 'var(--notion-blue-text)' }
        ].map((item, i) => (
          <div key={item.label} style={{
            padding: '8px 10px',
            borderLeft: i > 0 ? '1px solid var(--border-subtle)' : 'none'
          }}>
            <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
              {item.label}
            </p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: item.color, letterSpacing: '-0.2px' }}>
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
        <button
          type="button"
          onClick={() => onOpenQuickAdd && onOpenQuickAdd('expense')}
          className="btn btn-primary"
          style={{ padding: '9px 4px', fontSize: '12px', borderRadius: 'var(--radius-sm)', whiteSpace: 'nowrap' }}
        >
          <Plus size={13} /> Log Spend
        </button>

        <button
          type="button"
          onClick={() => onOpenSetPocket ? onOpenSetPocket() : (onNavigateToPage && onNavigateToPage('settings_allowance'))}
          className="btn btn-secondary"
          style={{ padding: '9px 4px', fontSize: '12px', borderRadius: 'var(--radius-sm)', whiteSpace: 'nowrap' }}
          title="Set Monthly Pocket Money"
        >
          <Wallet size={13} /> Set Pocket
        </button>

        <button
          type="button"
          onClick={() => onOpenQuickAdd && onOpenQuickAdd('topup')}
          className="btn btn-secondary"
          style={{
            padding: '9px 4px',
            fontSize: '12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--notion-green-text)',
            color: 'var(--notion-green-text)',
            background: 'var(--notion-green-bg)',
            whiteSpace: 'nowrap'
          }}
        >
          <ArrowUpRight size={13} /> + Money
        </button>
      </div>
    </div>
  );
}
