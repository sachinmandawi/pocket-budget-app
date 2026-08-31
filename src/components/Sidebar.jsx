import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
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
import { CURRENT_APP_VERSION } from '../utils/versionCheck';

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
          icon: <LayoutDashboard size={18} color="var(--text-secondary)" />
        },
        {
          id: 'tab_expenses',
          type: 'tab',
          target: 'expenses',
          label: 'Expenses Log',
          icon: <ReceiptText size={18} color="var(--text-secondary)" />
        },
        {
          id: 'tab_udhaar',
          type: 'tab',
          target: 'udhaar',
          label: 'Loans & Debts',
          icon: <span style={{ fontSize: '16px' }}>🤝</span>
        }
      ]
    },
    {
      title: 'SAVINGS',
      items: [
        {
          id: 'page_piggy_bank',
          type: 'page',
          target: 'piggy_bank',
          label: 'Piggy Bank',
          icon: <span style={{ fontSize: '16px' }}>🐷</span>
        },
        {
          id: 'page_allowance_countdown',
          type: 'page',
          target: 'allowance_countdown',
          label: 'Pocket Money Clock',
          icon: <Clock size={18} color="var(--text-secondary)" />
        },
        {
          id: 'tab_cooloff',
          type: 'tab',
          target: 'cooloff',
          label: 'Shopping Wishlist',
          icon: <Flame size={18} color="var(--notion-orange-text)" />
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
          icon: <Calendar size={18} color="var(--text-secondary)" />
        },
        {
          id: 'page_settings_categories',
          type: 'page',
          target: 'settings_categories',
          label: 'Category Manager',
          icon: <Tags size={18} color="var(--text-secondary)" />
        },
        {
          id: 'tab_analytics',
          type: 'tab',
          target: 'analytics',
          label: 'Expense Summary',
          icon: <BarChart3 size={18} color="var(--notion-green-text)" />
        },
        {
          id: 'page_settings_main',
          type: 'page',
          target: 'settings_main',
          label: 'All Settings & Reset',
          icon: <Settings size={18} color="var(--text-secondary)" />
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
    if (item.target === activeSettingPage) {
      return true;
    }
    if (item.target === 'settings_main') {
      const mainSubPages = ['settings_github', 'settings_reminder', 'settings_appearance', 'settings_reset'];
      return mainSubPages.includes(activeSettingPage);
    }
    return false;
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 10000,
        overflow: 'hidden'
      }}
    >
      {/* Neutral Backdrop Overlay */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.45)',
          animation: 'fadeIn 0.2s ease-out'
        }}
      />

      {/* Sliding Navigation Sidebar */}
      <aside style={{
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        width: '280px',
        maxWidth: '82vw',
        background: 'var(--bg-card)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10001,
        animation: 'slideInLeft 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        borderRight: '1px solid var(--border-subtle)',
        boxShadow: '4px 0 24px rgba(0, 0, 0, 0.25)',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}>
        {/* Workspace Header */}
        <div style={{
          paddingTop: 'calc(max(28px, env(safe-area-inset-top)) + 12px)',
          paddingBottom: '12px',
          paddingLeft: '14px',
          paddingRight: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src="./app-icon.png" 
              alt="Pocket Budget" 
              style={{ 
                width: '30px', 
                height: '30px', 
                borderRadius: '8px', 
                objectFit: 'contain',
                flexShrink: 0
              }} 
            />
            <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--text-primary)', lineHeight: 1 }}>
              Pocket Budget
            </h3>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)'
            }}
            title="Collapse Sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        {/* Navigation Items Tree */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          {navSections.map((section, idx) => (
            <div key={section.title} style={{ marginBottom: idx === navSections.length - 1 ? '0' : '14px' }}>
              {/* Section Header Title */}
              <p style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--text-tertiary)',
                letterSpacing: '0.4px',
                margin: '0 0 4px 6px',
                textTransform: 'uppercase'
              }}>
                {section.title}
              </p>

              {/* Section Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
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
                        padding: '6px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: active ? 'var(--notion-gray-bg)' : 'transparent',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        transition: 'background-color 0.12s ease'
                      }}
                      className="menu-item-hover"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', flexShrink: 0 }}>
                          {item.icon}
                        </span>
                        <span style={{
                          fontSize: '13px',
                          fontWeight: active ? 600 : 500,
                          color: 'var(--text-primary)'
                        }}>
                          {item.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer Version Info */}
        <div style={{
          padding: '10px 14px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
            Pocket Budget v{CURRENT_APP_VERSION}
          </span>
        </div>
      </aside>
    </div>
  );
}
