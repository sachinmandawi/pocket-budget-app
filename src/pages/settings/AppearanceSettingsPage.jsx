import React from 'react';
import { Sun, Moon, CheckCircle2 } from 'lucide-react';

export default function AppearanceSettingsPage({ isDarkMode, onToggleDarkMode }) {
  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="ios-card">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          {/* Light Mode Card */}
          <div
            onClick={() => { if (isDarkMode) onToggleDarkMode(); }}
            style={{
              padding: '20px 16px',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${!isDarkMode ? 'var(--ios-blue)' : 'var(--border-subtle)'}`,
              background: !isDarkMode ? 'var(--ios-blue-bg)' : 'var(--bg-card-subtle)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease',
              boxShadow: !isDarkMode ? '0 4px 14px rgba(37, 99, 235, 0.15)' : 'none'
            }}
          >
            {!isDarkMode && (
              <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <CheckCircle2 size={16} color="var(--ios-blue)" />
              </div>
            )}
            <Sun size={32} color="var(--ios-orange)" />
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Light Mode
            </span>
          </div>

          {/* Dark Mode Card */}
          <div
            onClick={() => { if (!isDarkMode) onToggleDarkMode(); }}
            style={{
              padding: '20px 16px',
              borderRadius: 'var(--radius-lg)',
              border: `2px solid ${isDarkMode ? 'var(--ios-blue)' : 'var(--border-subtle)'}`,
              background: isDarkMode ? 'var(--ios-blue-bg)' : 'var(--bg-card-subtle)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer',
              position: 'relative',
              transition: 'all 0.2s ease',
              boxShadow: isDarkMode ? '0 4px 14px rgba(37, 99, 235, 0.15)' : 'none'
            }}
          >
            {isDarkMode && (
              <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <CheckCircle2 size={16} color="var(--ios-blue)" />
              </div>
            )}
            <Moon size={32} color="var(--ios-blue)" />
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Dark Mode
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
