import React, { useState } from 'react';
import { Globe, Palette, RefreshCw, ChevronRight, Github, Bell, Mail, DownloadCloud, CheckCircle2 } from 'lucide-react';
import { DEFAULT_CURRENCY } from '../../utils/currencies';
import { CURRENT_APP_VERSION } from '../../utils/versionCheck';

export default function SettingsMainPage({ onNavigateSubPage, budgetData, onCheckForUpdates }) {
  const currentCurr = budgetData?.currency || DEFAULT_CURRENCY;
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState(null);

  const handleUpdateCheckClick = async () => {
    if (checkingUpdate) return;
    setCheckingUpdate(true);
    setUpdateStatus(null);
    try {
      const res = await onCheckForUpdates?.();
      if (res && !res.hasUpdate) {
        setUpdateStatus('Latest version installed ✅');
        setTimeout(() => setUpdateStatus(null), 3500);
      }
    } catch (e) {
      setUpdateStatus('Check failed');
      setTimeout(() => setUpdateStatus(null), 3000);
    } finally {
      setCheckingUpdate(false);
    }
  };

  const menuItems = [
    {
      id: 'settings_currency',
      title: 'Currency & Region',
      subtitle: `${currentCurr.flag} ${currentCurr.code} (${currentCurr.symbol}) • ${currentCurr.country}`,
      icon: <Globe size={20} color="var(--ios-blue)" />
    },
    {
      id: 'settings_github',
      title: 'GitHub Cloud Sync',
      subtitle: 'Private database backup & local export',
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

  const handleOpenEmail = (e) => {
    // Direct intent to launch native Gmail / default mail application on mobile & desktop
    window.location.href = "mailto:sachinmandawi@gmail.com?subject=Pocket%20Budget%20App%20Feedback";
  };

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

        {/* Check for App Updates Item */}
        <div
          onClick={handleUpdateCheckClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 10px',
            borderRadius: 'var(--radius-md)',
            cursor: checkingUpdate ? 'wait' : 'pointer',
            borderTop: '1px solid var(--border-subtle)',
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
              <DownloadCloud size={20} color="var(--ios-blue)" />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                App Updates
              </p>
              <p style={{ fontSize: '11px', color: updateStatus ? 'var(--ios-green)' : 'var(--text-secondary)', margin: 0, fontWeight: updateStatus ? 700 : 500 }}>
                {checkingUpdate ? 'Checking GitHub...' : updateStatus || `Version ${CURRENT_APP_VERSION} installed`}
              </p>
            </div>
          </div>

          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            color: 'var(--ios-blue)',
            background: 'var(--ios-blue-bg)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            {checkingUpdate ? 'Checking...' : 'Check'}
          </span>
        </div>
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
              Pocket Budget v{CURRENT_APP_VERSION} • Made with ❤️ by Sachin Mandavi
            </p>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '14px' }}>
          Have questions, feature requests, or feedback? Reach out directly via Gmail!
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <a 
            href="mailto:sachinmandawi@gmail.com?subject=Pocket%20Budget%20App%20Feedback"
            onClick={handleOpenEmail}
            className="btn btn-primary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 800,
              textDecoration: 'none',
              borderRadius: 'var(--radius-full)'
            }}
          >
            <Mail size={14} /> Contact via Gmail
          </a>

          <a 
            href="https://github.com/sachinmandawi/pocket-budget-app"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 800,
              textDecoration: 'none',
              borderRadius: 'var(--radius-full)'
            }}
          >
            <Github size={14} /> GitHub Repo
          </a>
        </div>
      </div>
    </div>
  );
}
