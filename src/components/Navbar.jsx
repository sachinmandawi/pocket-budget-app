import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';

export default function Navbar({ activeSettingPage, onOpenSettings, onBackToApp }) {
  const getHeaderTitle = () => {
    switch (activeSettingPage) {
      case 'settings_main': return 'Settings';
      case 'settings_github': return 'GitHub Sync';
      case 'settings_allowance': return 'Allowance & Payday';
      case 'settings_categories': return 'Categories';
      case 'settings_appearance': return 'Appearance';
      case 'settings_reset': return 'Data Reset';
      default: return 'PocketBudget';
    }
  };

  return (
    <div className="app-header-wrapper">
      <header className="app-header">
        {/* Brand / Back Header Left Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {activeSettingPage ? (
            <button 
              onClick={onBackToApp} 
              className="btn btn-secondary btn-sm" 
              style={{ width: '36px', height: '36px', padding: 0 }}
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <img 
              src="/app-icon.png" 
              alt="PocketBudget" 
              style={{ width: '34px', height: '34px', borderRadius: '10px', objectFit: 'contain', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }} 
            />
          )}

          <h1 style={{ 
            fontSize: '18px', 
            fontWeight: 800, 
            color: 'var(--text-primary)', 
            letterSpacing: '-0.5px',
            margin: 0,
            lineHeight: 1
          }}>
            {getHeaderTitle()}
          </h1>
        </div>

        {/* Action Button Right Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!activeSettingPage && (
            <button
              onClick={onOpenSettings}
              className="btn btn-secondary btn-sm"
              style={{ width: '36px', height: '36px', padding: 0 }}
              title="Settings"
            >
              <Settings size={18} color="var(--text-secondary)" />
            </button>
          )}
        </div>
      </header>
    </div>
  );
}
