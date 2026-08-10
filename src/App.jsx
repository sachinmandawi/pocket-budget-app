import React, { useState, useEffect } from 'react';
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

import { getInitialData, saveData, calculateBudgetStats } from './utils/storage';
import { pushToGitHub, pullFromGitHub, getGitHubConfig } from './utils/githubSync';
import { LayoutDashboard, ReceiptText, Clock, BarChart3 } from 'lucide-react';

export default function App() {
  const [data, setData] = useState(() => getInitialData());

  // Splash Screen State
  const [showSplash, setShowSplash] = useState(true);
  const [splashFadeOut, setSplashFadeOut] = useState(false);

  const [activeTab, setActiveTab] = useState('daily');
  const [activeSettingPage, setActiveSettingPage] = useState(null);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Splash Screen 2-second timer
  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setSplashFadeOut(true);
    }, 1600);

    const hideTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

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

  return (
    <div className="app-shell">
      {/* App Opening Splash Screen */}
      {showSplash && <SplashScreen fadeOut={splashFadeOut} />}

      {/* iOS Minimalist Navbar */}
      <Navbar 
        onOpenSettingsPage={handleOpenSettingsPage}
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
