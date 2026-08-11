import React from 'react';
import { Wallet, Tag, Palette, RefreshCw, ChevronRight, Github, Bell, Clock } from 'lucide-react';

export default function SettingsMainPage({ onNavigateSubPage }) {
  const menuItems = [
    {
      id: 'settings_github',
      title: 'GitHub Cloud Sync',
      subtitle: 'sachinmandawi/pocket-budget-db',
      icon: <Github size={20} color="var(--ios-blue)" />
    },
    {
      id: 'settings_reminder',
      title: 'Daily Spend Reminder',
      subtitle: 'Evening alert at 8:00 PM',
      icon: <Bell size={20} color="var(--ios-green)" />
    },
    {
      id: 'settings_appearance',
      title: 'Appearance & Theme',
      subtitle: 'Light & Dark mode',
      icon: <Palette size={20} color="var(--ios-orange)" />
    },
    {
      id: 'settings_reset',
      title: 'Data & Reset',
      subtitle: 'Clear all database state',
      icon: <RefreshCw size={20} color="var(--ios-red)" />
    }
  ];

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ marginBottom: '14px' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>
          Settings
        </h2>
      </div>

      <div className="ios-card" style={{ padding: '4px' }}>
        {menuItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => onNavigateSubPage(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 10px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              borderBottom: index < menuItems.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              transition: 'background 0.15s ease'
            }}
            className="menu-item-hover"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'var(--bg-card-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {item.icon}
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  {item.title}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                  {item.subtitle}
                </p>
              </div>
            </div>

            <ChevronRight size={18} color="var(--text-tertiary)" />
          </div>
        ))}
      </div>
    </div>
  );
}
