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
    <div className="ios-card" style={{ padding: '20px 18px', marginBottom: '16px' }}>
      {/* Header Status Bar - Crisp Left & Right Alignment */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        gap: '4px', 
        marginBottom: '16px' 
      }}>
        <span style={{ 
          fontSize: '10px', 
          fontWeight: 800, 
          background: themeBg, 
          color: themeColor, 
          padding: '3px 8px', 
          borderRadius: 'var(--radius-full)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px',
          whiteSpace: 'nowrap',
          flexShrink: 0
        }}>
          <ShieldCheck size={12} /> {statusText} • Day {currentDayNumber}/{totalDaysInMonth}
        </span>

        {cyclePeriodLabel && (
          <span style={{ 
            fontSize: '10px', 
            color: 'var(--text-secondary)', 
            fontWeight: 600, 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '3px',
            whiteSpace: 'nowrap',
            marginLeft: 'auto',
            flexShrink: 0
          }}>
            <Calendar size={11} color="var(--ios-blue)" /> {cyclePeriodLabel}
          </span>
        )}
      </div>

      {/* Hero Daily Amount Display */}
      <div style={{ textAlign: 'center', marginBottom: '14px' }}>
        <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '2px' }}>
          Safe Allowance Today
        </p>
        <div style={{ 
          fontSize: '36px', 
          fontWeight: 800, 
          color: themeColor, 
          letterSpacing: '-1px', 
          lineHeight: 1 
        }}>
          ₹{Math.abs(todaysSafeRemaining)}
        </div>
      </div>

      {/* Minimal Progress Bar */}
      <div style={{ margin: '14px 0 16px' }}>
        <div className="progress-bar-bg" style={{ height: '8px' }}>
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
        marginBottom: '18px'
      }}>
        <div style={{
          background: 'var(--bg-card-subtle)',
          padding: '10px 6px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Limit</span>
          <strong style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{todaysAllowedTotal}</strong>
        </div>

        <div style={{
          background: 'var(--bg-card-subtle)',
          padding: '10px 6px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Spent</span>
          <strong style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ios-red)' }}>₹{spentToday}</strong>
        </div>

        <div style={{
          background: 'var(--bg-card-subtle)',
          padding: '10px 6px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 700, textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Cash</span>
          <strong style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ios-blue)' }}>₹{remainingTotalInHand}</strong>
        </div>
      </div>

      {/* Primary Log Button */}
      <button 
        onClick={onOpenQuickAdd}
        className="btn btn-primary"
        style={{ 
          width: '100%', 
          padding: '14px', 
          fontSize: '15px', 
          fontWeight: 800,
          borderRadius: 'var(--radius-full)',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
        }}
      >
        <Plus size={18} /> Log Expense
      </button>
    </div>
  );
}
