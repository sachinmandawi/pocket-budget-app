import React, { useState, useEffect } from 'react';
import { Search, Trash2, Calendar, Filter, Wallet, ArrowUpRight, Edit3, MoreVertical, Pencil } from 'lucide-react';
import { DEFAULT_CATEGORIES, formatDateReadable, formatLocalYMD } from '../utils/storage';
import { formatCurrencyAmount } from '../utils/currencies';
import CustomDropdown from './CustomDropdown';
import EditExpenseModal from './EditExpenseModal';
import ConfirmDeleteModal from './ConfirmDeleteModal';

export default function TransactionsList({ 
  categories = DEFAULT_CATEGORIES, 
  transactions = [], 
  onDeleteTransaction, 
  onEditTransaction,
  archivedCycles = [],
  cyclePeriodLabel = 'Current Cycle',
  currencySymbol = '₹'
}) {
  const [selectedCycleId, setSelectedCycleId] = useState('current');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingTx, setEditingTx] = useState(null);
  const [txToDelete, setTxToDelete] = useState(null);
  const [openMenuTxId, setOpenMenuTxId] = useState(null);

  // Close 3-dot popup menu when clicking outside
  useEffect(() => {
    if (!openMenuTxId) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-tx-menu]')) {
        setOpenMenuTxId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [openMenuTxId]);

  const cycleOptions = [
    { value: 'current', label: `Current Cycle (${cyclePeriodLabel})`, icon: '🗓️' },
    ...archivedCycles.map(c => ({
      value: c.cycleId,
      label: `${c.periodLabel || c.cycleId} (Saved ${formatCurrencyAmount(currencySymbol, c.totalSaved || 0)})`,
      icon: '📁'
    }))
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Records', icon: '🏷️' },
    { value: 'expenses', label: 'Spends Only', icon: '🔴' },
    { value: 'topups', label: 'Added Money Only', icon: '🟢' },
    ...categories.map(c => ({
      value: c.id,
      label: c.name,
      icon: c.icon
    }))
  ];

  let activeTxList = transactions;
  let activeCycleInfo = null;

  if (selectedCycleId !== 'current') {
    const archive = archivedCycles.find(c => c.cycleId === selectedCycleId);
    if (archive) {
      activeTxList = archive.transactions || [];
      activeCycleInfo = archive;
    }
  }

  const filtered = activeTxList.filter(tx => {
    const matchesSearch = (tx.note || '').toLowerCase().includes(search.toLowerCase());
    let matchesCat = true;
    if (selectedCategory === 'all') {
      matchesCat = true;
    } else if (selectedCategory === 'expenses') {
      matchesCat = tx.type !== 'topup';
    } else if (selectedCategory === 'topups') {
      matchesCat = tx.type === 'topup';
    } else {
      matchesCat = tx.category === selectedCategory;
    }
    return matchesSearch && matchesCat;
  });

  const totalFilteredSpent = filtered.filter(tx => tx.type !== 'topup').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalFilteredTopup = filtered.filter(tx => tx.type === 'topup').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const getCategoryInfo = (catId) => {
    return categories.find(c => c.id === catId) || { name: 'Other', icon: '🏷️', color: '#2563eb' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Filter Dock Card */}
      <div className="notion-card" style={{ padding: '14px', marginBottom: 0 }}>
        {/* Cycle Selector Header */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span className="notion-tag notion-tag-gray">
              <Calendar size={11} /> Billing Cycle
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {filtered.length} {filtered.length === 1 ? 'record' : 'records'}
            </span>
          </div>

          <CustomDropdown
            options={cycleOptions}
            value={selectedCycleId}
            onChange={val => setSelectedCycleId(val)}
          />
        </div>

        {/* Search & Category Filter Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '8px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Filter expenses..."
              className="form-input"
              style={{ paddingLeft: '34px', fontSize: '12px', height: '36px', borderRadius: 'var(--radius-sm)' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <CustomDropdown
            options={categoryOptions}
            value={selectedCategory}
            onChange={val => setSelectedCategory(val)}
          />
        </div>
      </div>

      {/* Archived Cycle Callout if selected */}
      {activeCycleInfo && (
        <div className="notion-callout" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📁</span>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {activeCycleInfo.periodLabel}
              </span>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
                Allowance: {formatCurrencyAmount(currencySymbol, activeCycleInfo.monthlyAllowance)} • Spent: {formatCurrencyAmount(currencySymbol, activeCycleInfo.totalSpent)}
              </p>
            </div>
          </div>
          <span className="notion-tag notion-tag-green">
            +{formatCurrencyAmount(currencySymbol, activeCycleInfo.totalSaved)} Saved
          </span>
        </div>
      )}

      {/* Total Cycle Spend Summary Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px' }}>📋</span>
          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {selectedCycleId === 'current' ? 'Transactions' : 'Past Records'}
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {totalFilteredTopup > 0 && (
            <span className="notion-tag notion-tag-green" style={{ fontSize: '10px' }}>
              +{formatCurrencyAmount(currencySymbol, totalFilteredTopup)}
            </span>
          )}
          <span className="notion-tag notion-tag-blue" style={{ fontSize: '10px' }}>
            Spent: {formatCurrencyAmount(currencySymbol, totalFilteredSpent)}
          </span>
        </div>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="notion-card" style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-tertiary)' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 10px'
          }}>
            <Wallet size={20} color="var(--text-tertiary)" />
          </div>
          <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
            No Transactions Found
          </p>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            Record spends or top-ups from the Daily tab to track them here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {(() => {
            const todayYMD = formatLocalYMD(new Date());
            const yesterdayObj = new Date();
            yesterdayObj.setDate(yesterdayObj.getDate() - 1);
            const yesterdayYMD = formatLocalYMD(yesterdayObj);

            // Group transactions by date
            const grouped = {};
            filtered.forEach(tx => {
              const d = tx.date || todayYMD;
              if (!grouped[d]) grouped[d] = [];
              grouped[d].push(tx);
            });

            const sortedDates = Object.keys(grouped).sort((a, b) => (b > a ? 1 : -1));

            const getDateLabel = (dateStr) => {
              if (dateStr === todayYMD) return 'Today';
              if (dateStr === yesterdayYMD) return 'Yesterday';
              return formatDateReadable(dateStr);
            };

            return sortedDates.map(dateKey => {
              const dayTxs = grouped[dateKey];
              const daySpent = dayTxs.filter(t => t.type !== 'topup').reduce((sum, t) => sum + Number(t.amount || 0), 0);
              const dayTopup = dayTxs.filter(t => t.type === 'topup').reduce((sum, t) => sum + Number(t.amount || 0), 0);

              return (
                <div key={dateKey}>
                  {/* Date Subheader & Total */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                    padding: '0 4px'
                  }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {getDateLabel(dateKey)}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600 }}>
                      {dayTopup > 0 && (
                        <span style={{ color: 'var(--notion-green-text)' }}>
                          +{formatCurrencyAmount(currencySymbol, dayTopup)}
                        </span>
                      )}
                      {daySpent > 0 && (
                        <span style={{ color: 'var(--text-tertiary)' }}>
                          -{formatCurrencyAmount(currencySymbol, daySpent)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Grouped Notion Card */}
                  <div className="notion-card" style={{ padding: 0, overflow: 'visible', marginBottom: 0 }}>
                    {dayTxs.map((tx, idx) => {
                      const isTopup = tx.type === 'topup';
                      const cat = isTopup ? { name: 'Added Money', icon: '💵', color: '#10b981' } : getCategoryInfo(tx.category);
                      const isLast = idx === dayTxs.length - 1;
                      const isMenuOpen = openMenuTxId === tx.id;

                      return (
                        <div
                          key={tx.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '11px 14px',
                            borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                            gap: '12px',
                            position: 'relative',
                            zIndex: isMenuOpen ? 90 : 1
                          }}
                        >
                          {/* Left Avatar */}
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: isTopup ? 'var(--notion-green-bg)' : 'var(--bg-card-subtle)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '18px',
                            flexShrink: 0,
                            border: '1px solid var(--border-subtle)'
                          }}>
                            {isTopup ? '💵' : cat.icon}
                          </div>

                          {/* Middle: Note / Category Name & Time */}
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px', minWidth: 0 }}>
                              <p style={{
                                fontSize: '13px',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                                lineHeight: 1.2,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                margin: 0,
                                minWidth: 0,
                                flex: 1
                              }}>
                                {tx.note || (isTopup ? 'Added Money' : cat.name)}
                              </p>
                              {isTopup ? (
                                <span className="notion-tag notion-tag-green" style={{ fontSize: '9px', padding: '1px 5px', flexShrink: 0 }}>
                                  {tx.topupTarget === 'emergency' ? '🛡️ Emergency' : tx.topupTarget === 'piggy_bank' ? '🐷 Piggy' : '⚡ Added Money'}
                                </span>
                              ) : (
                                tx.spendSource === 'piggy_bank' && (
                                  <span className="notion-tag notion-tag-green" style={{ fontSize: '9px', padding: '1px 5px', flexShrink: 0 }}>
                                    🐷 Piggy Bank
                                  </span>
                                )
                              )}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                              <span>{isTopup ? 'Received' : cat.name}</span>
                              {tx.time && (
                                <>
                                  <span>•</span>
                                  <span>{tx.time}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Right: Amount & Actions */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                            <span style={{
                              fontWeight: 700,
                              fontSize: '14px',
                              color: isTopup ? 'var(--notion-green-text)' : 'var(--notion-red-text)',
                              marginRight: '2px',
                              letterSpacing: '-0.2px'
                            }}>
                              {isTopup ? '+' : '-'}{formatCurrencyAmount(currencySymbol, tx.amount)}
                            </span>

                            {selectedCycleId === 'current' && (
                              <div style={{ position: 'relative' }} data-tx-menu={tx.id}>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuTxId(openMenuTxId === tx.id ? null : tx.id);
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

                                {openMenuTxId === tx.id && (
                                  <div
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                      position: 'absolute',
                                      right: 0,
                                      top: isLast && dayTxs.length > 2 ? 'auto' : '28px',
                                      bottom: isLast && dayTxs.length > 2 ? '28px' : 'auto',
                                      zIndex: 100,
                                      background: 'var(--bg-card)',
                                      border: '1px solid var(--border-medium)',
                                      borderRadius: 'var(--radius-sm)',
                                      boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45)',
                                      padding: '4px',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '2px',
                                      minWidth: '115px',
                                      animation: 'fadeIn 0.12s ease-out'
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenMenuTxId(null);
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
                                        setOpenMenuTxId(null);
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
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Edit Expense Modal */}
      <EditExpenseModal
        isOpen={!!editingTx}
        onClose={() => setEditingTx(null)}
        transaction={editingTx}
        categories={categories}
        onSaveEdit={onEditTransaction}
        onDeleteTransaction={onDeleteTransaction}
        currencySymbol={currencySymbol}
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
