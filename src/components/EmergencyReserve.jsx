import React from 'react';
import { Lock, Unlock, HeartHandshake } from 'lucide-react';
import { formatCurrencyAmount } from '../utils/currencies';

export default function EmergencyReserve({ reserveAmount, isUnlocked, currentDay, onToggleUnlock, currencySymbol = '₹' }) {
  return (
    <div className="notion-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <HeartHandshake size={15} color="var(--text-primary)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Emergency Fund
          </span>
        </div>

        <span className={`notion-tag ${isUnlocked ? 'notion-tag-green' : 'notion-tag-orange'}`}>
          {isUnlocked ? 'Unlocked' : 'Locked till Day 25'}
        </span>
      </div>

      <div style={{ 
        background: 'var(--bg-card-subtle)', 
        padding: '10px 12px', 
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>{isUnlocked ? '🔓' : '🔒'}</span>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {formatCurrencyAmount(currencySymbol, reserveAmount)}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', lineHeight: 1 }}>
              {isUnlocked ? 'Reserve Unlocked' : 'Emergency Fund'}
            </span>
          </div>
        </div>

        <button 
          onClick={onToggleUnlock}
          className="btn btn-secondary btn-sm"
          style={{ padding: '4px 10px', fontSize: '11px' }}
        >
          {isUnlocked ? <Lock size={12} /> : <Unlock size={12} />}
          {isUnlocked ? 'Lock' : 'Unlock'}
        </button>
      </div>
    </div>
  );
}
