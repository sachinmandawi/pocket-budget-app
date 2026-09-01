import React from 'react';
import { Menu } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  return (
    <div className="app-header-wrapper">
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={onToggleSidebar}
            style={{
              width: '30px',
              height: '30px',
              padding: 0,
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
              border: '1px solid var(--border-medium)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-primary)',
              flexShrink: 0
            }}
            title="Navigation Menu"
          >
            <Menu size={14} />
          </button>

          <span style={{
            fontSize: '15px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            letterSpacing: '-0.3px',
            lineHeight: 1
          }}>
            Pocket Budget
          </span>
        </div>
      </header>
    </div>
  );
}
