import React, { useState } from 'react';
import { Save, Trash2, Plus, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import InteractiveCalendar from '../../components/InteractiveCalendar';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';

export default function AllowanceSettingsPage({ data, onSaveSettings, onBack }) {
  const [allowance, setAllowance] = useState(data.monthlyAllowance !== undefined ? data.monthlyAllowance : 0);
  const [paydayAnchorDate, setPaydayAnchorDate] = useState(data.paydayAnchorDate || 1);
  const [emergency, setEmergency] = useState(data.emergencyReserve !== undefined ? data.emergencyReserve : 0);
  const [fixedDeductions, setFixedDeductions] = useState(data.fixedDeductions || []);
  const [newFixedTitle, setNewFixedTitle] = useState('');
  const [newFixedAmount, setNewFixedAmount] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);
  const [fixedToDelete, setFixedToDelete] = useState(null);

  const handleDateSelect = (dateStr, dayNum) => {
    if (dayNum) {
      setPaydayAnchorDate(dayNum);
    }
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
    onBack();
  };

  const currencySymbol = data?.currency?.symbol || '₹';
  const daySuffix = paydayAnchorDate === 1 ? 'st' : paydayAnchorDate === 2 ? 'nd' : paydayAnchorDate === 3 ? 'rd' : 'th';

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <form onSubmit={handleSubmit} className="notion-card" style={{ marginBottom: '24px' }}>
        {/* Monthly Allowance Input */}
        <div className="form-group">
          <label className="form-label">Monthly Pocket Money ({currencySymbol})</label>
          <input
            type="number"
            required
            className="form-input"
            style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}
            value={allowance}
            onChange={e => setAllowance(e.target.value)}
          />
        </div>

        {/* Payday Anchor Date Collapsible Card */}
        <div className="form-group">
          <div 
            onClick={() => setShowCalendar(!showCalendar)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              background: 'var(--bg-card-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              cursor: 'pointer'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={15} color="var(--text-primary)" />
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', fontWeight: 600 }}>
                  Credit Payday Date
                </span>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {paydayAnchorDate}{daySuffix} of every month
                </span>
              </div>
            </div>

            <button type="button" className="btn btn-secondary btn-sm" style={{ padding: '4px 10px', fontSize: '11px' }}>
              {showCalendar ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              {showCalendar ? 'Close' : 'Change Date'}
            </button>
          </div>

          {showCalendar && (
            <div style={{ marginTop: '10px', animation: 'fadeIn 0.15s ease-out' }}>
              <InteractiveCalendar
                selectedDate={null}
                paydayDay={paydayAnchorDate}
                onSelectDate={handleDateSelect}
              />
            </div>
          )}
        </div>

        {/* Emergency Reserve Input */}
        <div className="form-group">
          <label className="form-label">Emergency Reserve ({currencySymbol})</label>
          <input
            type="number"
            required
            className="form-input"
            style={{ fontSize: '16px', fontWeight: 600 }}
            value={emergency}
            onChange={e => setEmergency(e.target.value)}
          />
        </div>

        {/* Fixed Day-1 Deductions */}
        <div className="form-group">
          <label className="form-label">Monthly Fixed Bills (Recharge / Pass)</label>
          {fixedDeductions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
              {fixedDeductions.map(item => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 10px',
                    background: 'var(--bg-card-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0, flex: 1, marginRight: '8px' }}>{item.title}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <span style={{ fontWeight: 600, fontSize: '12px', color: 'var(--text-primary)' }}>{currencySymbol}{item.amount}</span>
                    <button 
                      type="button" 
                      onClick={() => setFixedToDelete(item)} 
                      style={{ 
                        width: '26px', 
                        height: '26px', 
                        padding: 0, 
                        background: 'transparent', 
                        border: 'none', 
                        cursor: 'pointer', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}
                      title="Delete bill"
                    >
                      <Trash2 size={13} color="var(--notion-red-text)" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px auto', gap: '8px' }}>
            <input
              type="text"
              placeholder="Title (e.g. Bus Pass)"
              className="form-input"
              style={{ fontSize: '13px' }}
              value={newFixedTitle}
              onChange={e => setNewFixedTitle(e.target.value)}
            />
            <input
              type="number"
              placeholder={`${currencySymbol} Amount`}
              className="form-input"
              style={{ fontSize: '13px' }}
              value={newFixedAmount}
              onChange={e => setNewFixedAmount(e.target.value)}
            />
            <button type="button" onClick={handleAddFixed} className="btn btn-secondary btn-sm" style={{ padding: '0 14px' }}>
              <Plus size={15} /> Add
            </button>
          </div>
        </div>

        {/* Primary Save Button */}
        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '14px', marginTop: '12px', fontSize: '14px' }}
        >
          <Save size={16} /> Save Settings
        </button>
      </form>

      {/* Modern Delete Fixed Bill Confirmation Dialog */}
      <ConfirmDeleteModal
        isOpen={!!fixedToDelete}
        title="Delete Fixed Bill?"
        message={`Are you sure you want to delete "${fixedToDelete?.title}" (${currencySymbol}${fixedToDelete?.amount})?`}
        confirmText="Delete Bill"
        cancelText="Cancel"
        onConfirm={() => {
          if (fixedToDelete?.id) {
            handleRemoveFixed(fixedToDelete.id);
          }
        }}
        onClose={() => setFixedToDelete(null)}
      />
    </div>
  );
}
