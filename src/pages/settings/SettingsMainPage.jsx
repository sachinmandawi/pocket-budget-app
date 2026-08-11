import React from 'react';
import { Wallet, Tag, Palette, RefreshCw, ChevronRight, Github, Bell, Clock, Mail } from 'lucide-react';

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

      {/* Premium Developer Support & Feedback Card */}
      <div 
        className="ios-card" 
        style={{ 
          marginTop: '16px', 
          padding: '16px 18px',
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-subtle) 100%)',
          border: '1px solid var(--border-medium)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'var(--ios-blue-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(37, 99, 235, 0.2)'
          }}>
            <Mail size={20} color="var(--ios-blue)" />
          </div>

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
              Developer Support & Feedback
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, fontWeight: 600 }}>
              Made with ❤️ by Sachin Mandavi
            </p>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '14px' }}>
          Have questions, feature requests, or feedback? Reach out directly via Gmail!
        </p>

        <a 
          href="https://mail.google.com/mail/?view=cm&fs=1&to=sachinmandawi@gmail.com&su=Pocket%20Budget%20App%20Feedback"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px',
            fontSize: '13px',
            fontWeight: 800,
            textDecoration: 'none',
            borderRadius: 'var(--radius-full)'
          }}
        >
          <Mail size={16} /> Open in Gmail: sachinmandawi@gmail.com
        </a>
      </div>
    </div>
  );
}
