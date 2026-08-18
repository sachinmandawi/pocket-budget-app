import React, { useState } from 'react';
import DailyGauge from '../components/DailyGauge';
import { DEFAULT_CATEGORIES, formatLocalYMD } from '../utils/storage';
import { getGitHubConfig } from '../utils/githubSync';
import { formatCurrencyAmount } from '../utils/currencies';
import { Cloud, X, ArrowRight } from 'lucide-react';

export default function DailyPage({ stats, onOpenQuickAdd, onNavigateToPage, transactions = [], budgetData }) {
  const todayStr = formatLocalYMD(new Date());
  const todayTx = transactions.filter(tx => tx.date === todayStr);

  const [showGithubBanner, setShowGithubBanner] = useState(() => {
    try {
      const isDismissed = localStorage.getItem('pocket_budget_dismiss_gh_banner');
      const config = getGitHubConfig();
      return !isDismissed && !config?.token;
    } catch (e) {
      return false;
    }
  });

  const handleDismissBanner = () => {
    try {
      localStorage.setItem('pocket_budget_dismiss_gh_banner', 'true');
    } catch (e) {}
    setShowGithubBanner(false);
  };

  const getCategoryInfo = (catId) => {
    const activeCats = budgetData?.categories || DEFAULT_CATEGORIES;
    return activeCats.find(c => c.id === catId) || DEFAULT_CATEGORIES.find(c => c.id === catId) || { name: 'Other', icon: '🏷️', color: '#2563eb' };
  };

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Recommended GitHub Auto-Sync Card */}
      {showGithubBanner && (
        <div 
          className="ios-card" 
          style={{ 
            marginBottom: '16px', 
            padding: '14px 16px',
            background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-subtle) 100%)',
            border: '1px solid var(--border-medium)',
            position: 'relative'
          }}
        >
          <button
            onClick={handleDismissBanner}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)'
            }}
          >
            <X size={14} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'var(--ios-blue-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Cloud size={18} color="var(--ios-blue)" />
            </div>

            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Recommend: GitHub Auto-Sync ☁️
              </h4>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                Never lose your data. 100% private cloud backup.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              onClick={() => onNavigateToPage('settings_github')}
              className="btn btn-primary btn-sm"
              style={{
                flex: 1,
                fontSize: '11px',
                fontWeight: 800,
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              Connect GitHub <ArrowRight size={12} />
            </button>
            <button
              onClick={handleDismissBanner}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '11px', fontWeight: 700, padding: '6px 10px' }}
            >
              Later
            </button>
          </div>
        </div>
      )}

      {/* Clean Hero Card */}
      <DailyGauge 
        stats={stats} 
        onOpenQuickAdd={onOpenQuickAdd} 
      />

      {/* Minimal Recent Today Spends Card */}
      {todayTx.length > 0 && (
        <div className="ios-card" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Today's Spends
            </h3>
            <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--ios-blue)', background: 'var(--ios-blue-bg)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
              {todayTx.length}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {todayTx.map(tx => {
              const cat = getCategoryInfo(tx.category);
              const catBgColor = cat.color ? cat.color + '15' : 'var(--bg-card-subtle)';

              return (
                <div 
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'var(--bg-card-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '10px', 
                      background: catBgColor, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '18px',
                      flexShrink: 0
                    }}>
                      {cat.icon}
                    </div>

                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                        {tx.note || cat.name}
                      </p>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {tx.time || ''}
                      </span>
                    </div>
                  </div>

                  <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ios-red)', letterSpacing: '-0.3px' }}>
                    -{formatCurrencyAmount(stats.currencySymbol || '₹', tx.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
