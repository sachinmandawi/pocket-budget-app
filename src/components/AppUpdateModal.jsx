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
    <div className="modal-overlay" style={{ alignItems: 'center', padding: '20px' }}>
      <div 
        className="modal-content"
        style={{
          maxWidth: '380px',
          width: '100%',
          borderRadius: '24px',
          padding: '24px 20px',
          background: 'var(--bg-card)',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-subtle)',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'var(--bg-card-subtle)',
            border: 'none',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-tertiary)'
          }}
        >
          <X size={16} />
        </button>

        {/* Icon Pill */}
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, var(--ios-blue) 0%, #1d4ed8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px',
          boxShadow: '0 8px 16px rgba(37, 99, 235, 0.25)'
        }}>
          <DownloadCloud size={26} color="#ffffff" />
        </div>

        {/* Title & Version Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '6px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Update Available
          </h3>
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            background: 'var(--ios-blue-bg)',
            color: 'var(--ios-blue)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            v{updateInfo.latestVersion}
          </span>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px', fontWeight: 500 }}>
          A new version of Pocket Budget is ready!
        </p>

        {/* Minimal Highlights (Max 2-3 lines) */}
        {updateInfo.highlights && updateInfo.highlights.length > 0 && (
          <div style={{
            background: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '18px',
            textAlign: 'left'
          }}>
            <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
              What's New
            </span>
            <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.6 }}>
              {updateInfo.highlights.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={handleUpdateClick}
            className="btn btn-primary"
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '14px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
            }}
          >
            <Sparkles size={16} /> Update Now
          </button>

          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '12px',
              fontWeight: 700,
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
