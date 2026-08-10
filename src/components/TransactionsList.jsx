import React, { useState } from 'react';
import { Search, Trash2, Calendar, Filter, Wallet, ArrowUpRight } from 'lucide-react';
import { DEFAULT_CATEGORIES, formatDateReadable } from '../utils/storage';
import CustomDropdown from './CustomDropdown';

export default function TransactionsList({ 
  categories = DEFAULT_CATEGORIES, 
  transactions, 
  onDeleteTransaction,
  archivedCycles = [],
  cyclePeriodLabel = 'Current Cycle'
}) {
  const [selectedCycleId, setSelectedCycleId] = useState('current');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const cycleOptions = [
    { value: 'current', label: `Current Cycle (${cyclePeriodLabel})`, icon: '🗓️' },
    ...archivedCycles.map(c => ({
      value: c.cycleId,
      label: `${c.periodLabel || c.cycleId} (Saved ₹${c.totalSaved || 0})`,
      icon: '📁'
    }))
  ];

  const categoryOptions = [
    { value: 'all', label: 'All Categories', icon: '🏷️' },
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
    const matchesCat = selectedCategory === 'all' || tx.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalFilteredSpent = filtered.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const getCategoryInfo = (catId) => {
    return categories.find(c => c.id === catId) || { name: 'Other', icon: '🏷️', color: '#2563eb' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Filter Dock Card */}
      <div className="ios-card" style={{ padding: '16px', marginBottom: 0 }}>
        {/* Cycle Selector Header */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={13} color="var(--ios-blue)" /> Billing Cycle
            </span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              {filtered.length} {filtered.length === 1 ? 'Expense' : 'Expenses'}
            </span>
          </div>

          <CustomDropdown
            options={cycleOptions}
            value={selectedCycleId}
            onChange={val => setSelectedCycleId(val)}
          />
        </div>

        {/* Search & Category Filter Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search expenses..."
              className="form-input"
              style={{ paddingLeft: '38px', fontSize: '13px', height: '42px' }}
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

      {/* Archived Cycle Banner if selected */}
      {activeCycleInfo && (
        <div style={{
          background: 'var(--ios-blue-bg)',
          border: '1px solid rgba(37, 99, 235, 0.15)',
          padding: '14px 16px',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: 'var(--shadow-card)'
        }}>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--ios-blue)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Archived History: {activeCycleInfo.periodLabel}
            </span>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
              Allowance: ₹{activeCycleInfo.monthlyAllowance} • Spent: ₹{activeCycleInfo.totalSpent}
            </p>
          </div>
          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ios-green)', background: 'var(--ios-green-bg)', padding: '6px 12px', borderRadius: 'var(--radius-full)' }}>
            +₹{activeCycleInfo.totalSaved} Saved
          </span>
        </div>
      )}

      {/* Total Cycle Spend Summary Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 4px'
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
          {selectedCycleId === 'current' ? 'Transactions' : 'Past Records'}
        </h3>
        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--ios-blue)', background: 'var(--ios-blue-bg)', padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>
          Total: ₹{totalFilteredSpent}
        </span>
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="ios-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-tertiary)' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '20px',
            background: 'var(--bg-card-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px'
          }}>
            <Wallet size={24} color="var(--text-tertiary)" />
          </div>
          <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            No Expenses Logged
          </p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Tap "+ Log Spend" above to record your first expense.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(tx => {
            const cat = getCategoryInfo(tx.category);
            const catBgColor = cat.color ? cat.color + '15' : 'var(--bg-card-subtle)';

            return (
              <div 
                key={tx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px',
                  background: 'var(--bg-card)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-card)',
                  border: '1px solid var(--border-subtle)',
                  transition: 'transform 0.15s ease'
                }}
              >
                {/* Left Category Icon & Details */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '14px', 
                    background: catBgColor, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '22px',
                    flexShrink: 0,
                    border: '1px solid rgba(0,0,0,0.04)'
                  }}>
                    {cat.icon}
                  </div>

                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <p style={{ 
                      fontSize: '14px', 
                      fontWeight: 800, 
                      color: 'var(--text-primary)',
                      lineHeight: 1.2,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {tx.note || cat.name}
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-card-subtle)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {cat.name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {formatDateReadable(tx.date)} {tx.time ? `• ${tx.time}` : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Amount & Delete Action */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, marginLeft: '12px' }}>
                  <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--ios-red)', letterSpacing: '-0.3px' }}>
                    -₹{tx.amount}
                  </span>

                  {selectedCycleId === 'current' && (
                    <button 
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        borderRadius: '10px',
                        background: 'var(--bg-card-subtle)',
                        color: 'var(--text-tertiary)',
                        border: 'none'
                      }}
                      title="Delete expense"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
