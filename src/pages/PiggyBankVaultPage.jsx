import React from 'react';
import { Trophy, ArrowUpRight, Sparkles, History, ShieldCheck, Lock } from 'lucide-react';
import { calculatePiggyBankSavings, formatDateReadable } from '../utils/storage';
import { formatCurrencyAmount } from '../utils/currencies';

export default function PiggyBankVaultPage({ budgetData }) {
  const { totalSaved, history } = calculatePiggyBankSavings(budgetData);
  const currencySymbol = budgetData?.currency?.symbol || '₹';

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out', paddingBottom: '80px' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
        <span style={{ fontSize: '20px' }}>🐷</span>
        <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
          Piggy Bank Vault
        </h2>
      </div>

      {/* Hero Piggy Balance Callout Card */}
      <div className="notion-card" style={{
        padding: '16px',
        marginBottom: '14px',
        background: 'var(--bg-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            Locked Vault Savings
          </span>
          <span className="notion-tag notion-tag-green">
            <Lock size={10} /> Vault Protected
          </span>
        </div>

        <div style={{
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--notion-green-text)',
          letterSpacing: '-0.6px',
          lineHeight: 1,
          marginBottom: '6px'
        }}>
          +{formatCurrencyAmount(currencySymbol, totalSaved)}
        </div>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
          Unspent daily money is automatically locked in this vault. Separate from daily pocket money!
        </p>
      </div>

      {/* Date-by-Date Timeline Log Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px' }}>📋</span>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Daily Savings History
          </h3>
        </div>
        <span className="notion-tag notion-tag-gray">
          {history.length} {history.length === 1 ? 'day' : 'days'}
        </span>
      </div>

      {/* Date-by-Date Timeline Log List */}
      {history.length > 0 ? (
        <div className="notion-card" style={{ padding: 0, overflow: 'hidden' }}>
          {history.map((item, index) => {
            const isWithdrawal = item.type === 'withdrawal';
            const isLast = index === history.length - 1;

            return (
              <div
                key={index}
                style={{
                  padding: '11px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                  borderLeft: isWithdrawal ? `3px solid var(--notion-red-text)` : `3px solid var(--notion-green-text)`,
                  gap: '10px'
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {formatDateReadable(item.date)}
                    </strong>
                    {isWithdrawal ? (
                      <span className="notion-tag notion-tag-red" style={{ fontSize: '9px', padding: '1px 5px' }}>
                        Piggy Expense
                      </span>
                    ) : item.isManual ? (
                      <span className="notion-tag notion-tag-blue" style={{ fontSize: '9px', padding: '1px 5px' }}>
                        🤝 Debt Recovery
                      </span>
                    ) : item.isZeroSpend && (
                      <span className="notion-tag notion-tag-orange" style={{ fontSize: '9px', padding: '1px 5px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                        <Trophy size={9} /> Zero Spend!
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isWithdrawal ? item.note : item.isManual ? (item.note || 'Manual deposit') : `Spent ${formatCurrencyAmount(currencySymbol, item.spent)} of ${formatCurrencyAmount(currencySymbol, item.limit)} limit`}
                  </span>
                </div>

                <span style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isWithdrawal ? 'var(--notion-red-text)' : 'var(--notion-green-text)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px',
                  flexShrink: 0
                }}>
                  {isWithdrawal ? `-${formatCurrencyAmount(currencySymbol, item.spent)}` : <><ArrowUpRight size={13} /> +{formatCurrencyAmount(currencySymbol, item.savedAmount)}</>}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="notion-card" style={{ padding: '24px 16px', textAlign: 'center' }}>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>
            💡 Spend less than your daily limit to automatically add leftover money into your Piggy Bank!
          </p>
        </div>
      )}
    </div>
  );
}
