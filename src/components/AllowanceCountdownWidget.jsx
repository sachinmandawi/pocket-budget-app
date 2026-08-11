import React, { useState, useEffect } from 'react';
import { Clock, Sparkles, Calendar, TrendingUp } from 'lucide-react';

export default function AllowanceCountdownWidget({ stats, onClick }) {
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
  const cycleProgress = Math.min(100, Math.max(0, (currentDayNumber / totalDaysInMonth) * 100));

  return (
    <div 
      onClick={onClick}
      className="ios-card" 
      style={{
        padding: '16px 18px',
        marginBottom: '16px',
        background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-subtle) 100%)',
        border: '1px solid var(--border-subtle)',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'var(--ios-blue-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={16} color="var(--ios-blue)" />
          </div>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.2px' }}>
              Pocket Money Countdown
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Time until next pocket money credit
            </span>
          </div>
        </div>

        <span style={{
          fontSize: '10px',
          fontWeight: 800,
          background: 'var(--ios-blue-bg)',
          color: 'var(--ios-blue)',
          padding: '3px 8px',
          borderRadius: 'var(--radius-full)',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '3px'
        }}>
          <Sparkles size={11} /> Day {currentDayNumber}/{totalDaysInMonth}
        </span>
      </div>

      {/* Ticking Digital Countdown Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '6px',
        marginBottom: '12px'
      }}>
        {/* Days */}
        <div style={{
          background: 'var(--bg-card-subtle)',
          padding: '8px 4px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ios-blue)', display: 'block', lineHeight: 1 }}>
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: '2px', display: 'block' }}>
            Days
          </span>
        </div>

        {/* Hours */}
        <div style={{
          background: 'var(--bg-card-subtle)',
          padding: '8px 4px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', lineHeight: 1 }}>
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: '2px', display: 'block' }}>
            Hours
          </span>
        </div>

        {/* Minutes */}
        <div style={{
          background: 'var(--bg-card-subtle)',
          padding: '8px 4px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', display: 'block', lineHeight: 1 }}>
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: '2px', display: 'block' }}>
            Mins
          </span>
        </div>

        {/* Seconds */}
        <div style={{
          background: 'var(--bg-card-subtle)',
          padding: '8px 4px',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center',
          border: '1px solid var(--border-subtle)'
        }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ios-green)', display: 'block', lineHeight: 1 }}>
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: '2px', display: 'block' }}>
            Secs
          </span>
        </div>
      </div>

      {/* Cycle Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
          <span>Month Cycle Progress</span>
          <span>{Math.round(cycleProgress)}% Complete</span>
        </div>
        <div className="progress-bar-bg" style={{ height: '6px' }}>
          <div className="progress-bar-fill" style={{ width: `${cycleProgress}%`, backgroundColor: 'var(--ios-blue)' }} />
        </div>
      </div>
    </div>
  );
}
