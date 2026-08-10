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
      id: 'settings_allowance',
      title: 'Allowance & Payday Date',
      subtitle: 'Monthly amount & payday calendar',
      icon: <Wallet size={20} color="var(--ios-blue)" />
    },
    {
      id: 'allowance_countdown',
      title: 'Allowance Credit Countdown',
      subtitle: 'Ticking digital clock & cycle stats',
      icon: <Clock size={20} color="var(--ios-blue)" />
    },
    {
      id: 'piggy_bank',
      title: 'Piggy Bank Savings Vault',
      subtitle: 'Date-by-date leftover savings history',
      icon: <span style={{ fontSize: '18px' }}>🐷</span>
    },
    {
      id: 'settings_reminder',
      title: 'Daily Spend Reminder',
      subtitle: 'Evening alert at 8:00 PM',
      icon: <Bell size={20} color="var(--ios-green)" />
    },
    {
      id: 'settings_categories',
      title: 'Category Manager',
      subtitle: 'Edit custom expense categories',
      icon: <Tag size={20} color="var(--ios-purple)" />
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
      <div style={{ marginBottom: '18px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Settings
        </h2>
      </div>

      <div className="ios-card" style={{ padding: '6px' }}>
        {menuItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => onNavigateSubPage(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 10px',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              borderBottom: index < menuItems.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              transition: 'background 0.15s ease'
            }}
            className="menu-item-hover"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'var(--bg-card-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {item.icon}
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {item.title}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
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
