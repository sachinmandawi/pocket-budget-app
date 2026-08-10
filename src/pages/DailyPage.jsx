import React from 'react';
import DailyGauge from '../components/DailyGauge';
import { DEFAULT_CATEGORIES, formatDateReadable } from '../utils/storage';

export default function DailyPage({ stats, onOpenQuickAdd, transactions = [] }) {
  const todayStr = new Date().toISOString().substring(0, 10);
  const todayTx = transactions.filter(tx => tx.date === todayStr);

  const getCategoryInfo = (catId) => {
    return DEFAULT_CATEGORIES.find(c => c.id === catId) || { name: 'Other', icon: '🏷️' };
  };

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Clean Uncluttered Hero Card */}
      <DailyGauge 
        stats={stats} 
        onOpenQuickAdd={onOpenQuickAdd} 
      />

      {/* Minimal Recent Today Spends */}
      {todayTx.length > 0 && (
        <div className="ios-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: '12px' }}>
            Today's Spends ({todayTx.length})
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {todayTx.map(tx => {
              const cat = getCategoryInfo(tx.category);
              return (
                <div 
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{tx.note || cat.name}</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ios-red)' }}>-₹{tx.amount}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
