import React from 'react';
import { ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';

export default function DataResetSettingsPage({ onResetDemo, onBack }) {
  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ width: '36px', height: '36px', padding: 0 }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Data & Reset
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Reset app budget data to fresh state
          </p>
        </div>
      </div>

      <div className="ios-card">
        <div style={{
          background: 'var(--ios-red-bg)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '20px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start'
        }}>
          <AlertTriangle size={22} color="var(--ios-red)" style={{ shrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ios-red)', marginBottom: '4px' }}>
              Reset Budget Data
            </h4>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Yeh action sabhi recorded expenses, wishlist cool-offs aur custom settings ko clear kar dega aur app ko fresh ₹1,500 state me restore kar dega.
            </p>
          </div>
        </div>

        <button 
          onClick={() => { onResetDemo(); onBack(); }}
          className="btn btn-primary"
          style={{ width: '100%', padding: '15px', backgroundColor: 'var(--ios-red)' }}
        >
          <RefreshCw size={18} /> Reset All Data Now
        </button>
      </div>
    </div>
  );
}
