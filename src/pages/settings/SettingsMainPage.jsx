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

  const reminder = budgetData?.reminderSettings || { enabled: true, time: '20:00' };
  
  const formatTime12h = (timeStr) => {
    if (!timeStr) return '8:00 PM';
    const [hStr, mStr] = timeStr.split(':');
    const h = parseInt(hStr || '20', 10);
    const m = parseInt(mStr || '0', 10);
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const minFormatted = String(m).padStart(2, '0');
    return `${hour12}:${minFormatted} ${ampm}`;
  };

  const reminderSubtitle = reminder.enabled !== false 
    ? `Daily alert at ${formatTime12h(reminder.time)}`
    : 'Reminder is turned off';

  const menuItems = [
    {
      id: 'settings_currency',
      title: 'Currency & Region',
      subtitle: `${currentCurr.flag} ${currentCurr.code} (${currentCurr.symbol}) • ${currentCurr.country}`,
      icon: <Globe size={20} color="var(--text-secondary)" />
    },
    {
      id: 'settings_github',
      title: 'GitHub Cloud Sync',
      subtitle: 'Private database backup & local export',
      icon: <Github size={20} color="var(--text-secondary)" />
    },
    {
      id: 'settings_reminder',
      title: 'Daily Spend Reminder',
      subtitle: reminderSubtitle,
      icon: <Bell size={20} color="var(--notion-green-text)" />
    },
    {
      id: 'settings_appearance',
      title: 'Appearance & Theme',
      subtitle: 'Light & Dark mode',
      icon: <Palette size={20} color="var(--notion-orange-text)" />
    },
    {
      id: 'settings_reset',
      title: 'Data & Reset',
      subtitle: 'Clear all database state',
      icon: <RefreshCw size={20} color="var(--notion-red-text)" />
    }
  ];

  const handleOpenEmail = (e) => {
    // Direct intent to launch native Gmail / default mail application on mobile & desktop
    window.location.href = "mailto:sachinmandawi@gmail.com?subject=Pocket%20Budget%20App%20Feedback";
  };

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <span style={{ fontSize: '20px' }}>⚙️</span>
        <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          Settings & Preferences
        </h2>
      </div>

      <div className="notion-card" style={{ padding: '6px' }}>
        {menuItems.map((item, index) => (
          <div
            key={item.id}
            onClick={() => onNavigateSubPage(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              borderBottom: index < menuItems.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              transition: 'background 0.12s ease'
            }}
            className="menu-item-hover"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-card-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {item.icon}
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                  {item.title}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
                  {item.subtitle}
                </p>
              </div>
            </div>

            <ChevronRight size={14} color="var(--text-tertiary)" />
          </div>
        ))}

        {/* Check for App Updates Item */}
        <div
          onClick={handleUpdateCheckClick}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: 'var(--radius-sm)',
            cursor: checkingUpdate ? 'wait' : 'pointer',
            borderTop: '1px solid var(--border-subtle)',
            transition: 'background 0.12s ease'
          }}
          className="menu-item-hover"
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-card-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <DownloadCloud size={16} color="var(--text-primary)" />
            </div>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                App Updates
              </p>
              <p style={{ fontSize: '11px', color: updateStatus ? 'var(--notion-green-text)' : 'var(--text-tertiary)', margin: 0, fontWeight: updateStatus ? 600 : 400 }}>
                {checkingUpdate ? 'Checking GitHub...' : updateStatus || `Version ${CURRENT_APP_VERSION} installed`}
              </p>
            </div>
          </div>

          <span className="notion-tag notion-tag-gray">
            {checkingUpdate ? 'Checking...' : 'Check'}
          </span>
        </div>
      </div>

      {/* Developer Support & Feedback Card */}
      <div 
        className="notion-card" 
        style={{ 
          marginTop: '14px', 
          padding: '14px 16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{ fontSize: '18px' }}>💬</span>
          <div>
            <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Developer Support & Feedback
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
              Pocket Budget v{CURRENT_APP_VERSION} • Built by Sachin Mandavi
            </p>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '12px' }}>
          Have ideas, questions, or feedback? Feel free to reach out via Gmail or GitHub.
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <a 
            href="mailto:sachinmandawi@gmail.com?subject=Pocket%20Budget%20App%20Feedback"
            onClick={handleOpenEmail}
            className="btn btn-primary"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              textDecoration: 'none'
            }}
          >
            <Mail size={13} /> Contact via Gmail
          </a>

          <a 
            href="https://github.com/sachinmandawi/pocket-budget-app"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              textDecoration: 'none'
            }}
          >
            <Github size={13} /> GitHub Repo
          </a>
        </div>
      </div>
    </div>
  );
}
