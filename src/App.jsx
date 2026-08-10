import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import QuickAddExpense from './components/QuickAddExpense';
import SplashScreen from './components/SplashScreen';

import DailyPage from './pages/DailyPage';
import ExpensesPage from './pages/ExpensesPage';
import CooloffPage from './pages/CooloffPage';
import AnalyticsPage from './pages/AnalyticsPage';

import SettingsMainPage from './pages/settings/SettingsMainPage';
import AllowanceSettingsPage from './pages/settings/AllowanceSettingsPage';
import CategoriesSettingsPage from './pages/settings/CategoriesSettingsPage';
import AppearanceSettingsPage from './pages/settings/AppearanceSettingsPage';
import DataResetSettingsPage from './pages/settings/DataResetSettingsPage';
import GithubSyncSettingsPage from './pages/settings/GithubSyncSettingsPage';
import ReminderSettingsPage from './pages/settings/ReminderSettingsPage';

import { getInitialData, saveData, calculateBudgetStats } from './utils/storage';
import { pushToGitHub, pullFromGitHub, getGitHubConfig } from './utils/githubSync';
import { App as CapApp } from '@capacitor/app';
import { LayoutDashboard, ReceiptText, Clock, BarChart3, LogOut, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [data, setData] = useState(() => getInitialData());

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);
  const [splashFadeOut, setSplashFadeOut] = useState(false);

  const [activeTab, setActiveTab] = useState('daily');
  const [activeSettingPage, setActiveSettingPage] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Double Back To Exit State
  const [showExitToast, setShowExitToast] = useState(false);
  const [isAppExited, setIsAppExited] = useState(false);
  const lastBackPressRef = useRef(0);

  // Native Capacitor APK & Web Hardware Back Button Handler
  useEffect(() => {
    let capListenerHandle = null;

    const handleBackAction = () => {
      if (isQuickAddOpen) {
        setIsQuickAddOpen(false);
        return;
      }
      if (activeSettingPage) {
        if (activeSettingPage !== 'settings_main') {
          setActiveSettingPage('settings_main');
        } else {
          setActiveSettingPage(null);
        }
        return;
      }
      if (activeTab !== 'daily') {
        setActiveTab('daily');
        return;
      }

      // Home Daily Tab: Double Back to Exit
      const now = Date.now();
      if (now - lastBackPressRef.current < 2000) {
        setShowExitToast(false);
        try {
          CapApp.exitApp();
        } catch (err) {
          setIsAppExited(true);
        }
      } else {
        lastBackPressRef.current = now;
        setShowExitToast(true);
        try {
          window.history.pushState({ page: 'home' }, '');
        } catch (e) {}
        setTimeout(() => {
          setShowExitToast(false);
        }, 2000);
      }
    };

    // 1. Native Capacitor Hardware Back Button Listener (Android APK)
    const initCapacitorBackButton = async () => {
      try {
        capListenerHandle = await CapApp.addListener('backButton', () => {
          handleBackAction();
        });
      } catch (e) {}
    };

    initCapacitorBackButton();

    // 2. Web Browser Popstate Listener (Fallback for PWA & Web)
    const handlePopState = () => {
      handleBackAction();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (capListenerHandle && capListenerHandle.remove) {
        capListenerHandle.remove();
      }
    };
  }, [isQuickAddOpen, activeSettingPage, activeTab]);

  // Push state to history stack on sub-view open
  useEffect(() => {
    if (isQuickAddOpen || activeSettingPage || activeTab !== 'daily') {
      try {
        window.history.pushState({ isModal: isQuickAddOpen, page: activeSettingPage, tab: activeTab }, '');
      } catch (e) {}
    }
  }, [isQuickAddOpen, activeSettingPage, activeTab]);

  // Cloudflare Worker 1-Click GitHub OAuth Hash Listener
  useEffect(() => {
    if (window.location.hash && window.location.hash.includes('oauth_token=')) {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const token = hashParams.get('oauth_token');
        if (token && token.length > 15) {
          fetchGitHubUser(token).then(username => {
            if (username) {
              const config = getGitHubConfig();
              saveGitHubConfig({
                ...config,
                token: token.trim(),
                owner: username,
                repo: 'pocket-budget-db'
              });
              window.history.replaceState(null, null, window.location.pathname);
            }
          });
        }
      } catch (e) {}
    }
  }, []);

  // Splash Screen 2-second timer & Instant App Notification Permission Prompt
  useEffect(() => {
    const initNotificationPermissions = async () => {
      try {
        await LocalNotifications.requestPermissions();
      } catch (e) {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
          Notification.requestPermission().catch(() => {});
        }
      }
    };

    const fadeTimer = setTimeout(() => {
      setSplashFadeOut(true);
    }, 1600);

    const hideTimer = setTimeout(() => {
      setShowSplash(false);
      initNotificationPermissions();
    }, 2100);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  // Toggle Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  // Save to localStorage & Auto Sync to GitHub Private Repo
  useEffect(() => {
    saveData(data);
    const config = getGitHubConfig();
    if (config.autoSync && config.token && config.repo) {
      const timer = setTimeout(() => {
        pushToGitHub(data).catch(() => {});
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [data]);

  // On App Mount, Pull latest data from GitHub if available
  useEffect(() => {
    const config = getGitHubConfig();
    if (config.token && config.repo) {
      pullFromGitHub().then(res => {
        if (res.success && res.data) {
          setData(res.data);
        }
      }).catch(() => {});
    }
  }, []);

  const stats = calculateBudgetStats(data);

  const handleOpenSettingsPage = (pageName = 'settings_main') => {
    setActiveSettingPage(pageName);
  };

  const handleBackToApp = () => {
    if (activeSettingPage === 'settings_main') {
      setActiveSettingPage(null);
    } else {
      setActiveSettingPage('settings_main');
    }
  };

  const handleAddExpense = (newExpense) => {
    const updated = {
      ...data,
      transactions: [
        { id: 'tx-' + Date.now(), ...newExpense },
        ...(data.transactions || [])
      ]
    };
    setData(updated);
  };

  const handleDeleteTransaction = (id) => {
    const updated = {
      ...data,
      transactions: data.transactions.filter(tx => tx.id !== id)
    };
    setData(updated);
  };

  const handleAddWishItem = (item) => {
    setData({
      ...data,
      wishlist: [...(data.wishlist || []), item]
    });
  };

  const handleDeleteWishItem = (id) => {
    setData({
      ...data,
      wishlist: (data.wishlist || []).filter(w => w.id !== id)
    });
  };

  const handleToggleEmergencyLock = () => {
    setData({
      ...data,
      isEmergencyUnlocked: !data.isEmergencyUnlocked
    });
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset app database to 0 state?')) {
      const freshData = {
        monthlyAllowance: 0,
        paydayAnchorDate: 1,
        emergencyReserve: 0,
        isEmergencyUnlocked: false,
        fixedDeductions: [],
        categories: data.categories,
        archivedCycles: [],
        transactions: [],
        wishlist: []
      };
      saveData(freshData);
      setData(freshData);
      pushToGitHub(freshData).catch(() => {});
    }
  };

  // Full Screen Exit Overlay for Web Browser Mode
  if (isAppExited) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'var(--bg-app)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '20px',
          background: 'var(--ios-green-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '16px'
        }}>
          <CheckCircle2 size={36} color="var(--ios-green)" />
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
          App Closed Successfully
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          On mobile APK / PWA, the app exits to your phone home screen.
        </p>
        <button 
          onClick={() => setIsAppExited(false)} 
          className="btn btn-primary"
        >
          Re-Open App
        </button>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* App Opening Splash Screen */}
      {showSplash && <SplashScreen fadeOut={splashFadeOut} />}

      {/* Double Back to Exit Native Android Toast Notification */}
      {showExitToast && (
        <div style={{
          position: 'fixed',
          bottom: '85px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.92)',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: 'var(--radius-full)',
          fontSize: '13px',
          fontWeight: 700,
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          whiteSpace: 'nowrap'
        }}>
          <LogOut size={14} color="var(--ios-orange)" />
          <span>Press back again to exit</span>
        </div>
      )}

      {/* iOS Minimalist Navbar */}
      <Navbar 
        onOpenSettings={() => handleOpenSettingsPage('settings_main')}
        onOpenSettingsPage={() => handleOpenSettingsPage('settings_main')}
        onResetDemo={handleResetDemo}
        isFastBurn={stats.isFastBurn}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        activeSettingPage={activeSettingPage}
        onBackToApp={handleBackToApp}
      />

      {/* Main Separate Page View Area */}
      <main>
        {/* SETTINGS SUB-PAGES ROUTING */}
        {activeSettingPage === 'settings_main' && (
          <SettingsMainPage 
            onNavigateSubPage={setActiveSettingPage}
          />
        )}

        {activeSettingPage === 'settings_github' && (
          <GithubSyncSettingsPage 
            budgetData={data}
            onUpdateBudgetData={setData}
            onBack={() => setActiveSettingPage('settings_main')}
          />
        )}

        {activeSettingPage === 'settings_allowance' && (
          <AllowanceSettingsPage 
            data={data}
            onSaveSettings={setData}
            onBack={() => setActiveSettingPage('settings_main')}
          />
        )}

        {activeSettingPage === 'settings_reminder' && (
          <ReminderSettingsPage 
            reminderSettings={data.reminderSettings || { enabled: true, time: '20:00' }}
            onSaveReminder={(reminderSettings) => setData({ ...data, reminderSettings })}
            onBack={() => setActiveSettingPage('settings_main')}
          />
        )}

        {activeSettingPage === 'settings_categories' && (
          <CategoriesSettingsPage 
            data={data}
            onSaveSettings={setData}
            onBack={() => setActiveSettingPage('settings_main')}
          />
        )}

        {activeSettingPage === 'settings_appearance' && (
          <AppearanceSettingsPage 
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onBack={() => setActiveSettingPage('settings_main')}
          />
        )}

        {activeSettingPage === 'settings_reset' && (
          <DataResetSettingsPage 
            onResetDemo={handleResetDemo}
            onBack={() => setActiveSettingPage('settings_main')}
          />
        )}

        {/* MAIN APP BOTTOM TAB PAGES */}
        {!activeSettingPage && activeTab === 'daily' && (
          <DailyPage 
            stats={stats} 
            transactions={stats.currentCycleTx || []}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)} 
          />
        )}

        {!activeSettingPage && activeTab === 'expenses' && (
          <ExpensesPage 
            categories={data.categories}
            transactions={data.transactions || []}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onAddExpense={handleAddExpense}
            archivedCycles={data.archivedCycles || []}
            cyclePeriodLabel={stats.cyclePeriodLabel}
          />
        )}

        {!activeSettingPage && activeTab === 'cooloff' && (
          <CooloffPage 
            wishlist={data.wishlist || []}
            onAddWishItem={handleAddWishItem}
            onDeleteWishItem={handleDeleteWishItem}
          />
        )}

        {!activeSettingPage && activeTab === 'analytics' && (
          <AnalyticsPage 
            stats={stats}
            categories={data.categories}
            reserveAmount={data.emergencyReserve || 0}
            isEmergencyUnlocked={data.isEmergencyUnlocked}
            onToggleEmergencyLock={handleToggleEmergencyLock}
          />
        )}
      </main>

      {/* 100% Full-Bleed Fixed Bottom Navigation Dock Wrapper */}
      <div className="bottom-nav-wrapper">
        <nav className="bottom-nav">
          <button 
            className={`nav-item ${!activeSettingPage && activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => { setActiveSettingPage(null); setActiveTab('daily'); }}
          >
            <LayoutDashboard size={20} />
            <span>Daily</span>
          </button>

          <button 
            className={`nav-item ${!activeSettingPage && activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => { setActiveSettingPage(null); setActiveTab('expenses'); }}
          >
            <ReceiptText size={20} />
            <span>Expenses</span>
          </button>

          <button 
            className={`nav-item ${!activeSettingPage && activeTab === 'cooloff' ? 'active' : ''}`}
            onClick={() => { setActiveSettingPage(null); setActiveTab('cooloff'); }}
          >
            <Clock size={20} />
            <span>Cool-Off</span>
          </button>

          <button 
            className={`nav-item ${!activeSettingPage && activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => { setActiveSettingPage(null); setActiveTab('analytics'); }}
          >
            <BarChart3 size={20} />
            <span>Analytics</span>
          </button>
        </nav>
      </div>

      {/* Quick Add Modal */}
      <QuickAddExpense 
        categories={data.categories}
        onAddExpense={handleAddExpense}
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </div>
  );
}
