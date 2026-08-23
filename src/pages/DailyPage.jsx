import React, { useState, useEffect } from 'react';
import DailyGauge from '../components/DailyGauge';
import { DEFAULT_CATEGORIES, formatLocalYMD, formatDateReadable } from '../utils/storage';
import { getGitHubConfig } from '../utils/githubSync';
import { formatCurrencyAmount } from '../utils/currencies';
import { Cloud, X, ArrowRight, Edit3, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import EditExpenseModal from '../components/EditExpenseModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function DailyPage({ stats, onOpenQuickAdd, onNavigateToPage, transactions = [], budgetData, onEditTransaction, onDeleteTransaction }) {
  const todayStr = formatLocalYMD(new Date());
  const todayTx = transactions.filter(tx => tx.date === todayStr);
  const [editingTx, setEditingTx] = useState(null);
  const [txToDelete, setTxToDelete] = useState(null);
  const [openMenuDailyTxId, setOpenMenuDailyTxId] = useState(null);

  // Close 3-dot popup menu when clicking outside
  useEffect(() => {
    if (!openMenuDailyTxId) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-daily-tx-menu]')) {
        setOpenMenuDailyTxId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [openMenuDailyTxId]);

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
          style={{ 
            background: 'var(--bg-callout)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '10px 12px',
            marginBottom: '14px'
          }}
        >
          {/* Header Row: Icon + Title + Non-overlapping Cross Button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '15px' }}>☁️</span>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                GitHub Auto-Sync
              </span>
            </div>

            <button
              onClick={handleDismissBanner}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)',
                padding: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '4px'
              }}
              title="Dismiss"
            >
              <X size={13} />
            </button>
          </div>

          {/* Subtitle */}
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: 1.3 }}>
            Keep your pocket budget safely backed up & synced to your private GitHub repo.
          </p>

          {/* Small compact actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => onNavigateToPage('settings_github')}
              className="btn btn-primary btn-sm"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              Connect <ArrowRight size={11} />
            </button>

            <button
              onClick={handleDismissBanner}
              className="btn btn-secondary btn-sm"
              style={{ 
                fontSize: '11px', 
                fontWeight: 500, 
                padding: '4px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                border: '1px solid transparent',
                color: 'var(--text-tertiary)'
              }}
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

      {/* Recent Today Spends Card */}
      {todayTx.length > 0 && (
        <div className="notion-card" style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '13px' }}>📋</span>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                Today's Log
              </h3>
            </div>
            <span className="notion-tag notion-tag-gray">
              {todayTx.length} {todayTx.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {todayTx.map((tx, idx) => {
              const cat = getCategoryInfo(tx.category);
              const isLast = idx === todayTx.length - 1;
              const isMenuOpen = openMenuDailyTxId === tx.id;

              return (
                <div 
                  key={tx.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'var(--bg-card-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    gap: '10px',
                    position: 'relative',
                    zIndex: isMenuOpen ? 90 : 1
                  }}
                >
                  {/* Left Category Icon Avatar */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {cat.icon}
                  </div>

                  {/* Middle: Title & Meta Info */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', minWidth: 0 }}>
                      <p style={{ 
                        fontSize: '13px', 
                        fontWeight: 600, 
                        color: 'var(--text-primary)', 
                        margin: 0, 
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minWidth: 0,
                        flex: 1
                      }}>
                        {tx.note || cat.name}
                      </p>
                      {tx.spendSource === 'piggy_bank' && (
                        <span className="notion-tag notion-tag-green" style={{ fontSize: '9px', padding: '1px 5px', flexShrink: 0 }}>
                          🐷 Piggy Bank
                        </span>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      <span>{cat.name}</span>
                      {tx.time && (
                        <>
                          <span>•</span>
                          <span>{tx.time}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right Amount & Edit Icon */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: 700, 
                      color: 'var(--notion-red-text)',
                      marginRight: '2px',
                      letterSpacing: '-0.2px'
                    }}>
                      -{formatCurrencyAmount(stats.currencySymbol || '₹', tx.amount)}
                    </span>
                    <div style={{ position: 'relative' }} data-daily-tx-menu={tx.id}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuDailyTxId(openMenuDailyTxId === tx.id ? null : tx.id);
                        }}
                        style={{
                          width: '26px',
                          height: '26px',
                          padding: 0,
                          borderRadius: 'var(--radius-sm)',
                          background: 'transparent',
                          color: 'var(--text-tertiary)',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                        title="More options"
                      >
                        <MoreVertical size={14} />
                      </button>

                      {openMenuDailyTxId === tx.id && (
                        <div
                          onClick={e => e.stopPropagation()}
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: isLast && todayTx.length > 1 ? 'auto' : '28px',
                            bottom: isLast && todayTx.length > 1 ? '28px' : 'auto',
                            zIndex: 100,
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            boxShadow: 'var(--shadow-card)',
                            padding: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            minWidth: '110px',
                            animation: 'fadeIn 0.12s ease-out'
                          }}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuDailyTxId(null);
                              setEditingTx(tx);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 8px',
                              background: 'none',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: 500,
                              color: 'var(--text-primary)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              textAlign: 'left',
                              width: '100%'
                            }}
                          >
                            <Pencil size={13} color="var(--text-secondary)" /> Edit
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuDailyTxId(null);
                              setTxToDelete(tx);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '6px 8px',
                              background: 'none',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: 500,
                              color: 'var(--notion-red-text)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              textAlign: 'left',
                              width: '100%'
                            }}
                          >
                            <Trash2 size={13} color="var(--notion-red-text)" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Expense Modal for Daily Tab */}
      <EditExpenseModal
        isOpen={!!editingTx}
        onClose={() => setEditingTx(null)}
        transaction={editingTx}
        categories={budgetData?.categories || DEFAULT_CATEGORIES}
        onSaveEdit={onEditTransaction}
        onDeleteTransaction={onDeleteTransaction}
        currencySymbol={stats.currencySymbol || '₹'}
      />

      {/* Modern Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!txToDelete}
        title="Delete Expense?"
        message={`Are you sure you want to delete "${txToDelete?.note || 'this expense'}"?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => {
          if (txToDelete?.id) {
            onDeleteTransaction(txToDelete.id);
          }
        }}
        onClose={() => setTxToDelete(null)}
      />
    </div>
  );
}
