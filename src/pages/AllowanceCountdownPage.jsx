import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, Calendar, ShieldCheck, Zap } from 'lucide-react';
import { formatCurrencyAmount } from '../utils/currencies';

const getOrdinalSuffix = (day) => {
  const d = Number(day || 1);
  if (d > 3 && d < 21) return `${d}th`;
  switch (d % 10) {
    case 1:  return `${d}st`;
    case 2:  return `${d}nd`;
    case 3:  return `${d}rd`;
    default: return `${d}th`;
  }
};

export default function AllowanceCountdownPage({ stats }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const paydayDay = stats?.paydayAnchorDate || 1;

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const currentDate = now.getDate();

      const paydayTargetDay = Math.min(31, Math.max(1, Number(paydayDay || 1)));

      let targetDate;
      if (currentDate < paydayTargetDay) {
        targetDate = new Date(year, month, paydayTargetDay, 0, 0, 0);
      } else {
        targetDate = new Date(year, month + 1, paydayTargetDay, 0, 0, 0);
      }

      const diff = targetDate.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateCountdown();
    const timer = setInterval(calculateCountdown, 1000);
    return () => clearInterval(timer);
  }, [paydayDay]);

  const totalDaysInMonth = stats?.totalDaysInMonth || 30;
  const currentDayNumber = stats?.currentDayNumber || 1;
  const daysRemaining = stats?.daysRemaining || 1;
  const cycleProgress = Math.min(100, Math.max(0, (currentDayNumber / totalDaysInMonth) * 100));

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out', paddingBottom: '80px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <span style={{ fontSize: '20px' }}>⏱️</span>
        <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
          Pocket Money Clock
        </h2>
      </div>

      {/* Main Countdown Card */}
      <div className="notion-card" style={{ padding: '18px 16px', marginBottom: '14px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
          <Clock size={15} color="var(--text-secondary)" />
          <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
            Next Pocket Money Reset
          </h3>
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
          Counting down to the {getOrdinalSuffix(paydayDay)} of next month
        </p>

        {/* Minimal Digital Clock */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          marginBottom: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card-subtle)',
            padding: '10px 4px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', lineHeight: 1 }}>
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: '3px', display: 'block' }}>
              Days
            </span>
          </div>

          <div style={{
            background: 'var(--bg-card-subtle)',
            padding: '10px 4px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', lineHeight: 1 }}>
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: '3px', display: 'block' }}>
              Hours
            </span>
          </div>

          <div style={{
            background: 'var(--bg-card-subtle)',
            padding: '10px 4px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', lineHeight: 1 }}>
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: '3px', display: 'block' }}>
              Mins
            </span>
          </div>

          <div style={{
            background: 'var(--bg-card-subtle)',
            padding: '10px 4px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--notion-blue-text)', display: 'block', lineHeight: 1 }}>
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: '3px', display: 'block' }}>
              Secs
            </span>
          </div>
        </div>

        {/* Progress Bar & Info */}
        <div style={{ textAlign: 'left', marginTop: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
            <span>Cycle Progress</span>
            <span className="notion-tag notion-tag-gray">{Math.round(cycleProgress)}%</span>
          </div>
          <div className="progress-bar-bg" style={{ height: '5px', marginBottom: '8px', borderRadius: '3px' }}>
            <div className="progress-bar-fill" style={{ width: `${cycleProgress}%`, backgroundColor: 'var(--text-primary)', borderRadius: '3px' }} />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', textAlign: 'center' }}>
            Day {currentDayNumber} of {totalDaysInMonth} ({daysRemaining} days left)
          </span>
        </div>
      </div>

      {/* Property Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="notion-card" style={{ 
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '74px'
        }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Monthly Pocket Money
          </span>
          <strong style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginTop: '4px', lineHeight: 1.1 }}>
            {formatCurrencyAmount(stats?.currencySymbol || '₹', stats?.monthlyAllowance || 0)}
          </strong>
        </div>

        <div className="notion-card" style={{ 
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '74px'
        }}>
          <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Daily Base Target
          </span>
          <strong style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginTop: '4px', lineHeight: 1.1 }}>
            {formatCurrencyAmount(stats?.currencySymbol || '₹', stats?.baseDailyTarget || 0)}/day
          </strong>
        </div>
      </div>
    </div>
  );
}
