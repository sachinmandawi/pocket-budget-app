import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Calendar as CalendarIcon, ArrowDownLeft, ArrowUpRight, Shield, PiggyBank, Zap } from 'lucide-react';
import { DEFAULT_CATEGORIES, formatDateReadable, formatLocalYMD, calculatePiggyBankSavings, calculateBudgetStats } from '../utils/storage';
import CustomDropdown from './CustomDropdown';
import InteractiveCalendar from './InteractiveCalendar';

export default function QuickAddExpense({ 
  categories = DEFAULT_CATEGORIES, 
  onAddExpense, 
  isOpen, 
  onClose, 
  budgetData,
  initialTab = 'expense'
}) {
  const [activeTab, setActiveTab] = useState('expense'); // 'expense' | 'topup'
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || 'chai_snacks');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(formatLocalYMD(new Date()));
  const [spendSource, setSpendSource] = useState('allowance');
  const [topupTarget, setTopupTarget] = useState('allowance'); // 'allowance' | 'emergency' | 'piggy_bank'
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab === 'topup' ? 'topup' : 'expense');
      setAmount('');
      setNote('');
      setDate(formatLocalYMD(new Date()));
      setSpendSource('allowance');
      setTopupTarget('allowance');
      setShowDatePicker(false);
    }
  }, [isOpen, initialTab]);

  const stats = calculateBudgetStats(budgetData);
  const { totalSaved: availablePiggyBalance } = calculatePiggyBankSavings(budgetData);

  const availableAllowanceCash = Math.max(0, stats.remainingTotalInHand || 0);
  const todaysSafe = Math.max(0, stats.todaysSafeRemaining || 0);
  const daysRemaining = stats.daysRemaining || 1;

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
    icon: cat.icon
  }));

  const handleDateSelectFromCalendar = (dateStr) => {
    if (dateStr) {
      setDate(dateStr);
    }
  };

  const numAmt = Number(amount || 0);
  const hasEnteredAmount = numAmt > 0;

  // Expense validations
  const isPiggyInsufficient = activeTab === 'expense' && spendSource === 'piggy_bank' && hasEnteredAmount && numAmt > availablePiggyBalance;
  const isAllowanceInsufficient = activeTab === 'expense' && spendSource === 'allowance' && hasEnteredAmount && numAmt > availableAllowanceCash;
  const isAllowanceOverDailySafe = activeTab === 'expense' && spendSource === 'allowance' && hasEnteredAmount && !isAllowanceInsufficient && numAmt > todaysSafe && todaysSafe > 0;
  const isInsufficient = activeTab === 'expense' ? (spendSource === 'piggy_bank' ? isPiggyInsufficient : isAllowanceInsufficient) : false;

  const currencySymbol = budgetData?.currency?.symbol || '₹';
  const dailyBoostPerDay = daysRemaining > 0 && numAmt > 0 ? Math.round((numAmt / daysRemaining) * 10) / 10 : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    if (isInsufficient) return;

    if (activeTab === 'expense') {
      onAddExpense({
        type: 'expense',
        amount: Number(amount),
        category,
        note: note || categories.find(c => c.id === category)?.name || 'Expense',
        date,
        spendSource,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } else {
      // Top-up transaction
      onAddExpense({
        type: 'topup',
        amount: Number(amount),
        category: 'income',
        note: note.trim() || 'Extra Money / Top-up',
        date,
        topupTarget,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }

    setAmount('');
    setNote('');
    setDate(formatLocalYMD(new Date()));
    setShowDatePicker(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ alignItems: 'flex-end', padding: 0 }} onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ 
          maxWidth: '480px', 
          width: '100%', 
          borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
          padding: '18px 18px 24px',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          maxHeight: '92vh',
          overflowY: 'auto'
        }}
      >
        {/* Header with Close */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '18px' }}>{activeTab === 'expense' ? '📝' : '💵'}</span>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {activeTab === 'expense' ? 'Log Expense' : 'Add Money'}
            </h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            style={{ 
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)'
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Top Segmented Tabs */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '4px',
          background: 'var(--bg-card-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          border: '1px solid var(--border-subtle)'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('expense')}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'expense' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'expense' ? 'var(--notion-red-text)' : 'var(--text-tertiary)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: activeTab === 'expense' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowDownLeft size={14} /> Spend (Expense)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('topup')}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'topup' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'topup' ? 'var(--notion-green-text)' : 'var(--text-tertiary)',
              fontWeight: 700,
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: activeTab === 'topup' ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowUpRight size={14} /> + Add Money
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* EXPENSE TAB VIEW */}
          {activeTab === 'expense' && (
            <>
              {/* Spend Source Selector */}
              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Deduct Funds From
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setSpendSource('allowance')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: spendSource === 'allowance' ? '1px solid var(--text-primary)' : '1px solid var(--border-medium)',
                      background: spendSource === 'allowance' ? 'var(--notion-gray-bg)' : 'transparent',
                      color: 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>👛 Pocket Money</span>
                    <span className="notion-tag notion-tag-gray" style={{ fontSize: '10px' }}>
                      {currencySymbol}{availableAllowanceCash}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSpendSource('piggy_bank')}
                    style={{
                      padding: '8px 10px',
                      borderRadius: 'var(--radius-sm)',
                      border: spendSource === 'piggy_bank' ? '1px solid var(--notion-green-text)' : '1px solid var(--border-medium)',
                      background: spendSource === 'piggy_bank' ? 'var(--notion-green-bg)' : 'transparent',
                      color: spendSource === 'piggy_bank' ? 'var(--notion-green-text)' : 'var(--text-primary)',
                      fontWeight: 600,
                      fontSize: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>🐷 Piggy Bank</span>
                    <span className="notion-tag notion-tag-green" style={{ fontSize: '10px' }}>
                      {currencySymbol}{availablePiggyBalance}
                    </span>
                  </button>
                </div>

                {/* Validation alerts */}
                {isPiggyInsufficient && (
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--notion-red-text)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
                    ⚠️ Insufficient Piggy Bank balance (Max {currencySymbol}{availablePiggyBalance})
                  </span>
                )}
                {isAllowanceInsufficient && (
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--notion-red-text)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
                    ⚠️ Insufficient Pocket Money balance (Max {currencySymbol}{availableAllowanceCash})
                  </span>
                )}
                {isAllowanceOverDailySafe && (
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--notion-orange-text)', display: 'block', marginTop: '6px', textAlign: 'center' }}>
                    ⚠️ Exceeds daily safe limit (Safe Today: {currencySymbol}{todaysSafe})
                  </span>
                )}
              </div>

              {/* Amount Input */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Amount
                </span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-card-subtle)',
                  border: '1.5px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0 14px',
                  height: '52px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--notion-red-text)',
                    marginRight: '10px',
                    userSelect: 'none',
                    flexShrink: 0
                  }}>
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    step="1"
                    required
                    placeholder="0"
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      fontSize: '22px',
                      fontWeight: 700,
                      color: 'var(--notion-red-text)',
                      outline: 'none',
                      padding: 0,
                      width: '100%'
                    }}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Category Dropdown */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Category
                </span>
                <CustomDropdown
                  options={categoryOptions}
                  value={category}
                  onChange={val => setCategory(val)}
                />
              </div>

              {/* Note Input */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Note / Details
                </span>
                <input
                  type="text"
                  placeholder="e.g. Chai & Snacks"
                  className="form-input"
                  style={{ fontSize: '14px', height: '44px' }}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>
            </>
          )}

          {/* TOP-UP TAB VIEW */}
          {activeTab === 'topup' && (
            <>
              {/* Top-up Amount Input */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Received Amount
                </span>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  background: 'var(--bg-card-subtle)',
                  border: '1.5px solid var(--border-medium)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0 14px',
                  height: '52px',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--notion-green-text)',
                    marginRight: '10px',
                    userSelect: 'none',
                    flexShrink: 0
                  }}>
                    +{currencySymbol}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    pattern="[0-9]*"
                    step="1"
                    required
                    placeholder="0"
                    style={{
                      flex: 1,
                      border: 'none',
                      background: 'transparent',
                      fontSize: '22px',
                      fontWeight: 700,
                      color: 'var(--notion-green-text)',
                      outline: 'none',
                      padding: 0,
                      width: '100%'
                    }}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Custom Note */}
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Note / Sender Name
                </span>
                <input
                  type="text"
                  placeholder="e.g. Money from Papa"
                  className="form-input"
                  style={{ fontSize: '14px', height: '44px' }}
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>

              {/* Destination Allocation Selector */}
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Where to allocate this money?
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {/* Daily Budget Boost */}
                  <div
                    onClick={() => setTopupTarget('allowance')}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: topupTarget === 'allowance' ? '1.5px solid var(--notion-green-text)' : '1px solid var(--border-subtle)',
                      background: topupTarget === 'allowance' ? 'var(--notion-green-bg)' : 'var(--bg-card-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Zap size={16} color="var(--notion-green-text)" />
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                          Daily Limit Boost <span className="notion-tag notion-tag-green" style={{ fontSize: '9px', padding: '1px 4px' }}>Recommended</span>
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          {hasEnteredAmount 
                            ? `Spreads +${currencySymbol}${dailyBoostPerDay}/day across remaining ${daysRemaining} days` 
                            : `Spreads equally across remaining ${daysRemaining} days`}
                        </span>
                      </div>
                    </div>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: topupTarget === 'allowance' ? '5px solid var(--notion-green-text)' : '2px solid var(--border-medium)',
                      background: '#fff'
                    }} />
                  </div>

                  {/* Piggy Bank */}
                  <div
                    onClick={() => setTopupTarget('piggy_bank')}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: topupTarget === 'piggy_bank' ? '1.5px solid var(--notion-green-text)' : '1px solid var(--border-subtle)',
                      background: topupTarget === 'piggy_bank' ? 'var(--notion-green-bg)' : 'var(--bg-card-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <PiggyBank size={16} color="var(--notion-green-text)" />
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                          Piggy Bank Vault
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          Deposit directly into lifetime savings
                        </span>
                      </div>
                    </div>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: topupTarget === 'piggy_bank' ? '5px solid var(--notion-green-text)' : '2px solid var(--border-medium)',
                      background: '#fff'
                    }} />
                  </div>

                  {/* Emergency Reserve */}
                  <div
                    onClick={() => setTopupTarget('emergency')}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 'var(--radius-sm)',
                      border: topupTarget === 'emergency' ? '1.5px solid var(--notion-green-text)' : '1px solid var(--border-subtle)',
                      background: topupTarget === 'emergency' ? 'var(--notion-green-bg)' : 'var(--bg-card-subtle)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={16} color="var(--notion-green-text)" />
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
                          Emergency Reserve
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          Keep as a locked safety cushion
                        </span>
                      </div>
                    </div>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: topupTarget === 'emergency' ? '5px solid var(--notion-green-text)' : '2px solid var(--border-medium)',
                      background: '#fff'
                    }} />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Date Picker Button */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Transaction Date
            </span>
            <button
              type="button"
              onClick={() => setShowDatePicker(!showDatePicker)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                background: 'var(--bg-input)',
                border: showDatePicker ? '1px solid var(--border-medium)' : 'none',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarIcon size={16} color="var(--text-secondary)" />
                <span>{formatDateReadable(date)}</span>
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                {showDatePicker ? 'Close' : 'Change Date'}
              </span>
            </button>

            {showDatePicker && (
              <div style={{ marginTop: '10px', animation: 'fadeIn 0.15s ease-out' }}>
                <InteractiveCalendar
                  selectedDate={date}
                  onSelectDate={handleDateSelectFromCalendar}
                />
              </div>
            )}
          </div>

          {/* Primary Submit Button */}
          <button 
            type="submit" 
            disabled={isInsufficient || !amount || Number(amount) <= 0}
            className="btn btn-primary" 
            style={{ 
              width: '100%', 
              padding: '12px 16px', 
              fontSize: '13px', 
              fontWeight: 700,
              boxShadow: 'none',
              background: activeTab === 'topup' ? 'var(--notion-green-text)' : undefined,
              borderColor: activeTab === 'topup' ? 'var(--notion-green-text)' : undefined,
              color: activeTab === 'topup' ? '#ffffff' : undefined,
              opacity: (isInsufficient || !amount || Number(amount) <= 0) ? 0.5 : 1,
              cursor: (isInsufficient || !amount || Number(amount) <= 0) ? 'not-allowed' : 'pointer'
            }}
          >
            <CheckCircle2 size={16} /> {activeTab === 'expense' ? 'Save Expense' : `Add ${currencySymbol}${amount || 0} to Pocket Budget`}
          </button>
        </form>
      </div>
    </div>
  );
}
