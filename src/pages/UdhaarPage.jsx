import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Search, 
  Calendar,
  X,
  Check,
  PiggyBank,
  Share2,
  Pencil,
  MoreVertical
} from 'lucide-react';
import { formatLocalYMD, formatDateReadable } from '../utils/storage';
import AddRepaymentModal from '../components/AddRepaymentModal';
import InteractiveCalendar from '../components/InteractiveCalendar';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

export default function UdhaarPage({ 
  debts = [], 
  currencySymbol = '₹', 
  onAddDebt, 
  onUpdateDebt, 
  onDeleteDebt,
  onAddRepayment,
  onAddExpense
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDebtForRepayment, setSelectedDebtForRepayment] = useState(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);
  const [editingDebt, setEditingDebt] = useState(null); // debt being edited
  const [debtToDelete, setDebtToDelete] = useState(null); // debt being confirmed for delete

  // New Debt Form State
  const [formType, setFormType] = useState('lent');
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [showDueDateCalendar, setShowDueDateCalendar] = useState(false);
  const [formNote, setFormNote] = useState('');
  const [formDeductFromBudget, setFormDeductFromBudget] = useState(false);
  const [formError, setFormError] = useState('');

  // Edit Form State
  const [editType, setEditType] = useState('lent');
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [showEditDueDateCalendar, setShowEditDueDateCalendar] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [editError, setEditError] = useState('');

  // 3-Dot Popup Menu State
  const [openMenuDebtId, setOpenMenuDebtId] = useState(null);

  // Close 3-dot popup menu when clicking outside
  useEffect(() => {
    if (!openMenuDebtId) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('[data-debt-menu]')) {
        setOpenMenuDebtId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [openMenuDebtId]);

  // Helper to accurately compute real remaining and repaid amounts
  const getDebtRemainingAndRepaid = (debt) => {
    if (debt.isSettled) {
      return { remaining: 0, returned: Number(debt.amount || 0) };
    }
    const actualRepaid = (debt.history || [])
      .filter(h => h.type === 'repayment')
      .reduce((sum, h) => sum + Number(h.amount || 0), 0);
    const remaining = Math.max(0, Number(debt.amount || 0) - actualRepaid);
    return { remaining, returned: actualRepaid };
  };

  // Calculate Net Totals
  const totals = useMemo(() => {
    let totalLent = 0;
    let totalLentPending = 0;
    let totalBorrowed = 0;
    let totalBorrowedPending = 0;

    debts.forEach(d => {
      const { remaining } = getDebtRemainingAndRepaid(d);
      if (d.type === 'lent') {
        totalLent += Number(d.amount || 0);
        if (!d.isSettled) totalLentPending += remaining;
      } else {
        totalBorrowed += Number(d.amount || 0);
        if (!d.isSettled) totalBorrowedPending += remaining;
      }
    });

    const netPosition = totalLentPending - totalBorrowedPending;

    return {
      totalLent,
      totalLentPending,
      totalBorrowed,
      totalBorrowedPending,
      netPosition
    };
  }, [debts]);

  // Filtered List
  const filteredDebts = useMemo(() => {
    return debts.filter(d => {
      if (activeFilter === 'lent' && (d.type !== 'lent' || d.isSettled)) return false;
      if (activeFilter === 'borrowed' && (d.type !== 'borrowed' || d.isSettled)) return false;
      if (activeFilter === 'settled' && !d.isSettled) return false;
      if (activeFilter === 'all' && d.isSettled) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (d.personName || '').toLowerCase().includes(q);
        const matchesNote = (d.note || '').toLowerCase().includes(q);
        const matchesPhone = (d.phone || '').includes(q);
        if (!matchesName && !matchesNote && !matchesPhone) return false;
      }

      return true;
    });
  }, [debts, activeFilter, searchQuery]);

  const handleOpenAddModal = (type = 'lent') => {
    setFormType(type);
    setFormName('');
    setFormPhone('');
    setFormAmount('');
    setFormDueDate('');
    setShowDueDateCalendar(false);
    setFormNote('');
    setFormDeductFromBudget(false);
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleCreateDebtSubmit = (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Please enter person name');
      return;
    }
    const numAmount = parseFloat(formAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setFormError('Please enter a valid amount');
      return;
    }

    const newDebt = {
      id: 'debt-' + Date.now(),
      personName: formName.trim(),
      phone: formPhone.trim(),
      type: formType,
      amount: numAmount,
      settledAmount: 0,
      remainingAmount: numAmount,
      dueDate: formDueDate || '',
      note: formNote.trim() || (formType === 'lent' ? 'Money lent' : 'Money borrowed'),
      history: [
        {
          id: 'log-' + Date.now(),
          date: formatLocalYMD(new Date()),
          amount: numAmount,
          type: 'initial',
          note: formNote.trim() || (formType === 'lent' ? 'Initial amount lent' : 'Initial amount borrowed')
        }
      ],
      isSettled: false,
      createdAt: formatLocalYMD(new Date())
    };

    onAddDebt(newDebt);

    if (formType === 'lent' && formDeductFromBudget && typeof onAddExpense === 'function') {
      onAddExpense({
        amount: numAmount,
        category: 'other',
        note: `Lent to ${formName.trim()}`,
        date: formatLocalYMD(new Date())
      });
    }

    setIsAddModalOpen(false);
    setShowDueDateCalendar(false);
  };

  const handleToggleSettle = (debt) => {
    const isNowSettled = !debt.isSettled;
    
    if (isNowSettled) {
      const { remaining } = getDebtRemainingAndRepaid(debt);
      const updated = {
        ...debt,
        isSettled: true,
        settledAmount: Number(debt.amount || 0),
        remainingAmount: 0,
        history: [
          ...(debt.history || []),
          {
            id: 'log-' + Date.now(),
            date: formatLocalYMD(new Date()),
            amount: remaining,
            type: 'settlement',
            note: 'Marked fully settled'
          }
        ]
      };
      onUpdateDebt(updated);
    } else {
      // Re-opening record: restore real repayments from history and clear auto-settlement log
      const actualRepaid = (debt.history || [])
        .filter(h => h.type === 'repayment')
        .reduce((sum, h) => sum + Number(h.amount || 0), 0);
      const newRemaining = Math.max(0, Number(debt.amount || 0) - actualRepaid);
      const cleanedHistory = (debt.history || []).filter(h => h.type !== 'settlement');
      
      const updated = {
        ...debt,
        isSettled: false,
        settledAmount: actualRepaid,
        remainingAmount: newRemaining,
        history: cleanedHistory
      };
      onUpdateDebt(updated);
    }
  };

  const handleWhatsAppReminder = (debt) => {
    const { remaining } = getDebtRemainingAndRepaid(debt);
    const cleanPhone = (debt.phone || '').replace(/[^0-9]/g, '');
    const phoneParam = cleanPhone ? (cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone) : '';
    
    const message = encodeURIComponent(
      `Hi ${debt.personName}, hope you are doing well! Just a quick friendly reminder regarding the ${currencySymbol}${remaining} balance${debt.note ? ` for "${debt.note}"` : ''}. Please let me know once transferred. Thank you! 🙏`
    );

    const url = phoneParam 
      ? `https://api.whatsapp.com/send?phone=${phoneParam}&text=${message}`
      : `https://api.whatsapp.com/send?text=${message}`;

    window.open(url, '_blank');
  };

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name.slice(0, 2) || 'U').toUpperCase();
  };

  const handleOpenEdit = (debt) => {
    setEditingDebt(debt);
    setEditType(debt.type);
    setEditName(debt.personName || '');
    setEditPhone(debt.phone || '');
    setEditDueDate(debt.dueDate || '');
    setShowEditDueDateCalendar(false);
    setEditNote(debt.note || '');
    setEditError('');
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      setEditError('Please enter person name');
      return;
    }
    const updated = {
      ...editingDebt,
      type: editType,
      personName: editName.trim(),
      phone: editPhone.trim(),
      dueDate: editDueDate || '',
      note: editNote.trim() || (editType === 'lent' ? 'Money lent' : 'Money borrowed'),
    };
    onUpdateDebt(updated);
    setEditingDebt(null);
  };

  const todayStr = formatLocalYMD(new Date());

  return (
    <div style={{ animation: 'fadeIn 0.2s ease-out' }}>
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🤝</span>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Loans & Debts
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '1px 0 0' }}>
              Track money lent & debts owed
            </p>
          </div>
        </div>

        <button
          onClick={() => handleOpenAddModal('lent')}
          className="btn btn-primary btn-sm"
          style={{ padding: '5px 10px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
        >
          <Plus size={13} /> Add Record
        </button>
      </div>

      {/* Unified Minimal Summary Card */}
      <div className="notion-card" style={{ 
        padding: '12px 14px', 
        marginBottom: '12px', 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr 1fr', 
        gap: '4px',
        alignItems: 'center'
      }}>
        {/* To Collect */}
        <div>
          <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', display: 'block', fontWeight: 500, marginBottom: '2px' }}>
            To Collect
          </span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ios-green)' }}>
            +{currencySymbol}{totals.totalLentPending.toLocaleString()}
          </span>
        </div>

        {/* To Return */}
        <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '10px' }}>
          <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', display: 'block', fontWeight: 500, marginBottom: '2px' }}>
            To Return
          </span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ios-red)' }}>
            -{currencySymbol}{totals.totalBorrowedPending.toLocaleString()}
          </span>
        </div>

        {/* Net Balance */}
        <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '10px' }}>
          <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', display: 'block', fontWeight: 500, marginBottom: '2px' }}>
            Net Balance
          </span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: totals.netPosition >= 0 ? 'var(--ios-blue)' : 'var(--ios-orange)' }}>
            {totals.netPosition >= 0 ? '+' : ''}{currencySymbol}{totals.netPosition.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          {[
            { id: 'all', label: `Pending (${debts.filter(d => !d.isSettled).length})` },
            { id: 'lent', label: `Lent (${debts.filter(d => d.type === 'lent' && !d.isSettled).length})` },
            { id: 'borrowed', label: `Borrowed (${debts.filter(d => d.type === 'borrowed' && !d.isSettled).length})` },
            { id: 'settled', label: `Settled (${debts.filter(d => d.isSettled).length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id)}
              style={{
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11.5px',
                fontWeight: activeFilter === tab.id ? 600 : 500,
                background: activeFilter === tab.id ? 'var(--text-primary)' : 'var(--bg-card-subtle)',
                color: activeFilter === tab.id ? 'var(--bg-app)' : 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search name, purpose, or phone..."
            style={{
              width: '100%',
              padding: '6px 10px 6px 30px',
              fontSize: '12px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card-subtle)',
              color: 'var(--text-primary)',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Debt Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredDebts.length === 0 ? (
          <div className="notion-card" style={{ padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🤝</div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              {searchQuery ? 'No matching records found' : activeFilter === 'settled' ? 'No settled debts yet' : 'No pending debts! All clear 🎉'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '4px 0 16px' }}>
              {searchQuery ? 'Try searching another keyword' : 'Keep track of money lent to friends or borrowed debts easily.'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => handleOpenAddModal('lent')}
                className="btn btn-primary"
                style={{ padding: '8px 16px', fontSize: '12px', margin: '0 auto' }}
              >
                <Plus size={14} /> Add First Record
              </button>
            )}
          </div>
        ) : (
          filteredDebts.map(debt => {
            const { remaining, returned } = getDebtRemainingAndRepaid(debt);
            const total = Number(debt.amount || 0);
            const percentReturned = total > 0 ? Math.min(100, Math.round((returned / total) * 100)) : 0;
            const isOverdue = debt.dueDate && debt.dueDate < todayStr && !debt.isSettled;
            const isLent = debt.type === 'lent';
            const isExpanded = expandedHistoryId === debt.id;

            return (
              <div
                key={debt.id}
                className="notion-card"
                style={{
                  padding: '14px 16px',
                  margin: 0,
                  borderLeft: `4px solid ${debt.isSettled ? 'var(--text-tertiary)' : isLent ? 'var(--ios-green)' : 'var(--ios-red)'}`,
                  opacity: debt.isSettled ? 0.75 : 1,
                  position: 'relative',
                  zIndex: openMenuDebtId === debt.id ? 90 : 1
                }}
              >
                {/* Card Top Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    {/* Avatar Initials */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--radius-full)',
                      background: debt.isSettled ? 'var(--bg-card-subtle)' : isLent ? 'var(--ios-green-bg)' : 'var(--ios-red-bg)',
                      color: debt.isSettled ? 'var(--text-tertiary)' : isLent ? 'var(--ios-green)' : 'var(--ios-red)',
                      fontWeight: 700,
                      fontSize: '13px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {getInitials(debt.personName)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                        <span style={{ 
                          fontSize: '14px', 
                          fontWeight: 600, 
                          color: 'var(--text-primary)',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          minWidth: 0
                        }}>
                          {debt.personName}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: 'var(--radius-sm)',
                          background: debt.isSettled ? 'var(--bg-card-subtle)' : isLent ? 'var(--ios-green-bg)' : 'var(--ios-red-bg)',
                          color: debt.isSettled ? 'var(--text-tertiary)' : isLent ? 'var(--ios-green)' : 'var(--ios-red)',
                          fontWeight: 600,
                          flexShrink: 0
                        }}>
                          {debt.isSettled ? 'Settled ✓' : isLent ? 'You Lent' : 'You Owe'}
                        </span>
                      </div>
                      {debt.note && (
                        <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {debt.note}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Amount Display & Top-Right 3-Dot Menu */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '10px' }}>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: debt.isSettled ? 'var(--text-tertiary)' : isLent ? 'var(--ios-green)' : 'var(--ios-red)',
                        letterSpacing: '-0.2px',
                        whiteSpace: 'nowrap'
                      }}>
                        {currencySymbol}{remaining.toLocaleString()}
                      </div>
                      {returned > 0 && !debt.isSettled && (
                        <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                          of {currencySymbol}{total.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {/* Upper-Right 3-Dot Action Menu */}
                    <div style={{ position: 'relative', flexShrink: 0 }} data-debt-menu={debt.id}>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setOpenMenuDebtId(openMenuDebtId === debt.id ? null : debt.id);
                        }}
                        title="Actions"
                        style={{
                          width: '26px',
                          height: '26px',
                          padding: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--text-tertiary)',
                          cursor: 'pointer'
                        }}
                      >
                        <MoreVertical size={14} />
                      </button>

                      {openMenuDebtId === debt.id && (
                        <div
                          onClick={e => e.stopPropagation()}
                          style={{
                            position: 'absolute',
                            right: 0,
                            top: '28px',
                            zIndex: 100,
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-medium)',
                            borderRadius: 'var(--radius-sm)',
                            boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45)',
                            padding: '4px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '2px',
                            minWidth: '145px',
                            animation: 'fadeIn 0.12s ease-out'
                          }}
                        >
                          {/* Add Payment (if not settled) */}
                          {!debt.isSettled && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setOpenMenuDebtId(null);
                                setSelectedDebtForRepayment(debt);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '7px',
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
                              <Plus size={13} color="var(--ios-green)" /> Add Payment
                            </button>
                          )}

                          {/* Settle / Re-open */}
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setOpenMenuDebtId(null);
                              handleToggleSettle(debt);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '7px',
                              padding: '6px 8px',
                              background: 'none',
                              border: 'none',
                              fontSize: '12px',
                              fontWeight: 500,
                              color: debt.isSettled ? 'var(--ios-blue)' : 'var(--text-primary)',
                              borderRadius: 'var(--radius-sm)',
                              cursor: 'pointer',
                              textAlign: 'left',
                              width: '100%'
                            }}
                          >
                            <CheckCircle2 size={13} color={debt.isSettled ? 'var(--ios-blue)' : 'var(--text-secondary)'} />
                            {debt.isSettled ? 'Re-open Record' : 'Mark Settled'}
                          </button>

                          {/* WhatsApp Reminder (if lent and not settled) */}
                          {!debt.isSettled && isLent && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setOpenMenuDebtId(null);
                                handleWhatsAppReminder(debt);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '7px',
                                padding: '6px 8px',
                                background: 'none',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: '#25D366',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%'
                              }}
                            >
                              <MessageCircle size={13} color="#25D366" /> Send Reminder
                            </button>
                          )}

                          {/* Logs toggle (if history exists) */}
                          {debt.history && debt.history.length > 0 && (
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                setOpenMenuDebtId(null);
                                setExpandedHistoryId(isExpanded ? null : debt.id);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '7px',
                                padding: '6px 8px',
                                background: 'none',
                                border: 'none',
                                fontSize: '12px',
                                fontWeight: 500,
                                color: 'var(--text-secondary)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: 'pointer',
                                textAlign: 'left',
                                width: '100%'
                              }}
                            >
                              <Clock size={13} color="var(--text-secondary)" />
                              {isExpanded ? 'Hide Logs' : `View Logs (${debt.history.length})`}
                            </button>
                          )}

                          <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '3px 0' }} />

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setOpenMenuDebtId(null);
                              handleOpenEdit(debt);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '7px',
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
                            <Pencil size={13} color="var(--text-secondary)" /> Edit Record
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={e => {
                              e.stopPropagation();
                              setOpenMenuDebtId(null);
                              setDebtToDelete(debt);
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '7px',
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
                            <Trash2 size={13} color="var(--notion-red-text)" /> Delete Record
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar (if partial return) */}
                {total > 0 && !debt.isSettled && returned > 0 && (
                  <div style={{ margin: '6px 0 8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-tertiary)', marginBottom: '3px' }}>
                      <span>{percentReturned}% Returned ({currencySymbol}{returned})</span>
                      <span>Remaining: {currencySymbol}{remaining}</span>
                    </div>
                    <div style={{ width: '100%', height: '5px', background: 'var(--bg-card-subtle)', borderRadius: '999px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${percentReturned}%`,
                        height: '100%',
                        background: isLent ? 'var(--ios-green)' : 'var(--ios-red)',
                        borderRadius: '999px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>
                )}

                {/* Due Date & Timestamp Tags */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  <span>Created {formatDateReadable(debt.createdAt || debt.history?.[0]?.date)}</span>
                  {debt.dueDate && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      color: isOverdue ? 'var(--ios-red)' : 'var(--text-secondary)',
                      fontWeight: isOverdue ? 600 : 400
                    }}>
                      <Clock size={11} /> Due: {formatDateReadable(debt.dueDate)} {isOverdue && '(Overdue!)'}
                    </span>
                  )}
                </div>


                {/* Expanded Payment History Logs */}
                {isExpanded && debt.history && (
                  <div style={{
                    marginTop: '10px',
                    padding: '10px 12px',
                    background: 'var(--bg-card-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '11.5px'
                  }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Payment & Repayment History
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {debt.history.map(log => (
                        <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                          <div style={{ minWidth: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                              {log.note || (log.type === 'initial' ? 'Initial entry' : 'Payment')}
                            </span>
                            <span style={{ color: 'var(--text-tertiary)', marginLeft: '6px', fontSize: '10.5px' }}>
                              ({formatDateReadable(log.date)})
                            </span>
                          </div>
                          <span style={{ fontWeight: 600, color: log.type === 'repayment' || log.type === 'settlement' ? 'var(--ios-green)' : 'var(--text-primary)', flexShrink: 0, whiteSpace: 'nowrap' }}>
                            {currencySymbol}{Number(log.amount).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add New Debt Record Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" style={{ alignItems: 'flex-end', padding: 0, zIndex: 1000 }} onClick={() => { setIsAddModalOpen(false); setShowDueDateCalendar(false); }}>
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()}
            style={{ 
              maxWidth: '480px', 
              width: '100%', 
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              padding: '20px 18px 24px',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '18px' }}>🤝</span>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  New Loan / Debt Record
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => { setIsAddModalOpen(false); setShowDueDateCalendar(false); }}
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

            <form onSubmit={handleCreateDebtSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {formError && (
                <div style={{
                  padding: '8px 12px',
                  background: 'var(--ios-red-bg)',
                  color: 'var(--ios-red)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  fontWeight: 500
                }}>
                  {formError}
                </div>
              )}

              {/* Type Switcher: Lent vs Borrowed */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Transaction Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setFormType('lent')}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: formType === 'lent' ? '2px solid var(--ios-green)' : '1px solid var(--border-subtle)',
                      background: formType === 'lent' ? 'var(--ios-green-bg)' : 'var(--bg-card-subtle)',
                      color: formType === 'lent' ? 'var(--ios-green)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '12.5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowDownLeft size={16} /> I Lent
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormType('borrowed')}
                    style={{
                      padding: '10px',
                      borderRadius: 'var(--radius-md)',
                      border: formType === 'borrowed' ? '2px solid var(--ios-red)' : '1px solid var(--border-subtle)',
                      background: formType === 'borrowed' ? 'var(--ios-red-bg)' : 'var(--bg-card-subtle)',
                      color: formType === 'borrowed' ? 'var(--ios-red)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '12.5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowUpRight size={16} /> I Borrowed
                  </button>
                </div>
              </div>

              {/* Person Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Person / Entity Name *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => { setFormName(e.target.value); setFormError(''); }}
                  placeholder="e.g. Rahul Sharma, Amit, Landlord"
                  style={{
                    width: '100%',
                    fontSize: '14px',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Amount */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Total Amount ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="any"
                  inputMode="decimal"
                  value={formAmount}
                  onChange={e => { setFormAmount(e.target.value); setFormError(''); }}
                  placeholder="0"
                  style={{
                    width: '100%',
                    fontSize: '20px',
                    fontWeight: 700,
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Phone (Optional) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={e => setFormPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  style={{
                    width: '100%',
                    fontSize: '13px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Due Date (Optional) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Expected Return Date (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowDueDateCalendar(!showDueDateCalendar)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-input)',
                    border: showDueDateCalendar ? '1px solid var(--border-medium)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={15} color="var(--text-secondary)" />
                    <span>{formDueDate ? formatDateReadable(formDueDate) : 'Select return date'}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    {showDueDateCalendar ? 'Close' : formDueDate ? 'Change' : 'Set Date'}
                  </span>
                </button>

                {formDueDate && (
                  <button
                    type="button"
                    onClick={() => setFormDueDate('')}
                    style={{ marginTop: '4px', fontSize: '11px', color: 'var(--ios-red)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
                  >
                    ✕ Clear date
                  </button>
                )}

                {showDueDateCalendar && (
                  <div style={{ marginTop: '8px', animation: 'fadeIn 0.15s ease-out' }}>
                    <InteractiveCalendar
                      selectedDate={formDueDate || formatLocalYMD(new Date())}
                      onSelectDate={(d) => {
                        setFormDueDate(d);
                        setShowDueDateCalendar(false);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Note / Purpose */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Note / Purpose
                </label>
                <input
                  type="text"
                  value={formNote}
                  onChange={e => setFormNote(e.target.value)}
                  placeholder="e.g. Dinner bill split, Emergency loan, Travel advance"
                  style={{
                    width: '100%',
                    fontSize: '13px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Optional: Deduct from Daily Spend (Only for Lent money) */}
              {formType === 'lent' && (
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card-subtle)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: 'var(--text-primary)'
                }}>
                  <input
                    type="checkbox"
                    checked={formDeductFromBudget}
                    onChange={e => setFormDeductFromBudget(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--ios-blue)' }}
                  />
                  <div>
                    <span style={{ fontWeight: 600 }}>Deduct from Today's Safe Spend</span>
                    <p style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', margin: 0 }}>
                      Count this cash as today's expense so your daily wallet stays balanced
                    </p>
                  </div>
                </label>
              )}

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => { setIsAddModalOpen(false); setShowDueDateCalendar(false); }}
                  className="btn btn-secondary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <Check size={16} /> Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Partial/Full Repayment Modal */}
      {selectedDebtForRepayment && (
        <AddRepaymentModal
          isOpen={Boolean(selectedDebtForRepayment)}
          debt={selectedDebtForRepayment}
          currencySymbol={currencySymbol}
          onClose={() => setSelectedDebtForRepayment(null)}
          onAddRepayment={(paymentData) => {
            onAddRepayment(paymentData);
            setSelectedDebtForRepayment(null);
          }}
        />
      )}

      {/* Edit Debt Record Modal */}
      {editingDebt && (
        <div className="modal-overlay" style={{ alignItems: 'flex-end', padding: 0, zIndex: 1000 }} onClick={() => setEditingDebt(null)}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '480px',
              width: '100%',
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              padding: '20px 18px 24px',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Pencil size={16} color="var(--ios-blue)" />
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Edit Record — {editingDebt.personName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingDebt(null)}
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
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {editError && (
                <div style={{
                  padding: '8px 12px',
                  background: 'var(--ios-red-bg)',
                  color: 'var(--ios-red)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '12px',
                  fontWeight: 500
                }}>
                  {editError}
                </div>
              )}

              {/* Type (cannot change if there are repayments) */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Transaction Type
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setEditType('lent')}
                    style={{
                      padding: '9px',
                      borderRadius: 'var(--radius-md)',
                      border: editType === 'lent' ? '2px solid var(--ios-green)' : '1px solid var(--border-subtle)',
                      background: editType === 'lent' ? 'var(--ios-green-bg)' : 'var(--bg-card-subtle)',
                      color: editType === 'lent' ? 'var(--ios-green)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '12.5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowDownLeft size={15} /> I Lent
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditType('borrowed')}
                    style={{
                      padding: '9px',
                      borderRadius: 'var(--radius-md)',
                      border: editType === 'borrowed' ? '2px solid var(--ios-red)' : '1px solid var(--border-subtle)',
                      background: editType === 'borrowed' ? 'var(--ios-red-bg)' : 'var(--bg-card-subtle)',
                      color: editType === 'borrowed' ? 'var(--ios-red)' : 'var(--text-secondary)',
                      fontWeight: 600,
                      fontSize: '12.5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <ArrowUpRight size={15} /> I Borrowed
                  </button>
                </div>
              </div>

              {/* Person Name */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Person / Entity Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => { setEditName(e.target.value); setEditError(''); }}
                  placeholder="e.g. Rahul Sharma"
                  style={{
                    width: '100%',
                    fontSize: '14px',
                    padding: '9px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  style={{
                    width: '100%',
                    fontSize: '13px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Due Date */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Expected Return Date (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowEditDueDateCalendar(!showEditDueDateCalendar)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: 'var(--bg-input)',
                    border: showEditDueDateCalendar ? '1px solid var(--border-medium)' : '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    boxSizing: 'border-box'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={15} color="var(--text-secondary)" />
                    <span>{editDueDate ? formatDateReadable(editDueDate) : 'Select return date'}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    {showEditDueDateCalendar ? 'Close' : editDueDate ? 'Change' : 'Set Date'}
                  </span>
                </button>
                {editDueDate && (
                  <button
                    type="button"
                    onClick={() => setEditDueDate('')}
                    style={{ marginTop: '4px', fontSize: '11px', color: 'var(--ios-red)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
                  >
                    ✕ Clear date
                  </button>
                )}
                {showEditDueDateCalendar && (
                  <div style={{ marginTop: '8px', animation: 'fadeIn 0.15s ease-out' }}>
                    <InteractiveCalendar
                      selectedDate={editDueDate || formatLocalYMD(new Date())}
                      onSelectDate={(d) => {
                        setEditDueDate(d);
                        setShowEditDueDateCalendar(false);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Note */}
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Note / Purpose
                </label>
                <input
                  type="text"
                  value={editNote}
                  onChange={e => setEditNote(e.target.value)}
                  placeholder="e.g. Dinner bill, Emergency loan"
                  style={{
                    width: '100%',
                    fontSize: '13px',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-input)',
                    color: 'var(--text-primary)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Info note about amount */}
              <div style={{
                padding: '8px 12px',
                background: 'var(--bg-card-subtle)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
                fontSize: '11.5px',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                💡 Amount cannot be edited to protect repayment history integrity.
              </div>

              {/* Save Changes Button */}
              <div style={{ marginTop: '16px' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '11px',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Check size={16} /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Delete Confirmation Dialog */}
      <ConfirmDeleteModal
        isOpen={!!debtToDelete}
        title={`Delete record for ${debtToDelete?.personName || 'this person'}?`}
        message="This will permanently delete this loan/debt record along with all associated payment history logs."
        confirmText="Delete Record"
        cancelText="Cancel"
        onConfirm={() => {
          if (debtToDelete?.id) {
            onDeleteDebt(debtToDelete.id);
          }
        }}
        onClose={() => setDebtToDelete(null)}
      />

    </div>
  );
}
