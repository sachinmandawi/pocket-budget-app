import React from 'react';
import { 
  X, 
  LayoutDashboard, 
  ReceiptText, 
  Clock, 
  Flame, 
  BarChart3, 
  Settings,
  Calendar,
  Tags,
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

  const navSections = [
    {
      title: 'MAIN OVERVIEW',
      items: [
        {
          id: 'tab_daily',
          type: 'tab',
          target: 'daily',
          label: 'Daily Dashboard',
          icon: <LayoutDashboard size={18} color="var(--ios-blue)" />
        },
        {
          id: 'tab_expenses',
          type: 'tab',
          target: 'expenses',
          label: 'Expenses Log',
          icon: <ReceiptText size={18} color="var(--ios-blue)" />
        }
      ]
    },
    {
      title: 'SAVINGS & VAULTS',
      items: [
        {
          id: 'page_piggy_bank',
          type: 'page',
          target: 'piggy_bank',
          label: 'Piggy Savings',
          icon: <span style={{ fontSize: '16px' }}>🐷</span>
        },
        {
          id: 'page_allowance_countdown',
          type: 'page',
          target: 'allowance_countdown',
          label: 'Next Payday Clock',
          icon: <Clock size={18} color="var(--ios-blue)" />
        },
        {
          id: 'tab_cooloff',
          type: 'tab',
          target: 'cooloff',
          label: 'Shopping Wishlist',
          icon: <Flame size={18} color="var(--ios-orange)" />
        }
      ]
    },
    {
      title: 'CONFIGURATION & ANALYTICS',
      items: [
        {
          id: 'page_settings_allowance',
          type: 'page',
          target: 'settings_allowance',
          label: 'Pocket Money & Payday',
          icon: <Calendar size={18} color="var(--ios-blue)" />
        },
        {
          id: 'page_settings_categories',
          type: 'page',
          target: 'settings_categories',
          label: 'Category Manager',
          icon: <Tags size={18} color="var(--ios-blue)" />
        },
        {
          id: 'tab_analytics',
          type: 'tab',
          target: 'analytics',
          label: 'Expense Summary',
          icon: <BarChart3 size={18} color="var(--ios-green)" />
        },
        {
          id: 'page_settings_main',
          type: 'page',
          target: 'settings_main',
          label: 'All Settings & Reset',
          icon: <Settings size={18} color="var(--ios-blue)" />
        }
      ]
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
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Sliding Minimalist Left Drawer */}
      <aside style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '280px',
        maxWidth: '82vw',
        background: 'var(--bg-card)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10001,
        animation: 'slideInLeft 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        borderRight: '1px solid var(--border-subtle)'
      }}>
        {/* Drawer Header Branding with Native Android Status Bar Safe Area Padding */}
        <div style={{
          paddingTop: 'calc(max(28px, env(safe-area-inset-top)) + 12px)',
          paddingBottom: '16px',
          paddingLeft: '18px',
          paddingRight: '18px',
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
              style={{ width: '36px', height: '36px', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
            />
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
                Pocket Budget
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0, fontWeight: 600 }}>
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
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Items Scroll Container (Concept 1: Grouped Sectional Categories) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>
          {navSections.map((section, idx) => (
            <div key={section.title} style={{ marginBottom: idx === navSections.length - 1 ? '0' : '18px' }}>
              {/* Section Header Title */}
              <p style={{
                fontSize: '10px',
                fontWeight: 800,
                color: 'var(--text-tertiary)',
                letterSpacing: '0.6px',
                margin: '0 0 6px 6px',
                textTransform: 'uppercase'
              }}>
                {section.title}
              </p>

              {/* Section Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {section.items.map(item => {
                  const active = isItemActive(item);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '9px 12px',
                        borderRadius: 'var(--radius-md)',
                        background: active ? 'var(--ios-blue-bg)' : 'transparent',
                        border: active ? '1px solid var(--ios-blue)' : '1px solid transparent',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          background: active ? '#ffffff' : 'var(--bg-card-subtle)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          {item.icon}
                        </div>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: active ? 800 : 700,
                          color: active ? 'var(--ios-blue)' : 'var(--text-primary)'
                        }}>
                          {item.label}
                        </span>
                      </div>

                      <ChevronRight size={15} color={active ? 'var(--ios-blue)' : 'var(--text-tertiary)'} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer Status */}
        <div style={{
          padding: '12px 16px',
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
