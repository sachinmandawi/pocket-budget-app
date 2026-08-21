// Pocket Budget v1.3.0 — In-App Auto-Update & Local Backup Release
import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import QuickAddExpense from './components/QuickAddExpense';
import SplashScreen from './components/SplashScreen';
import WelcomeOnboardingModal from './components/WelcomeOnboardingModal';

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
import CurrencySettingsPage from './pages/settings/CurrencySettingsPage';
import AllowanceCountdownPage from './pages/AllowanceCountdownPage';
import PiggyBankVaultPage from './pages/PiggyBankVaultPage';
import AppUpdateModal from './components/AppUpdateModal';
import { initAdMob, showStickyBanner, showSmartInterstitial } from './utils/admobService';

import { getInitialData, saveData, calculateBudgetStats } from './utils/storage';
import { pushToGitHub, pullFromGitHub, getGitHubConfig, saveGitHubConfig, fetchGitHubUser, mergeBudgetData } from './utils/githubSync';
import { checkForAppUpdate, CURRENT_APP_VERSION } from './utils/versionCheck';
import { App as CapApp } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { LayoutDashboard, ReceiptText, Clock, BarChart3, LogOut, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [data, setData] = useState(() => getInitialData());

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);
  const [splashFadeOut, setSplashFadeOut] = useState(false);

  const [activeTab, setActiveTab] = useState('daily');
  const [activeSettingPage, setActiveSettingPage] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const init = getInitialData();
    return Boolean(init?.isDarkMode);
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // GitHub Releases In-App Update State
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // 1-Time Welcome Onboarding Carousel State
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    window.__POCKET_BUDGET_NAVIGATE__ = (tab = 'daily', settingPage = null) => {
      setActiveTab(tab);
      setActiveSettingPage(settingPage);
      setIsSidebarOpen(false);
    };
  }, []);

  useEffect(() => {
    try {
      const isAlreadyOnboarded = localStorage.getItem('pocket_budget_onboarded_v1');
      if (!isAlreadyOnboarded) {
        setShowOnboarding(true);
      }
    } catch (e) {}
  }, []);

  const handleStartOnboardingSetup = () => {
    setShowOnboarding(false);
    setActiveSettingPage('settings_allowance');
  };

  // Auto-check GitHub Releases for latest APK version (2.5s after launch)
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        const info = await checkForAppUpdate();
        if (isMounted && info && info.hasUpdate) {
          setUpdateInfo(info);
          setShowUpdateModal(true);
        }
      } catch (e) {}
    }, 2500);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Google AdMob: Initialize SDK and Display Bottom Banner Ad on Android
  useEffect(() => {
    initAdMob().then(() => {
      showStickyBanner();
    }).catch(() => {});
  }, []);

  const handleManualCheckUpdates = async () => {
    const info = await checkForAppUpdate();
    if (info && info.hasUpdate) {
      setUpdateInfo(info);
      setShowUpdateModal(true);
      return { hasUpdate: true, version: info.latestVersion };
    }
    return { hasUpdate: false, currentVersion: CURRENT_APP_VERSION };
  };

  // Double Back To Exit State
  const [showExitToast, setShowExitToast] = useState(false);
  const [isAppExited, setIsAppExited] = useState(false);
  const lastBackPressRef = useRef(0);

  // Native Capacitor APK & Web Hardware Back Button Handler
  useEffect(() => {
    let capListenerHandle = null;

    const handleBackAction = () => {
      if (isSidebarOpen) {
        setIsSidebarOpen(false);
        return;
      }
      if (isQuickAddOpen) {
        setIsQuickAddOpen(false);
        return;
      }
      if (activeSettingPage) {
        if (['allowance_countdown', 'piggy_bank', 'settings_main', 'settings_allowance', 'settings_categories'].includes(activeSettingPage)) {
          setActiveSettingPage(null);
        } else {
          setActiveSettingPage('settings_main');
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
  }, [isSidebarOpen, isQuickAddOpen, activeSettingPage, activeTab]);

  // Push state to history stack on sub-view open
  useEffect(() => {
    if (isSidebarOpen || isQuickAddOpen || activeSettingPage || activeTab !== 'daily') {
      try {
        window.history.pushState({ sidebar: isSidebarOpen, isModal: isQuickAddOpen, page: activeSettingPage, tab: activeTab }, '');
      } catch (e) {}
    }
  }, [isSidebarOpen, isQuickAddOpen, activeSettingPage, activeTab]);

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

  // Synchronize Dark Mode Class & LocalStorage
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme');
      localStorage.setItem('pocket_budget_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark-theme');
      localStorage.setItem('pocket_budget_theme', 'light');
    }
  }, [isDarkMode]);

  // Sync if data.isDarkMode changes externally (e.g. from cloud pull)
  useEffect(() => {
    if (data && typeof data.isDarkMode === 'boolean' && data.isDarkMode !== isDarkMode) {
      setIsDarkMode(data.isDarkMode);
    }
  }, [data?.isDarkMode]);

  const handleToggleDarkMode = (newMode) => {
    const nextMode = typeof newMode === 'boolean' ? newMode : !isDarkMode;
    setIsDarkMode(nextMode);
    setData(prev => {
      const updated = { ...prev, isDarkMode: nextMode };
      saveData(updated);
      return updated;
    });
  };

  // Synchronize Daily Spend Reminder with Capacitor LocalNotifications
  useEffect(() => {
    const syncLocalNotificationSchedule = async () => {
      const reminder = data?.reminderSettings;
      try {
        await LocalNotifications.cancel({ notifications: [{ id: 1001 }] });

        if (reminder && reminder.enabled !== false) {
          const timeStr = reminder.time || '20:00';
          const [hStr, mStr] = timeStr.split(':');
          const hour = parseInt(hStr || '20', 10);
          const minute = parseInt(mStr || '0', 10);

          await LocalNotifications.schedule({
            notifications: [
              {
                id: 1001,
                title: 'Pocket Budget Reminder 🔔',
                body: "Did you record today's spends? Tap to keep your budget on track!",
                schedule: {
                  on: {
                    hour,
                    minute
                  },
                  allowWhileIdle: true
                }
              }
            ]
          });
        }
      } catch (e) {}
    };

    syncLocalNotificationSchedule();
  }, [data?.reminderSettings]);

  // Floating Auto-Sync Toast State
  const [syncToastMsg, setSyncToastMsg] = useState(null);

  const triggerSyncToast = (msg) => {
    setSyncToastMsg(msg);
    setTimeout(() => {
      setSyncToastMsg(null);
    }, 3000);
  };

  // Save to localStorage & Automatic Background Push to GitHub Private Repo
  useEffect(() => {
    saveData(data);
    const config = getGitHubConfig();
    if (config.token && config.owner && config.repo) {
      const timer = setTimeout(async () => {
        const res = await pushToGitHub(data);
        if (res.success) {
          triggerSyncToast('☁️ Auto-synced to GitHub Cloud!');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [data]);

  // On App Mount & On Focus/Visibility Change, Smart Sync & Merge Cloud Data
  useEffect(() => {
    const syncAndMergeOnFocus = () => {
      const config = getGitHubConfig();
      if (config.token && config.owner && config.repo) {
        pullFromGitHub().then(res => {
          if (res.success && res.data) {
            setData(prevData => {
              const merged = mergeBudgetData(prevData, res.data);
              return merged;
            });
            triggerSyncToast('✅ Cloud Database Synced & Merged!');
          }
        }).catch(() => {});
      }
    };

    // Initial mount sync
    syncAndMergeOnFocus();

    // Focus & Visibility Heartbeat Sync
    window.addEventListener('focus', syncAndMergeOnFocus);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncAndMergeOnFocus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', syncAndMergeOnFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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

    // Trigger Smart Interstitial Ad
    showSmartInterstitial().catch(() => {});
  };

  const handleDeleteTransaction = (id) => {
    const updated = {
      ...data,
      transactions: (data.transactions || []).filter(tx => tx.id !== id)
    };
    setData(updated);
  };

  const handleEditTransaction = (updatedTx) => {
    if (!updatedTx || !updatedTx.id) return;
    const updated = {
      ...data,
      transactions: (data.transactions || []).map(tx => tx.id === updatedTx.id ? { ...tx, ...updatedTx } : tx)
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

  const handleEditWishItem = (updatedItem) => {
    if (!updatedItem || !updatedItem.id) return;
    setData({
      ...data,
      wishlist: (data.wishlist || []).map(w => w.id === updatedItem.id ? { ...w, ...updatedItem } : w)
    });
  };

  const handleToggleEmergencyLock = () => {
    setData({
      ...data,
      isEmergencyUnlocked: !data.isEmergencyUnlocked
    });
  };

  const handleResetDemo = () => {
    const freshData = {
      monthlyAllowance: 0,
      paydayAnchorDate: 1,
      emergencyReserve: 0,
      isEmergencyUnlocked: false,
      isDarkMode: isDarkMode,
      fixedDeductions: [],
      categories: data.categories,
      archivedCycles: [],
      transactions: [],
      wishlist: []
    };
    saveData(freshData);
    setData(freshData);
    pushToGitHub(freshData).catch(() => {});
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
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '14px'
        }}>
          <CheckCircle2 size={28} color="var(--notion-green-text)" />
        </div>
        <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
          App Closed Successfully
        </h2>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
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
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '12px',
          fontWeight: 600,
          boxShadow: 'none',
          border: '1px solid var(--border-medium)',
          animation: 'fadeIn 0.2s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap'
        }}>
          <LogOut size={13} color="var(--notion-orange-text)" />
          <span>Press back again to exit</span>
        </div>
      )}

      {/* Left Drawer Navigation Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        activeTab={activeTab}
        activeSettingPage={activeSettingPage}
        onNavigateTab={(tab) => {
          setActiveSettingPage(null);
          setActiveTab(tab);
        }}
        onNavigateSettingPage={(page) => {
          setActiveSettingPage(page);
        }}
      />

      <Navbar 
        activeSettingPage={activeSettingPage}
        onOpenSettings={setActiveSettingPage}
        onOpenSettingsPage={setActiveSettingPage}
        onBackToApp={handleBackToApp}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Separate Page View Area */}
      <main>
        {/* SETTINGS SUB-PAGES ROUTING */}
        {activeSettingPage === 'settings_main' && (
          <SettingsMainPage 
            budgetData={data}
            onNavigateSubPage={setActiveSettingPage}
            onCheckForUpdates={handleManualCheckUpdates}
          />
        )}

        {activeSettingPage === 'settings_currency' && (
          <CurrencySettingsPage 
            data={data}
            onSaveSettings={(newData) => {
              setData(newData);
              setActiveSettingPage(null);
              setActiveTab('daily');
            }}
            onBack={() => setActiveSettingPage('settings_main')}
          />
        )}

        {activeSettingPage === 'settings_github' && (
          <GithubSyncSettingsPage 
            budgetData={data}
            onUpdateBudgetData={(newData) => {
              setData(newData);
            }}
            onBack={() => setActiveSettingPage('settings_main')}
          />
        )}

        {activeSettingPage === 'settings_allowance' && (
          <AllowanceSettingsPage 
            data={data}
            onSaveSettings={(newData) => {
              setData(newData);
              setActiveSettingPage(null);
              setActiveTab('daily');
            }}
            onBack={() => {
              setActiveSettingPage(null);
              setActiveTab('daily');
            }}
          />
        )}

        {activeSettingPage === 'settings_reminder' && (
          <ReminderSettingsPage 
            reminderSettings={data.reminderSettings || { enabled: true, time: '20:00' }}
            onSaveReminder={(reminderSettings) => {
              setData({ ...data, reminderSettings });
              setActiveSettingPage(null);
              setActiveTab('daily');
            }}
            onBack={() => setActiveSettingPage('settings_main')}
          />
        )}

        {activeSettingPage === 'settings_categories' && (
          <CategoriesSettingsPage 
            data={data}
            onSaveSettings={(newData) => {
              setData(newData);
              setActiveSettingPage(null);
              setActiveTab('daily');
            }}
            onBack={() => {
              setActiveSettingPage(null);
              setActiveTab('daily');
            }}
          />
        )}

        {activeSettingPage === 'settings_appearance' && (
          <AppearanceSettingsPage 
            isDarkMode={isDarkMode}
            onToggleDarkMode={handleToggleDarkMode}
            onBack={() => setActiveSettingPage('settings_main')}
          />
        )}

        {activeSettingPage === 'settings_reset' && (
          <DataResetSettingsPage 
            onResetDemo={() => {
              handleResetDemo();
              setActiveSettingPage(null);
              setActiveTab('daily');
            }}
            onBack={() => setActiveSettingPage('settings_main')}
          />
        )}

        {/* DEDICATED SEPARATE PAGES */}
        {activeSettingPage === 'allowance_countdown' && (
          <AllowanceCountdownPage 
            stats={stats}
            onBack={() => setActiveSettingPage(null)}
          />
        )}

        {activeSettingPage === 'piggy_bank' && (
          <PiggyBankVaultPage 
            budgetData={data}
            onBack={() => setActiveSettingPage(null)}
          />
        )}

        {/* MAIN APP BOTTOM TAB PAGES */}
        {!activeSettingPage && activeTab === 'daily' && (
          <DailyPage 
            stats={stats} 
            transactions={stats.currentCycleTx || []}
            budgetData={data}
            onNavigateToPage={setActiveSettingPage}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)} 
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {!activeSettingPage && activeTab === 'expenses' && (
          <ExpensesPage 
            categories={data.categories}
            transactions={data.transactions || []}
            currencySymbol={stats.currencySymbol}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={handleEditTransaction}
            onOpenQuickAdd={() => setIsQuickAddOpen(true)}
            onAddExpense={handleAddExpense}
            archivedCycles={data.archivedCycles || []}
            cyclePeriodLabel={stats.cyclePeriodLabel}
          />
        )}

        {!activeSettingPage && activeTab === 'cooloff' && (
          <CooloffPage 
            wishlist={data.wishlist || []}
            currencySymbol={stats.currencySymbol}
            onAddWishItem={handleAddWishItem}
            onDeleteWishItem={handleDeleteWishItem}
            onEditWishItem={handleEditWishItem}
          />
        )}

        {!activeSettingPage && activeTab === 'analytics' && (
          <AnalyticsPage 
            stats={stats}
            categories={data.categories}
            currencySymbol={stats.currencySymbol}
            reserveAmount={data.emergencyReserve || 0}
            isEmergencyUnlocked={data.isEmergencyUnlocked}
            onToggleEmergencyLock={handleToggleEmergencyLock}
          />
        )}
      </main>

      {/* Quick Add Modal */}
      <QuickAddExpense 
        categories={data.categories}
        budgetData={data}
        onAddExpense={handleAddExpense}
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      {/* 1-Time Welcome Onboarding Carousel Modal */}
      <WelcomeOnboardingModal 
        isOpen={showOnboarding && !showSplash}
        onClose={() => setShowOnboarding(false)}
        onStartSetup={handleStartOnboardingSetup}
      />

      {/* GitHub Releases In-App Update Modal */}
      <AppUpdateModal 
        isOpen={showUpdateModal}
        updateInfo={updateInfo}
        onClose={() => setShowUpdateModal(false)}
      />
      {/* Sleek Compact Bottom Auto-Sync Toast Pill */}
      {syncToastMsg && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          fontSize: '12px',
          fontWeight: 600,
          boxShadow: 'none',
          border: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {syncToastMsg}
        </div>
      )}
    </div>
  );
}
