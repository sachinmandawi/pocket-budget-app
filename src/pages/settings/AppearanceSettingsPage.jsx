import React from 'react';
import { Sun, Moon, CheckCircle2 } from 'lucide-react';

export default function AppearanceSettingsPage({ isDarkMode, onToggleDarkMode }) {
  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="notion-card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Light Mode Card */}
          <div
            onClick={() => { if (isDarkMode) onToggleDarkMode(false); }}
            style={{
              padding: '18px 14px',
              borderRadius: 'var(--radius-sm)',
              border: `2px solid ${!isDarkMode ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
              background: !isDarkMode ? 'var(--bg-card-subtle)' : 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s ease'
            }}
          >
            {!isDarkMode && (
              <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                <CheckCircle2 size={14} color="var(--text-primary)" />
              </div>
            )}
            <Sun size={28} color="var(--notion-orange-text)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Light Mode
            </span>
          </div>

          {/* Dark Mode Card */}
          <div
            onClick={() => { if (!isDarkMode) onToggleDarkMode(true); }}
            style={{
              padding: '18px 14px',
              borderRadius: 'var(--radius-sm)',
              border: `2px solid ${isDarkMode ? 'var(--text-primary)' : 'var(--border-subtle)'}`,
              background: isDarkMode ? 'var(--bg-card-subtle)' : 'transparent',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.15s ease'
            }}
          >
            {isDarkMode && (
              <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                <CheckCircle2 size={14} color="var(--text-primary)" />
              </div>
            )}
            <Moon size={28} color="var(--text-secondary)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Dark Mode
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
