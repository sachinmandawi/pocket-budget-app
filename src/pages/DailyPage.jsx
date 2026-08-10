import React from 'react';
import DailyGauge from '../components/DailyGauge';
import AllowanceCountdownWidget from '../components/AllowanceCountdownWidget';
import PiggyBankCard from '../components/PiggyBankCard';
import { DEFAULT_CATEGORIES, formatDateReadable } from '../utils/storage';

export default function DailyPage({ stats, onOpenQuickAdd, transactions = [], budgetData, onNavigateToPage }) {
  const todayStr = new Date().toISOString().substring(0, 10);
  const todayTx = transactions.filter(tx => tx.date === todayStr);

  const getCategoryInfo = (catId) => {
    return DEFAULT_CATEGORIES.find(c => c.id === catId) || { name: 'Other', icon: '🏷️', color: '#2563eb' };
  };

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Clean Hero Card */}
      <DailyGauge 
        stats={stats} 
        onOpenQuickAdd={onOpenQuickAdd} 
      />

      {/* ⏳ Feature #25: Animated Allowance Credit Countdown Widget */}
      <AllowanceCountdownWidget 
        stats={stats} 
        onClick={() => onNavigateToPage && onNavigateToPage('allowance_countdown')}
      />

      {/* 🐷 Feature: Piggy Bank Savings Vault & Daily History */}
      <PiggyBankCard 
        budgetData={budgetData} 
        onClick={() => onNavigateToPage && onNavigateToPage('piggy_bank')}
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
                    -₹{tx.amount}
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
