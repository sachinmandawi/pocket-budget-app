import React from 'react';
import { 
  X, 
  LayoutDashboard, 
  ReceiptText, 
  Clock, 
  Flame, 
  BarChart3, 
  Settings,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ 
  isOpen, 
  onClose, 
  activeTab, 
  activeSettingPage, 
  onNavigateTab, 
  onNavigateSettingPage 
}) {
  if (!isOpen) return null;

  const mainNavItems = [
    {
      id: 'tab_daily',
      type: 'tab',
      target: 'daily',
      label: 'Daily Dashboard',
      subtitle: 'Safe daily spend gauge & status',
      icon: <LayoutDashboard size={20} color="var(--ios-blue)" />
    },
    {
      id: 'tab_expenses',
      type: 'tab',
      target: 'expenses',
      label: 'Expenses Log',
      subtitle: 'Date-wise transaction history',
      icon: <ReceiptText size={20} color="var(--ios-blue)" />
    },
    {
      id: 'page_allowance_countdown',
      type: 'page',
      target: 'allowance_countdown',
      label: 'Allowance Countdown',
      subtitle: 'Digital clock & month cycle stats',
      icon: <Clock size={20} color="var(--ios-blue)" />
    },
    {
      id: 'page_piggy_bank',
      type: 'page',
      target: 'piggy_bank',
      label: 'Piggy Bank Vault',
      subtitle: 'Date-by-date leftover savings log',
      icon: <span style={{ fontSize: '18px' }}>🐷</span>
    },
    {
      id: 'tab_cooloff',
      type: 'tab',
      target: 'cooloff',
      label: 'Cool-Off Wishlist',
      subtitle: 'Impulse spend 24h delay list',
      icon: <Flame size={20} color="var(--ios-orange)" />
    },
    {
      id: 'tab_analytics',
      type: 'tab',
      target: 'analytics',
      label: 'Analytics & Insights',
      subtitle: 'Category graphs & health score',
      icon: <BarChart3 size={20} color="var(--ios-green)" />
    }
  ];

  const settingsNavItems = [
    {
      id: 'page_settings_main',
      type: 'page',
      target: 'settings_main',
      label: 'Settings',
      subtitle: 'Allowance, Sync, Reminder, Categories, Theme',
      icon: <Settings size={20} color="var(--ios-blue)" />
    }
  ];

  const handleItemClick = (item) => {
    onClose();
    if (item.type === 'tab') {
      onNavigateTab(item.target);
    } else if (item.type === 'page') {
      onNavigateSettingPage(item.target);
    }
  };

  const isItemActive = (item) => {
    if (item.type === 'tab') {
      return !activeSettingPage && activeTab === item.target;
    }
    return activeSettingPage === item.target || (item.target === 'settings_main' && activeSettingPage && activeSettingPage.startsWith('settings_'));
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }}>
      {/* Dark Backdrop Overlay */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Sliding Glassmorphic Left Drawer Content */}
      <aside style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '300px',
        maxWidth: '85vw',
        background: 'var(--bg-card)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10001,
        animation: 'slideInLeft 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        borderRight: '1px solid var(--border-subtle)'
      }}>
        {/* Drawer Header Branding */}
        <div style={{
          padding: '20px 18px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-card-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src="./app-icon.png" 
              alt="Pocket Budget Logo" 
              style={{ width: '38px', height: '38px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
                Pocket Budget
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                Smart Expense Tracker
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-card-subtle)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items Scroll Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
          {/* Main Navigation Section */}
          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '0 8px',
            marginBottom: '8px',
            display: 'block'
          }}>
            Main Navigation
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '20px' }}>
            {mainNavItems.map(item => {
              const active = isItemActive(item);
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: active ? 'var(--ios-blue-bg)' : 'transparent',
                    border: active ? '1px solid var(--ios-blue)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: active ? '#ffffff' : 'var(--bg-card-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: active ? 800 : 700,
                        color: active ? 'var(--ios-blue)' : 'var(--text-primary)',
                        margin: 0
                      }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ChevronRight size={16} color={active ? 'var(--ios-blue)' : 'var(--text-tertiary)'} />
                </div>
              );
            })}
          </div>

          {/* Settings & Control Section */}
          <span style={{
            fontSize: '10px',
            fontWeight: 800,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            padding: '0 8px',
            marginBottom: '8px',
            display: 'block'
          }}>
            Settings & Controls
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {settingsNavItems.map(item => {
              const active = isItemActive(item);
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: active ? 'var(--ios-blue-bg)' : 'transparent',
                    border: active ? '1px solid var(--ios-blue)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '10px',
                      background: active ? '#ffffff' : 'var(--bg-card-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: active ? 800 : 700,
                        color: active ? 'var(--ios-blue)' : 'var(--text-primary)',
                        margin: 0
                      }}>
                        {item.label}
                      </p>
                      <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ChevronRight size={16} color={active ? 'var(--ios-blue)' : 'var(--text-tertiary)'} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Drawer Footer Status */}
        <div style={{
          padding: '14px 18px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-card-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            Pocket Budget v1.0.0
          </span>
          <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--ios-green)', background: 'var(--ios-green-bg)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
            Active
          </span>
        </div>
      </aside>
    </div>
  );
}
