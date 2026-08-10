import React from 'react';
import { Trophy, ArrowUpRight, Sparkles, History, ShieldCheck } from 'lucide-react';
import { calculatePiggyBankSavings, formatDateReadable } from '../utils/storage';

export default function PiggyBankVaultPage({ budgetData, onBack }) {
  const { totalSaved, history } = calculatePiggyBankSavings(budgetData);

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
          Piggy Bank Vault
        </h2>
      </div>

      {/* Hero Savings Card */}
      <div className="ios-card" style={{
        padding: '24px 20px',
        marginBottom: '16px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.12) 0%, rgba(52, 199, 89, 0.03) 100%)',
        border: '1px solid rgba(52, 199, 89, 0.25)'
      }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '20px',
          background: 'var(--ios-green-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          fontSize: '32px'
        }}>
          🐷
        </div>

        <h3 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 4px', color: 'var(--text-primary)' }}>
          Piggy Savings Vault
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
          Total leftover money saved under daily spending limits
        </p>

        <div style={{
          fontSize: '44px',
          fontWeight: 800,
          color: 'var(--ios-green)',
          letterSpacing: '-1.5px',
          lineHeight: 1,
          marginBottom: '6px'
        }}>
          +₹{totalSaved}
        </div>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ios-green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Accumulated Vault Balance
        </span>
      </div>

      {/* Date-by-Date Timeline Log Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <History size={16} color="var(--ios-green)" /> Savings History Timeline
        </h3>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--ios-green)', background: 'var(--ios-green-bg)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
          {history.length} Days Recorded
        </span>
      </div>

      {/* Date-by-Date Timeline Log List */}
      {history.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {history.map((item, index) => (
            <div
              key={index}
              className="ios-card"
              style={{
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                  <strong style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {formatDateReadable(item.date)}
                  </strong>
                  {item.isZeroSpend && (
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 800,
                      background: 'var(--ios-orange-bg)',
                      color: 'var(--ios-orange)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-full)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                      <Trophy size={10} /> Zero Spend Hero!
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Spent ₹{item.spent} of ₹{item.limit} daily limit
                </span>
              </div>

              <span style={{
                fontSize: '16px',
                fontWeight: 800,
                color: 'var(--ios-green)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px'
              }}>
                <ArrowUpRight size={16} /> +₹{item.savedAmount}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="ios-card" style={{ padding: '24px 18px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            💡 Spend less than your daily target to automatically deposit leftover cash into your Piggy Bank Vault!
          </p>
        </div>
      )}
    </div>
  );
}
