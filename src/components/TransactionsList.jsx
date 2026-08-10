import React, { useState } from 'react';
import { Search, Trash2, Calendar } from 'lucide-react';
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

  const getCategoryInfo = (catId) => {
    return categories.find(c => c.id === catId) || { name: 'Other', icon: '🏷️', color: '#8e8e93' };
  };

  return (
    <div className="ios-card">
      {/* Month / Billing Cycle Custom Card Dropdown */}
      <div style={{ marginBottom: '16px' }}>
        <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Calendar size={14} color="var(--ios-blue)" />
          Billing Cycle / Month Archive
        </label>
        <CustomDropdown
          options={cycleOptions}
          value={selectedCycleId}
          onChange={val => setSelectedCycleId(val)}
        />
      </div>

      {/* Archived Month Summary Card if selected */}
      {activeCycleInfo && (
        <div style={{
          background: 'var(--ios-blue-bg)',
          padding: '14px 16px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--ios-blue)', fontWeight: 700 }}>
              Archived History: {activeCycleInfo.periodLabel}
            </span>
            <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
              Allowance: ₹{activeCycleInfo.monthlyAllowance} • Spent: ₹{activeCycleInfo.totalSpent}
            </p>
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ios-green)' }}>
            +₹{activeCycleInfo.totalSaved} Saved
          </span>
        </div>
      )}

      {/* Search & Category Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '14px', top: '14px' }} />
          <input
            type="text"
            placeholder="Search expense..."
            className="form-input"
            style={{ paddingLeft: '38px', fontSize: '14px' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ width: '165px' }}>
          <CustomDropdown
            options={categoryOptions}
            value={selectedCategory}
            onChange={val => setSelectedCategory(val)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-tertiary)', fontSize: '14px' }}>
          No expenses logged for this period.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map(tx => {
            const cat = getCategoryInfo(tx.category);
            return (
              <div 
                key={tx.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--bg-card-subtle)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    borderRadius: '12px', 
                    background: 'var(--bg-card)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontSize: '20px',
                    boxShadow: 'var(--shadow-ios)'
                  }}>
                    {cat.icon}
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {tx.note || cat.name}
                    </p>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {formatDateReadable(tx.date)} • {tx.time || ''}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--ios-red)' }}>
                    -₹{tx.amount}
                  </span>
                  {selectedCycleId === 'current' && (
                    <button 
                      onClick={() => onDeleteTransaction(tx.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '32px', height: '32px', padding: 0 }}
                      title="Delete"
                    >
                      <Trash2 size={14} color="var(--text-tertiary)" />
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
