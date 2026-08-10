import React from 'react';
import { Settings, ShieldAlert, ArrowLeft } from 'lucide-react';

export default function Navbar({ 
  onOpenSettingsPage, 
  isFastBurn, 
  activeSettingPage,
  onBackToApp
}) {
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
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '11px',
              background: 'var(--bg-card-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-ios)'
            }}>
              <img 
                src="/app-icon.png" 
                alt="PocketBudget" 
                style={{ width: '26px', height: '26px', objectFit: 'contain' }} 
              />
            </div>
          )}

          <h1 style={{ 
            fontSize: '18px', 
            fontWeight: 800, 
            color: 'var(--text-primary)', 
            letterSpacing: '-0.5px',
            margin: 0,
            lineHeight: 1
          }}>
            {activeSettingPage ? 'Settings' : 'PocketBudget'}
          </h1>
        </div>

        {/* Header Right Action Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isFastBurn && !activeSettingPage && (
            <span style={{
              background: 'var(--ios-red-bg)',
              color: 'var(--ios-red)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <ShieldAlert size={13} /> Burn Alert
            </span>
          )}

          {/* Settings Gear Icon Button */}
          <button 
            onClick={() => onOpenSettingsPage('settings_main')}
            className="btn btn-secondary btn-sm"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
            title="Settings"
          >
            <Settings size={19} color={activeSettingPage ? 'var(--ios-blue)' : 'var(--text-primary)'} />
          </button>
        </div>
      </header>
    </div>
  );
}
