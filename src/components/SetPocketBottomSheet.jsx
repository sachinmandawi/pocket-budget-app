import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import InteractiveCalendar from './InteractiveCalendar';
import ConfirmDeleteModal from './ConfirmDeleteModal';

export default function SetPocketBottomSheet({ isOpen, onClose, data, onSaveSettings }) {
  const [allowance, setAllowance] = useState(0);
  const [paydayAnchorDate, setPaydayAnchorDate] = useState(1);
  const [emergency, setEmergency] = useState(0);
  const [fixedDeductions, setFixedDeductions] = useState([]);
  const [newFixedTitle, setNewFixedTitle] = useState('');
  const [newFixedAmount, setNewFixedAmount] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [fixedToDelete, setFixedToDelete] = useState(null);

  useEffect(() => {
    if (isOpen && data) {
      setAllowance(data.monthlyAllowance !== undefined ? data.monthlyAllowance : 0);
      setPaydayAnchorDate(data.paydayAnchorDate || 1);
      setEmergency(data.emergencyReserve !== undefined ? data.emergencyReserve : 0);
      setFixedDeductions(data.fixedDeductions || []);
      setNewFixedTitle('');
      setNewFixedAmount('');
      setShowCalendar(false);
    }
  }, [isOpen, data]);

  if (!isOpen) return null;

  const currencySymbol = data?.currency?.symbol || '₹';
  const daySuffix = paydayAnchorDate === 1 ? 'st' : paydayAnchorDate === 2 ? 'nd' : paydayAnchorDate === 3 ? 'rd' : 'th';

  const handleDateSelect = (dateStr, dayNum) => {
    if (dayNum) setPaydayAnchorDate(dayNum);
  };

  const handleAddFixed = () => {
    if (!newFixedTitle || !newFixedAmount) return;
    setFixedDeductions([
      ...fixedDeductions,
      { id: 'fix-' + Date.now(), title: newFixedTitle, amount: Number(newFixedAmount) }
    ]);
    setNewFixedTitle('');
    setNewFixedAmount('');
  };

  const handleRemoveFixed = (id) => {
    setFixedDeductions(fixedDeductions.filter(item => item.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      ...data,
      monthlyAllowance: Number(allowance),
      paydayAnchorDate: Number(paydayAnchorDate),
      emergencyReserve: Number(emergency),
      fixedDeductions
    });
    onClose();
  };

  return (
    <>
      <div className="modal-overlay" style={{ alignItems: 'flex-end', padding: 0 }} onClick={onClose}>
        <div
          className="modal-content"
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: '480px',
            width: '100%',
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
            padding: '18px 18px 32px',
            animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            maxHeight: '92vh',
            overflowY: 'auto',
            background: 'var(--bg-card)',
            boxShadow: '0 -4px 32px rgba(0,0,0,0.18)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span style={{ fontSize: '18px' }}>👛</span>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Set Pocket Money</h3>
            </div>
            <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', borderRadius: 'var(--radius-sm)' }}>
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Monthly Pocket Money ({currencySymbol})</label>
              <input type="number" required className="form-input" style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }} value={allowance} onChange={e => setAllowance(e.target.value)} />
            </div>

            <div className="form-group">
              <div onClick={() => setShowCalendar(!showCalendar)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={15} color="var(--text-primary)" />
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', fontWeight: 600 }}>Credit Payday Date</span>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{paydayAnchorDate}{daySuffix} of every month</span>
                  </div>
                </div>
                <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '11px' }}>
                  {showCalendar ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  {showCalendar ? 'Close' : 'Change Date'}
                </button>
              </div>
              {showCalendar && (
                <div style={{ marginTop: '10px', animation: 'fadeIn 0.15s ease-out' }}>
                  <InteractiveCalendar selectedDate={null} paydayDay={paydayAnchorDate} onSelectDate={handleDateSelect} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Emergency Reserve ({currencySymbol})</label>
              <input type="number" required className="form-input" style={{ fontSize: '16px', fontWeight: 600 }} value={emergency} onChange={e => setEmergency(e.target.value)} />
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Fixed Bills</label>
              {fixedDeductions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                  {fixedDeductions.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'var(--bg-card-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', flex: 1, marginRight: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <span style={{ fontWeight: 600, fontSize: '12px' }}>{currencySymbol}{item.amount}</span>
                        <button type="button" onClick={() => setFixedToDelete(item)} style={{ width: '26px', height: '26px', padding: 0, background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Trash2 size={13} color="var(--notion-red-text)" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px auto', gap: '8px' }}>
                <input type="text" placeholder="Title (e.g. Bus Pass)" className="form-input" style={{ fontSize: '13px' }} value={newFixedTitle} onChange={e => setNewFixedTitle(e.target.value)} />
                <input type="number" placeholder="Amount" className="form-input" style={{ fontSize: '13px' }} value={newFixedAmount} onChange={e => setNewFixedAmount(e.target.value)} />
                <button type="button" onClick={handleAddFixed} className="btn btn-secondary btn-sm" style={{ padding: '0 12px' }}><Plus size={15} /></button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '8px', fontSize: '14px' }}>
              <Save size={16} /> Save Settings
            </button>
          </form>
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={!!fixedToDelete}
        title="Delete Fixed Bill?"
        message={`Delete "${fixedToDelete?.title}" (${currencySymbol}${fixedToDelete?.amount})?`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={() => { if (fixedToDelete?.id) handleRemoveFixed(fixedToDelete.id); }}
        onClose={() => setFixedToDelete(null)}
      />
    </>
  );
}
