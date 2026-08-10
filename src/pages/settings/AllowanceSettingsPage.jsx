import React, { useState } from 'react';
import { Save, Trash2, Plus, ArrowLeft, Calendar } from 'lucide-react';
import InteractiveCalendar from '../../components/InteractiveCalendar';

export default function AllowanceSettingsPage({ data, onSaveSettings, onBack }) {
  const [allowance, setAllowance] = useState(data.monthlyAllowance !== undefined ? data.monthlyAllowance : 0);
  const [paydayAnchorDate, setPaydayAnchorDate] = useState(data.paydayAnchorDate || 1);
  const [emergency, setEmergency] = useState(data.emergencyReserve !== undefined ? data.emergencyReserve : 0);
  const [fixedDeductions, setFixedDeductions] = useState(data.fixedDeductions || []);
  const [newFixedTitle, setNewFixedTitle] = useState('');
  const [newFixedAmount, setNewFixedAmount] = useState('');

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

  const daySuffix = paydayAnchorDate === 1 ? 'st' : paydayAnchorDate === 2 ? 'nd' : paydayAnchorDate === 3 ? 'rd' : 'th';

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <form onSubmit={handleSubmit} className="ios-card">
        <div className="form-group">
          <label className="form-label">Monthly Allowance (₹)</label>
          <input
            type="number"
            required
            className="form-input"
            style={{ fontSize: '22px', fontWeight: 800, color: 'var(--ios-blue)' }}
            value={allowance}
            onChange={e => setAllowance(e.target.value)}
          />
        </div>

        {/* Real Interactive Calendar Date Picker */}
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={14} color="var(--ios-blue)" />
            Credit Day: <strong style={{ color: 'var(--ios-blue)', marginLeft: '4px' }}>{paydayAnchorDate}{daySuffix} of month</strong>
          </label>
          
          <InteractiveCalendar
            selectedDate={null}
            paydayDay={paydayAnchorDate}
            onSelectDate={handleDateSelect}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Papa Emergency Reserve (₹)</label>
          <input
            type="number"
            required
            className="form-input"
            style={{ fontSize: '18px', fontWeight: 700 }}
            value={emergency}
            onChange={e => setEmergency(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Fixed Day-1 Expenses (Recharge / Pass)</label>
          {fixedDeductions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '10px' }}>
              {fixedDeductions.map(item => (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 12px',
                    background: 'var(--bg-card-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <span style={{ fontSize: '14px', fontWeight: 600 }}>{item.title}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 800 }}>₹{item.amount}</span>
                    <button type="button" onClick={() => handleRemoveFixed(item.id)} className="btn btn-secondary btn-sm" style={{ width: '32px', height: '32px', padding: 0 }}>
                      <Trash2 size={14} color="var(--ios-red)" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="Title (Recharge)"
              className="form-input"
              style={{ fontSize: '14px' }}
              value={newFixedTitle}
              onChange={e => setNewFixedTitle(e.target.value)}
            />
            <input
              type="number"
              placeholder="₹ Amount"
              className="form-input"
              style={{ width: '90px', fontSize: '14px' }}
              value={newFixedAmount}
              onChange={e => setNewFixedAmount(e.target.value)}
            />
            <button type="button" onClick={handleAddFixed} className="btn btn-secondary btn-sm">
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '10px' }}>
          <Save size={18} /> Save Settings
        </button>
      </form>
    </div>
  );
}
