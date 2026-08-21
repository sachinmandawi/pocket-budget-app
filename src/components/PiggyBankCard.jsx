import React, { useState } from 'react';
import { Trophy, ChevronDown, ChevronUp, ArrowUpRight, History } from 'lucide-react';
import { calculatePiggyBankSavings, formatDateReadable } from '../utils/storage';
import { formatCurrencyAmount } from '../utils/currencies';

export default function PiggyBankCard({ budgetData, onNavigateVault }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { totalSaved, history } = calculatePiggyBankSavings(budgetData);

  const currencySymbol = budgetData?.currency?.symbol || '₹';

  return (
    <div 
      onClick={onNavigateVault}
      className="notion-card" 
      style={{
        padding: '14px 16px',
        marginBottom: '12px',
        cursor: onNavigateVault ? 'pointer' : 'default'
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px', lineHeight: 1 }}>🐷</span>
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
              Piggy Bank
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              Leftover cash auto-saved below daily limit
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--notion-green-text)',
            display: 'block',
            lineHeight: 1
          }}>
            +{formatCurrencyAmount(currencySymbol, totalSaved)}
          </span>
          <span className="notion-tag notion-tag-green" style={{ fontSize: '9px', marginTop: '2px' }}>
            Piggy Bank
          </span>
        </div>
      </div>

      {/* History Toggle */}
      {history.length > 0 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            width: '100%',
            marginTop: '12px',
            padding: '6px 10px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card-subtle)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            fontSize: '11px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <History size={13} /> Savings History ({history.length} Days)
          </span>
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}

      {/* Date-by-Date Timeline Log */}
      {isExpanded && history.length > 0 && (
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px', animation: 'fadeIn 0.15s ease-out' }}>
          {history.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                background: 'var(--bg-card-subtle)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatDateReadable(item.date)}
                  </strong>
                  {item.isZeroSpend && (
                    <span className="notion-tag notion-tag-orange" style={{ fontSize: '9px', padding: '1px 4px', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                      <Trophy size={9} /> Zero Spend!
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', display: 'block', marginTop: '1px' }}>
                  Spent {formatCurrencyAmount(currencySymbol, item.spent)} of {formatCurrencyAmount(currencySymbol, item.limit)} limit
                </span>
              </div>

              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--notion-green-text)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px'
              }}>
                <ArrowUpRight size={13} /> +{formatCurrencyAmount(currencySymbol, item.savedAmount)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {history.length === 0 && (
        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', margin: '10px 0 0' }}>
          💡 Spend less than your daily limit to save leftover cash into the Piggy Bank!
        </p>
      )}
    </div>
  );
}
