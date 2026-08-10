import React from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

export default function DataResetSettingsPage({ onResetDemo, onBack }) {
  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="ios-card">
        <div style={{
          background: 'var(--ios-red-bg)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          marginBottom: '20px',
          border: '1px solid rgba(239, 68, 68, 0.15)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.12)'
          }}>
            <AlertTriangle size={22} color="var(--ios-red)" />
          </div>

          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ios-red)', margin: 0, lineHeight: 1.2 }}>
              Reset Database to 0
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
              Wipes all expenses, wishlist items & resets to ₹0 state.
            </p>
          </div>
        </div>

        <button 
          onClick={() => { onResetDemo(); onBack(); }}
          className="btn"
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '14px',
            fontWeight: 800,
            color: '#ffffff',
            background: 'var(--ios-red)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <RefreshCw size={16} /> Reset All Data Now
        </button>
      </div>
    </div>
  );
}
