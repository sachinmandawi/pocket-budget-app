import React from 'react';
import { ArrowLeft, Sun, Moon } from 'lucide-react';

export default function AppearanceSettingsPage({ isDarkMode, onToggleDarkMode, onBack }) {
  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <button onClick={onBack} className="btn btn-secondary btn-sm" style={{ width: '36px', height: '36px', padding: 0 }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Appearance & Theme
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Choose Light Mode or Dark Mode
          </p>
        </div>
      </div>

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
