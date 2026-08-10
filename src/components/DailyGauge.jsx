import React from 'react';
import { Plus, Calendar, ShieldCheck } from 'lucide-react';

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

  let themeColor = 'var(--ios-green)';
  let themeBg = 'var(--ios-green-bg)';
  let statusText = 'Safe to Spend';

  if (isOverspentToday) {
    themeColor = 'var(--ios-red)';
    themeBg = 'var(--ios-red-bg)';
    statusText = 'Over Limit';
  } else if (spentPercent > 75) {
    themeColor = 'var(--ios-orange)';
    themeBg = 'var(--ios-orange-bg)';
    statusText = 'Near Cap';
  }

  return (
    <div className="ios-card" style={{ padding: '24px 20px', marginBottom: '16px' }}>
      {/* Header Status Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: 700, 
          background: themeBg, 
          color: themeColor, 
          padding: '4px 12px', 
          borderRadius: 'var(--radius-full)',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <ShieldCheck size={13} /> {statusText} • Day {currentDayNumber}/{totalDaysInMonth}
        </span>

        {cyclePeriodLabel && (
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar size={12} color="var(--ios-blue)" /> {cyclePeriodLabel}
          </span>
        )}
      </div>

      {/* Hero Daily Amount Display */}
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
          Safe to Spend Today
        </p>
        <div style={{ 
          fontSize: '52px', 
          fontWeight: 800, 
          color: themeColor, 
          letterSpacing: '-2px', 
          lineHeight: 1 
        }}>
          ₹{Math.abs(todaysSafeRemaining)}
        </div>
      </div>

      {/* Minimal Progress Bar */}
      <div style={{ margin: '16px 0 20px' }}>
        <div className="progress-bar-bg">
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${spentPercent}%`, 
              backgroundColor: themeColor 
            }} 
          />
        </div>
      </div>

      {/* 3 Micro Stat Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
        marginBottom: '20px'
      }}>
        <div style={{
          background: 'var(--bg-card-subtle)',
          padding: '10px 6px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Limit</span>
          <strong style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{todaysAllowedTotal}</strong>
        </div>

        <div style={{
          background: 'var(--bg-card-subtle)',
          padding: '10px 6px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Spent</span>
          <strong style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ios-red)' }}>₹{spentToday}</strong>
        </div>

        <div style={{
          background: 'var(--bg-card-subtle)',
          padding: '10px 6px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Cash</span>
          <strong style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ios-blue)' }}>₹{remainingTotalInHand}</strong>
        </div>
      </div>

      {/* Primary Log Button */}
      <button 
        onClick={onOpenQuickAdd}
        className="btn btn-primary"
        style={{ width: '100%', padding: '14px', fontSize: '15px', borderRadius: 'var(--radius-full)' }}
      >
        <Plus size={18} /> Log Expense
      </button>
    </div>
  );
}
