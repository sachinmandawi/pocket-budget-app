import React from 'react';
import { Sparkles, DownloadCloud, X, ArrowUpRight } from 'lucide-react';

export default function AppUpdateModal({ updateInfo, isOpen, onClose }) {
  if (!isOpen || !updateInfo || !updateInfo.hasUpdate) return null;

  const handleUpdateClick = () => {
    if (updateInfo.downloadUrl) {
      window.open(updateInfo.downloadUrl, '_system');
    }
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ alignItems: 'center', padding: '16px' }} onClick={onClose}>
      <div 
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '280px',
          width: '100%',
          borderRadius: '12px',
          padding: '18px 16px',
          background: 'var(--bg-card)',
          boxShadow: 'none',
          border: '1px solid var(--border-subtle)',
          animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-tertiary)',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 'var(--radius-sm)'
          }}
          title="Close"
        >
          <X size={15} />
        </button>

        {/* Icon Pill */}
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px'
        }}>
          <DownloadCloud size={20} color="var(--text-primary)" />
        </div>

        {/* Title & Version Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Update Available
          </h3>
          <span className="notion-tag notion-tag-gray">
            v{updateInfo.latestVersion}
          </span>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
          A new version of Pocket Budget is ready!
        </p>

        {/* Minimal Highlights (Max 2-3 lines) */}
        {updateInfo.highlights && updateInfo.highlights.length > 0 && (
          <div style={{
            background: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            padding: '10px 12px',
            marginBottom: '14px',
            textAlign: 'left'
          }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
              What's New
            </span>
            <ul style={{ margin: 0, paddingLeft: '14px', fontSize: '11px', color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.5 }}>
              {updateInfo.highlights.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={handleUpdateClick}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} /> Update Now
          </button>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '6px',
              fontSize: '11px',
              fontWeight: 500,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer'
            }}
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
