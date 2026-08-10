import React from 'react';
import { Settings, Menu } from 'lucide-react';

export default function Navbar({ activeSettingPage, onOpenSettings, onOpenSettingsPage, onBackToApp, onToggleSidebar }) {
  const getHeaderTitle = () => {
    switch (activeSettingPage) {
      case 'settings_main': return 'Settings';
      case 'settings_github': return 'GitHub Sync';
      case 'settings_allowance': return 'Allowance & Payday';
      case 'allowance_countdown': return 'Allowance Countdown';
      case 'piggy_bank': return 'Piggy Bank Vault';
      case 'settings_reminder': return 'Daily Spend Reminder';
      case 'settings_categories': return 'Categories';
      case 'settings_appearance': return 'Appearance';
      case 'settings_reset': return 'Data Reset';
      default: return 'PocketBudget';
    }
  };

  const handleSettingsClick = () => {
    if (onOpenSettings) {
      onOpenSettings('settings_main');
    } else if (onOpenSettingsPage) {
      onOpenSettingsPage('settings_main');
    }
  };

  return (
    <div className="app-header-wrapper">
      <header className="app-header">
        {/* Brand / Back Header Left Section */}
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
            alt="PocketBudget" 
            onClick={handleSettingsClick}
            style={{ width: '34px', height: '34px', borderRadius: '10px', objectFit: 'contain', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', cursor: 'pointer' }} 
          />

          <h1 
            onClick={activeSettingPage ? null : handleSettingsClick}
            style={{ 
              fontSize: '18px', 
              fontWeight: 800, 
              color: 'var(--text-primary)', 
              letterSpacing: '-0.5px',
              margin: 0,
              lineHeight: 1,
              cursor: activeSettingPage ? 'default' : 'pointer'
            }}
          >
            {getHeaderTitle()}
          </h1>
        </div>

        {/* Header Right Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        </div>
      </header>
    </div>
  );
}
