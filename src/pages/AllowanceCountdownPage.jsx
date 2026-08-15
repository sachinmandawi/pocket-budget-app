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
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
          Next Payday Clock ⏱️
        </h2>
      </div>

      {/* Main Countdown Hero Card */}
      <div className="ios-card" style={{ padding: '20px 16px', marginBottom: '14px', textAlign: 'center' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          background: 'var(--ios-blue-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px'
        }}>
          <Clock size={22} color="var(--ios-blue)" />
        </div>

        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 2px', color: 'var(--text-primary)' }}>
          Next Pocket Money Credit
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 20px' }}>
          Countdown to {getOrdinalSuffix(paydayDay)} of next cycle
        </p>

        {/* Big Live Digital Clock */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card-subtle)',
            padding: '12px 6px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ios-blue)', display: 'block', lineHeight: 1 }}>
              {String(timeLeft.days).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: '4px', display: 'block' }}>
              Days
            </span>
          </div>

          <div style={{
            background: 'var(--bg-card-subtle)',
            padding: '12px 6px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', lineHeight: 1 }}>
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: '4px', display: 'block' }}>
              Hours
            </span>
          </div>

          <div style={{
            background: 'var(--bg-card-subtle)',
            padding: '12px 6px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', lineHeight: 1 }}>
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: '4px', display: 'block' }}>
              Mins
            </span>
          </div>

          <div style={{
            background: 'var(--bg-card-subtle)',
            padding: '12px 6px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)'
          }}>
            <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ios-green)', display: 'block', lineHeight: 1 }}>
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: '4px', display: 'block' }}>
              Secs
            </span>
          </div>
        </div>

        {/* Progress Bar & Info */}
        <div style={{ textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '6px' }}>
            <span>Current Cycle Progress</span>
            <span>{Math.round(cycleProgress)}% Complete</span>
          </div>
          <div className="progress-bar-bg" style={{ height: '8px', marginBottom: '10px' }}>
            <div className="progress-bar-fill" style={{ width: `${cycleProgress}%`, backgroundColor: 'var(--ios-blue)' }} />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', textAlign: 'center' }}>
            Day {currentDayNumber} of {totalDaysInMonth} ({daysRemaining} days left in cycle)
          </span>
        </div>
      </div>

      {/* 2 Micro Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div className="ios-card" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block' }}>
            Monthly Pocket Money
          </span>
          <strong style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>
            {formatCurrencyAmount(stats?.currencySymbol || '₹', stats?.monthlyAllowance || 0)}
          </strong>
        </div>

        <div className="ios-card" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block' }}>
            Daily Base Target
          </span>
          <strong style={{ fontSize: '18px', fontWeight: 800, color: 'var(--ios-blue)', display: 'block', marginTop: '2px' }}>
            {formatCurrencyAmount(stats?.currencySymbol || '₹', stats?.baseDailyTarget || 0)}/day
          </strong>
        </div>
      </div>
    </div>
  );
}
