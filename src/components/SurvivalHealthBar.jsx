import React from 'react';
import { HeartPulse, ShieldAlert } from 'lucide-react';

export default function SurvivalHealthBar({ stats }) {
  const { healthScore = 100, isFastBurn = false, currentDayNumber = 1 } = stats || {};

  let hpTag = 'notion-tag-green';
  let hpTitle = 'Budget Health';

  if (healthScore < 40) {
    hpTag = 'notion-tag-red';
  } else if (healthScore < 70) {
    hpTag = 'notion-tag-orange';
  }

  const badges = [
    { id: 'warrior', name: 'Warrior', icon: '🛡️', unlocked: healthScore >= 75 },
    { id: 'survivor10', name: 'Day 10', icon: '🥉', unlocked: currentDayNumber >= 10 && healthScore >= 50 },
    { id: 'halfway', name: 'Halfway', icon: '🥈', unlocked: currentDayNumber >= 15 && healthScore >= 50 },
    { id: 'legend', name: 'Master', icon: '👑', unlocked: currentDayNumber >= 28 && healthScore >= 40 }
  ];

  return (
    <div className="notion-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HeartPulse size={15} color="var(--text-primary)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {hpTitle}
          </span>
        </div>
        <span className={`notion-tag ${hpTag}`}>
          {healthScore}%
        </span>
      </div>

      <div className="progress-bar-bg" style={{ height: '5px', marginBottom: '10px', borderRadius: '3px' }}>
        <div 
          className="progress-bar-fill"
          style={{ width: `${healthScore}%`, backgroundColor: healthScore < 40 ? 'var(--notion-red-text)' : healthScore < 70 ? 'var(--notion-orange-text)' : 'var(--notion-green-text)', borderRadius: '3px' }}
        />
      </div>

      {isFastBurn && (
        <div className="notion-callout" style={{ marginBottom: '8px' }}>
          <ShieldAlert size={15} color="var(--notion-red-text)" />
          <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--notion-red-text)', margin: 0 }}>
            ⚠️ High Spend Alert: Spending faster than daily target
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
