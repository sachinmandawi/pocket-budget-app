import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Trophy, ArrowUpRight, History } from 'lucide-react';
import { calculatePiggyBankSavings, formatDateReadable } from '../utils/storage';

export default function PiggyBankCard({ budgetData, onClick }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { totalSaved, history } = calculatePiggyBankSavings(budgetData);

  const currencySymbol = budgetData?.currency?.symbol || '₹';

  return (
    <div 
      onClick={onClick}
      className="ios-card" 
      style={{
        padding: '16px 18px',
        marginBottom: '16px',
        background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.08) 0%, rgba(52, 199, 89, 0.02) 100%)',
        border: '1px solid rgba(52, 199, 89, 0.2)',
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      {/* Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '12px',
            background: 'var(--ios-green-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            🐷
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Piggy Bank Savings Vault
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Leftover money saved under daily limit
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--ios-green)',
            display: 'block',
            lineHeight: 1
          }}>
            +{currencySymbol}{totalSaved}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--ios-green)', fontWeight: 700 }}>
            Total Saved
          </span>
        </div>
      </div>

      {/* History Toggle Button */}
      {history.length > 0 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            width: '100%',
            marginTop: '14px',
            padding: '8px 12px',
            borderRadius: 'var(--radius-md)',
            background: 'var(--ios-green-bg)',
            border: 'none',
            color: 'var(--ios-green)',
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <History size={14} /> Savings History ({history.length} Days)
          </span>
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
      )}

      {/* Date-by-Date Timeline Log */}
      {isExpanded && history.length > 0 && (
        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px', animation: 'fadeIn 0.15s ease-out' }}>
          {history.map((item, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
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
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>
                  Spent {currencySymbol}{item.spent} of {currencySymbol}{item.limit} limit
                </span>
              </div>

              <span style={{
                fontSize: '14px',
                fontWeight: 800,
                color: 'var(--ios-green)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px'
              }}>
                <ArrowUpRight size={14} /> +{currencySymbol}{item.savedAmount}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Empty State message if no past savings yet */}
      {history.length === 0 && (
        <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', margin: '12px 0 0' }}>
          💡 Spend less than your daily limit to automatically deposit leftover cash into your Piggy Bank Vault!
        </p>
      )}
    </div>
  );
}
