import React from 'react';
import { Lock, Unlock, HeartHandshake } from 'lucide-react';

export default function EmergencyReserve({ reserveAmount, isUnlocked, currentDay, onToggleUnlock }) {
  return (
    <div className="ios-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HeartHandshake size={20} color="var(--ios-orange)" />
          Papa Emergency Reserve (₹{reserveAmount})
        </span>

        <span style={{
          fontSize: '11px',
          fontWeight: 800,
          background: isUnlocked ? 'var(--ios-green-bg)' : 'var(--ios-orange-bg)',
          color: isUnlocked ? 'var(--ios-green)' : 'var(--ios-orange)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)'
        }}>
          {isUnlocked ? 'UNLOCKED' : 'LOCKED TILL DAY 25'}
        </span>
      </div>

      <div style={{ 
        background: isUnlocked ? 'var(--ios-green-bg)' : 'var(--ios-orange-bg)', 
        padding: '14px', 
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isUnlocked ? <Unlock size={20} color="var(--ios-green)" /> : <Lock size={20} color="var(--ios-orange)" />}
          <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
            {isUnlocked ? 'Vault Active' : `₹${reserveAmount} Locked`}
          </p>
        </div>

        <button 
          onClick={onToggleUnlock}
          className="btn btn-secondary btn-sm"
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          {isUnlocked ? <Lock size={13} /> : <Unlock size={13} />}
          {isUnlocked ? 'Lock' : 'Unlock'}
        </button>
      </div>
    </div>
  );
}
