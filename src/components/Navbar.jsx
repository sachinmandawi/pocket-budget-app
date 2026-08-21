import React from 'react';
import { Menu } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  return (
    <div className="app-header-wrapper">
      <header className="app-header">
        {/* Brand Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Hamburger Menu Button */}
          <button 
            type="button"
            onClick={onToggleSidebar}
            className="btn btn-secondary btn-sm"
            style={{ width: '32px', height: '32px', padding: 0, borderRadius: 'var(--radius-sm)' }}
            title="Open Navigation Menu"
          >
            <Menu size={16} color="var(--text-primary)" />
          </button>

          <h1 
            style={{ 
              fontSize: '16px', 
              fontWeight: 600, 
              color: 'var(--text-primary)', 
              letterSpacing: '-0.3px',
              margin: 0,
              lineHeight: 1
            }}
          >
            Pocket Budget
          </h1>
        </div>
      </header>
    </div>
  );
}
