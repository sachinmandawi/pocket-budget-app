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

        <button 
          type="button"
          onClick={() => setShowModal(true)}
          className="btn"
          style={{
            width: '100%',
            padding: '10px 16px',
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
              maxWidth: '320px', 
              padding: '24px 20px', 
              textAlign: 'center', 
              borderRadius: '24px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-medium)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.35)',
              animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--ios-red-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px auto',
              border: '1px solid rgba(239, 68, 68, 0.25)'
            }}>
              <AlertTriangle size={28} color="var(--ios-red)" />
            </div>

            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.2 }}>
              Reset App Database?
            </h3>
            
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '22px' }}>
              Are you sure you want to wipe all transactions, piggy bank savings & wishlist items back to ₹0 state?
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button"
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '11px', fontSize: '13px', fontWeight: 700 }}
              >
                Cancel
              </button>

              <button 
                type="button"
                onClick={handleExecuteReset}
                className="btn"
                style={{
                  flex: 1.2,
                  padding: '11px',
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderRadius: 'var(--radius-full)',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <RefreshCw size={15} /> Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
