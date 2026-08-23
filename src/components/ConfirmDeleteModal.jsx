import React from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item?',
  message = 'Are you sure you want to delete this? This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isDanger = true
}) {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        animation: 'fadeIn 0.15s ease-out'
      }}
    >
      <div 
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '350px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '18px',
          padding: '24px 20px 18px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--border-medium)',
          textAlign: 'center',
          boxSizing: 'border-box',
          animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Icon Badge */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: isDanger ? 'var(--notion-red-bg)' : 'var(--notion-orange-bg)',
          color: isDanger ? 'var(--notion-red-text)' : 'var(--notion-orange-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px'
        }}>
          {isDanger ? <Trash2 size={22} /> : <AlertTriangle size={22} />}
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 8px',
          letterSpacing: '-0.2px',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          lineHeight: 1.35
        }}>
          {title}
        </h3>

        {/* Message */}
        <p style={{
          fontSize: '12.5px',
          color: 'var(--text-secondary)',
          margin: '0 0 20px',
          lineHeight: 1.45,
          wordBreak: 'break-word',
          overflowWrap: 'break-word'
        }}>
          {message}
        </p>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '10px',
              border: '1px solid var(--border-medium)',
              background: 'var(--bg-card-subtle)',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              flex: 1,
              padding: '10px 14px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '10px',
              border: 'none',
              background: isDanger ? 'var(--ios-red)' : 'var(--ios-blue)',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: isDanger ? '0 2px 8px rgba(224, 62, 62, 0.35)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
