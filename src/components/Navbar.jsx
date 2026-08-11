import React from 'react';
import { Menu } from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  return (
    <div className="app-header-wrapper">
      <header className="app-header">
        {/* Brand / Left Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Hamburger Menu Button for Left Drawer Sidebar */}
          <button 
            type="button"
            onClick={onToggleSidebar}
            className="btn btn-secondary btn-sm"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '10px' }}
            title="Open Navigation Menu"
          >
            <Menu size={18} color="var(--ios-blue)" />
          </button>

          <img 
            src="./app-icon.png" 
            alt="Pocket Budget Logo" 
            style={{ width: '28px', height: '28px', borderRadius: '7px' }}
          />

          <h1 
            style={{ 
              fontSize: '18px', 
              fontWeight: 800, 
              color: 'var(--text-primary)', 
              letterSpacing: '-0.5px',
              margin: 0,
              lineHeight: 1
            }}
          >
            Pocket Budget
          </h1>
        </div>

        {/* Header Right Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        </div>
      </header>
    </div>
  );
}
