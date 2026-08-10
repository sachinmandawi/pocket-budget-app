import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function DataResetSettingsPage({ onResetDemo, onBack }) {
  const [confirmStep, setConfirmStep] = useState(false);

  const handleExecuteReset = () => {
    onResetDemo();
    if (onBack) onBack();
  };

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
              Wipes all expenses, piggy bank vault, wishlist items & resets to ₹0 state.
            </p>
          </div>
        </div>

        {!confirmStep ? (
          <button 
            type="button"
            onClick={() => setConfirmStep(true)}
            className="btn"
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '13px',
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
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeIn 0.15s ease-out' }}>
            <button 
              type="button"
              onClick={handleExecuteReset}
              className="btn"
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '13px',
                fontWeight: 800,
                color: '#ffffff',
                background: '#dc2626',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 4px 14px rgba(220, 38, 38, 0.4)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={16} /> YES, CONFIRM WIPE ALL DATA TO ₹0
            </button>

            <button 
              type="button"
              onClick={() => setConfirmStep(false)}
              className="btn btn-secondary"
              style={{ width: '100%', padding: '10px', fontSize: '12px', fontWeight: 700 }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
