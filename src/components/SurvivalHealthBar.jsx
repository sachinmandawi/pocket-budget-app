import React from 'react';
import { HeartPulse, ShieldAlert } from 'lucide-react';

export default function SurvivalHealthBar({ stats }) {
  const { healthScore = 100, isFastBurn = false, currentDayNumber = 1 } = stats || {};

  let hpColor = 'var(--ios-green)';
  let hpBg = 'var(--ios-green-bg)';
  let hpTitle = 'Budget Health';

  if (healthScore < 40) {
    hpColor = 'var(--ios-red)';
    hpBg = 'var(--ios-red-bg)';
  } else if (healthScore < 70) {
    hpColor = 'var(--ios-orange)';
    hpBg = 'var(--ios-orange-bg)';
  }

  const badges = [
    { id: 'warrior', name: 'Warrior', icon: '🛡️', unlocked: healthScore >= 75 },
    { id: 'survivor10', name: 'Day 10', icon: '🥉', unlocked: currentDayNumber >= 10 && healthScore >= 50 },
    { id: 'halfway', name: 'Halfway', icon: '🥈', unlocked: currentDayNumber >= 15 && healthScore >= 50 },
    { id: 'legend', name: 'Master', icon: '👑', unlocked: currentDayNumber >= 28 && healthScore >= 40 }
  ];

  return (
    <div className="ios-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HeartPulse size={16} color={hpColor} />
          {hpTitle}
        </span>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: 800, 
          color: hpColor,
          background: hpBg,
          padding: '2px 8px',
          borderRadius: 'var(--radius-full)'
        }}>
          {healthScore}%
        </span>
      </div>

      <div className="progress-bar-bg" style={{ height: '8px', marginBottom: '12px' }}>
        <div 
          className="progress-bar-fill"
          style={{ width: `${healthScore}%`, backgroundColor: hpColor }}
        />
      </div>

      {isFastBurn && (
        <div style={{
          background: 'var(--ios-red-bg)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 12px',
          marginBottom: '10px',
          display: 'flex',
          gap: '8px',
          alignItems: 'center'
        }}>
          <ShieldAlert size={16} color="var(--ios-red)" />
          <p style={{ fontSize: '12px', fontWeight: 700, color: 'var(--ios-red)' }}>
            Fast Burn Alert: High spending rate
          </p>
        </div>
      )}

      {/* Clean Badges Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginTop: '6px' }}>
        {badges.map(b => (
          <div 
            key={b.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 4px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card-subtle)',
              opacity: b.unlocked ? 1 : 0.35,
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '16px', marginBottom: '2px' }}>{b.icon}</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)' }}>{b.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
