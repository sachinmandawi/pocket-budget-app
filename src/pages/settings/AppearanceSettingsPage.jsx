import React from 'react';
import { ArrowLeft, Sun, Moon } from 'lucide-react';

export default function AppearanceSettingsPage({ isDarkMode, onToggleDarkMode, onBack }) {
  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="ios-card">
        <label className="form-label" style={{ marginBottom: '14px' }}>Select Theme Mode</label>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div
            onClick={() => { if (isDarkMode) onToggleDarkMode(); }}
            style={{
              padding: '20px 16px',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${!isDarkMode ? 'var(--ios-blue)' : 'var(--border-subtle)'}`,
              background: !isDarkMode ? 'var(--ios-blue-bg)' : 'var(--bg-card-subtle)',
              color: !isDarkMode ? 'var(--ios-blue)' : 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Sun size={28} color="var(--ios-orange)" />
            <span style={{ fontSize: '15px', fontWeight: 800 }}>☀️ Light Mode</span>
          </div>

          <div
            onClick={() => { if (!isDarkMode) onToggleDarkMode(); }}
            style={{
              padding: '20px 16px',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${isDarkMode ? 'var(--ios-blue)' : 'var(--border-subtle)'}`,
              background: isDarkMode ? 'var(--ios-blue-bg)' : 'var(--bg-card-subtle)',
              color: isDarkMode ? 'var(--ios-blue)' : 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Moon size={28} color="var(--ios-blue)" />
            <span style={{ fontSize: '15px', fontWeight: 800 }}>🌙 Dark Mode</span>
          </div>
        </div>
      </div>
    </div>
  );
}
