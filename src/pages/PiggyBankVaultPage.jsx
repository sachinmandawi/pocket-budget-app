import { Trophy, ArrowUpRight, Sparkles, History, ShieldCheck, ArrowLeft } from 'lucide-react';
import { calculatePiggyBankSavings, formatDateReadable } from '../utils/storage';

export default function PiggyBankVaultPage({ budgetData, onBack }) {
  const { totalSaved, history } = calculatePiggyBankSavings(budgetData);
  const currencySymbol = budgetData?.currency?.symbol || '₹';

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out', paddingBottom: '80px' }}>
      {/* Page Header with Back Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
        {onBack && (
          <button 
            type="button"
            onClick={onBack}
            className="btn-icon"
            style={{ 
              width: '34px',
              height: '34px',
              background: 'var(--bg-card-subtle)', 
              borderRadius: '50%', 
              border: 'none', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ArrowLeft size={18} color="var(--text-primary)" />
          </button>
        )}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.4px' }}>
            Piggy Savings Vault 🐷
          </h2>
        </div>
      </div>

      {/* Hero Piggy Balance Card */}
      <div className="ios-card" style={{
        padding: '24px 20px',
        marginBottom: '16px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(52, 199, 89, 0.12) 0%, rgba(52, 199, 89, 0.03) 100%)',
        border: '1px solid rgba(52, 199, 89, 0.25)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '18px',
          background: 'var(--ios-green-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '28px',
          margin: '0 auto 12px'
        }}>
          🐷
        </div>
        <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.4px' }}>
          Piggy Savings Vault
        </h3>
        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
          Total leftover money saved under daily spending limits
        </p>

        <div style={{
          fontSize: '28px',
          fontWeight: 800,
          color: 'var(--ios-green)',
          letterSpacing: '-1px',
          lineHeight: 1,
          marginBottom: '4px'
        }}>
          +{currencySymbol}{totalSaved}
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
          {history.map((item, index) => {
            const isWithdrawal = item.type === 'withdrawal';
            return (
              <div
                key={index}
                className="ios-card"
                style={{
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderLeft: isWithdrawal ? '4px solid var(--ios-red)' : '4px solid var(--ios-green)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <strong style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {formatDateReadable(item.date)}
                    </strong>
                    {isWithdrawal ? (
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 800,
                        background: 'var(--ios-red-bg)',
                        color: 'var(--ios-red)',
                        padding: '2px 6px',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        Vault Expense
                      </span>
                    ) : item.isZeroSpend && (
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
                    {isWithdrawal ? item.note : `Spent ${currencySymbol}${item.spent} of ${currencySymbol}${item.limit} daily limit`}
                  </span>
                </div>

                <span style={{
                  fontSize: '15px',
                  fontWeight: 800,
                  color: isWithdrawal ? 'var(--ios-red)' : 'var(--ios-green)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '2px'
                }}>
                  {isWithdrawal ? `-${currencySymbol}${item.spent}` : <><ArrowUpRight size={16} /> +{currencySymbol}{item.savedAmount}</>}
                </span>
              </div>
            );
          })}
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
