import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, Calendar, ShieldCheck, Zap } from 'lucide-react';

export default function AllowanceCountdownPage({ stats, onBack }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
      const diff = nextMonth.getTime() - now.getTime();

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
  }, []);

  const totalDaysInMonth = stats?.totalDaysInMonth || 30;
  const currentDayNumber = stats?.currentDayNumber || 1;
  const daysRemaining = stats?.daysRemaining || 1;
  const cycleProgress = Math.min(100, Math.max(0, (currentDayNumber / totalDaysInMonth) * 100));

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
          Allowance Countdown
        </h2>
      </div>

      {/* Main Countdown Hero Card */}
      <div className="ios-card" style={{ padding: '24px 20px', marginBottom: '16px', textAlign: 'center' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '18px',
          background: 'var(--ios-blue-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px'
        }}>
          <Clock size={28} color="var(--ios-blue)" />
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
          Next Allowance Credit
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 20px' }}>
          Countdown to 1st of next month cycle
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
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ios-blue)', display: 'block', lineHeight: 1 }}>
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
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', lineHeight: 1 }}>
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
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', lineHeight: 1 }}>
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
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--ios-green)', display: 'block', lineHeight: 1 }}>
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
            Monthly Allowance
          </span>
          <strong style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginTop: '2px' }}>
            ₹{stats?.monthlyAllowance || 0}
          </strong>
        </div>

        <div className="ios-card" style={{ padding: '14px 16px' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block' }}>
            Daily Base Target
          </span>
          <strong style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ios-blue)', display: 'block', marginTop: '2px' }}>
            ₹{stats?.baseDailyTarget || 0}/day
          </strong>
        </div>
      </div>
    </div>
  );
}
