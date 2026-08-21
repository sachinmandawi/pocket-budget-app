import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, X } from 'lucide-react';

export default function DataResetSettingsPage({ onResetDemo, onBack }) {
  const [showModal, setShowModal] = useState(false);

  const handleExecuteReset = () => {
    setShowModal(false);
    onResetDemo();
    if (onBack) onBack();
  };

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="notion-card">
        <div className="notion-callout" style={{ marginBottom: '16px', background: 'var(--notion-red-bg)' }}>
          <AlertTriangle size={15} color="var(--notion-red-text)" />
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--notion-red-text)', margin: 0, lineHeight: 1.3 }}>
              Reset Database to 0
            </h4>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
              Wipes all expenses, piggy bank savings, wishlist items & resets to ₹0 state.
            </p>
          </div>
        </div>

        <button 
          type="button"
          onClick={() => setShowModal(true)}
          className="btn"
          style={{
            width: '100%',
            padding: '9px 14px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#ffffff',
            background: 'var(--notion-red-text)',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
          }}
        >
          <RefreshCw size={14} /> Reset All Data Now
        </button>
      </div>

      {/* Premium High-Contrast iOS Glassmorphism Confirmation Modal */}
      {showModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowModal(false)}
          style={{ 
            animation: 'fadeIn 0.15s ease-out', 
            zIndex: 9999, 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '16px' 
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ 
              width: '100%',
              maxWidth: '280px', 
              padding: '20px 18px', 
              textAlign: 'center', 
              borderRadius: '12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'none',
              animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'var(--notion-red-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px auto'
            }}>
              <AlertTriangle size={22} color="var(--notion-red-text)" />
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', lineHeight: 1.2 }}>
              Reset App Database?
            </h3>
            
            <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '18px' }}>
              Are you sure you want to wipe all transactions, piggy bank savings & wishlist items back to ₹0 state?
            </p>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '9px', fontSize: '12px', fontWeight: 600 }}
              >
                Cancel
              </button>

              <button 
                type="button"
                onClick={handleExecuteReset}
                className="btn"
                style={{
                  flex: 1.2,
                  padding: '9px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#ffffff',
                  background: 'var(--notion-red-text)',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px'
                }}
              >
                <RefreshCw size={13} /> Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
