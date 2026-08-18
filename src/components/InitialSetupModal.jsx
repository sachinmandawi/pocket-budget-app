import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Plus, Sliders, Moon, Sun, Wallet, Tag, Palette, RefreshCw } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../utils/storage';

export default function InitialSetupModal({ data, onSaveSettings, isOpen, initialTab = 'allowance', onClose, isDarkMode, onToggleDarkMode, onResetDemo }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const currencySymbol = data?.currency?.symbol || '₹';

  // Sync activeTab whenever modal opens with initialTab prop
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab || 'allowance');
    }
  }, [isOpen, initialTab]);

  // Allowance state
  const [allowance, setAllowance] = useState(data.monthlyAllowance || 1500);
  const [emergency, setEmergency] = useState(data.emergencyReserve || 200);
  const [fixedDeductions, setFixedDeductions] = useState(data.fixedDeductions || []);
  const [newFixedTitle, setNewFixedTitle] = useState('');
  const [newFixedAmount, setNewFixedAmount] = useState('');

  // Categories state
  const [categories, setCategories] = useState(data.categories || DEFAULT_CATEGORIES);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('🛍️');
  const [newCatColor, setNewCatColor] = useState('#007aff');

  if (!isOpen) return null;

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

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const catId = 'custom_' + Date.now();
    setCategories([
      ...categories,
      { id: catId, name: newCatName.trim(), icon: newCatIcon || '🏷️', color: newCatColor || '#007aff' }
    ]);
    setNewCatName('');
  };

  const handleRemoveCategory = (id) => {
    if (categories.length <= 1) {
      return;
    }
    setCategories(categories.filter(c => c.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      ...data,
      monthlyAllowance: Number(allowance),
      emergencyReserve: Number(emergency),
      fixedDeductions,
      categories
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-grab-handle" />

        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} color="var(--ios-blue)" />
            Settings
          </h3>
          <button onClick={onClose} className="btn btn-secondary btn-sm" style={{ width: '32px', height: '32px', padding: 0 }}>
            <X size={16} />
          </button>
        </div>

        {/* Settings Categories Segmented Switcher Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '4px',
          background: 'var(--bg-card-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px'
        }}>
          <button
            type="button"
            className="nav-item"
            style={{
              padding: '8px 4px',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'allowance' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'allowance' ? 'var(--ios-blue)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'allowance' ? 700 : 500,
              boxShadow: activeTab === 'allowance' ? 'var(--shadow-ios)' : 'none'
            }}
            onClick={() => setActiveTab('allowance')}
          >
            <Wallet size={16} />
            <span style={{ fontSize: '11px' }}>Pocket Money</span>
          </button>

          <button
            type="button"
            className="nav-item"
            style={{
              padding: '8px 4px',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'categories' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'categories' ? 'var(--ios-blue)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'categories' ? 700 : 500,
              boxShadow: activeTab === 'categories' ? 'var(--shadow-ios)' : 'none'
            }}
            onClick={() => setActiveTab('categories')}
          >
            <Tag size={16} />
            <span style={{ fontSize: '11px' }}>Categories</span>
          </button>

          <button
            type="button"
            className="nav-item"
            style={{
              padding: '8px 4px',
              borderRadius: 'var(--radius-sm)',
              background: activeTab === 'appearance' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'appearance' ? 'var(--ios-blue)' : 'var(--text-secondary)',
              fontWeight: activeTab === 'appearance' ? 700 : 500,
              boxShadow: activeTab === 'appearance' ? 'var(--shadow-ios)' : 'none'
            }}
            onClick={() => setActiveTab('appearance')}
          >
            <Moon size={16} />
            <span style={{ fontSize: '11px' }}>Theme</span>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* TAB 1: POCKET MONEY & EMERGENCY */}
          {activeTab === 'allowance' && (
            <div>
              <div className="form-group">
                <label className="form-label">Monthly Pocket Money ({data?.currency?.symbol || '₹'})</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  style={{ fontSize: '20px', fontWeight: 800 }}
                  value={allowance}
                  onChange={e => setAllowance(e.target.value)}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Monthly pocket money (e.g. {currencySymbol}1,500)
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Emergency Reserve ({currencySymbol})</label>
                <input
                  type="number"
                  required
                  className="form-input"
                  style={{ fontSize: '16px', fontWeight: 700 }}
                  value={emergency}
                  onChange={e => setEmergency(e.target.value)}
                />
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Locked emergency fund until Day 25.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Fixed Day-1 Expenses (Recharge/Pass)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '10px' }}>
                  {fixedDeductions.map(item => (
                    <div 
                      key={item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 12px',
                        background: 'var(--bg-card-subtle)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>{item.title}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800 }}>{currencySymbol}{item.amount}</span>
                        <button type="button" onClick={() => handleRemoveFixed(item.id)} className="btn btn-secondary btn-sm" style={{ width: '28px', height: '28px', padding: 0 }}>
                          <Trash2 size={13} color="var(--ios-red)" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Title (e.g. Recharge)"
                    className="form-input"
                    style={{ fontSize: '13px' }}
                    value={newFixedTitle}
                    onChange={e => setNewFixedTitle(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder={`${currencySymbol} Amount`}
                    className="form-input"
                    style={{ width: '90px', fontSize: '13px' }}
                    value={newFixedAmount}
                    onChange={e => setNewFixedAmount(e.target.value)}
                  />
                  <button type="button" onClick={handleAddFixed} className="btn btn-secondary btn-sm">
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CATEGORY MANAGER */}
          {activeTab === 'categories' && (
            <div>
              <label className="form-label">Manage Expense Categories</label>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      background: 'var(--bg-card-subtle)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px' }}>{cat.icon}</span>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: cat.color
                      }} />
                      <button 
                        type="button" 
                        onClick={() => handleRemoveCategory(cat.id)} 
                        className="btn btn-secondary btn-sm"
                        style={{ width: '28px', height: '28px', padding: 0 }}
                      >
                        <Trash2 size={13} color="var(--ios-red)" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Category Form */}
              <div style={{ background: 'var(--bg-card-subtle)', padding: '14px', borderRadius: 'var(--radius-md)' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                  ➕ Add Custom Category
                </span>
                
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                  <input
                    type="text"
                    placeholder="Emoji (e.g. 🍿)"
                    className="form-input"
                    style={{ width: '80px', fontSize: '16px', textAlign: 'center' }}
                    maxLength={3}
                    value={newCatIcon}
                    onChange={e => setNewCatIcon(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Category Name (e.g. Cinema)"
                    className="form-input"
                    style={{ flex: 1, fontSize: '13px' }}
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                  />
                  <input
                    type="color"
                    className="form-input"
                    style={{ width: '44px', padding: '4px', cursor: 'pointer' }}
                    value={newCatColor}
                    onChange={e => setNewCatColor(e.target.value)}
                  />
                </div>
                
                <button type="button" onClick={handleAddCategory} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                  <Plus size={14} /> Add Category
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: APPEARANCE & THEME */}
          {activeTab === 'appearance' && (
            <div>
              <label className="form-label">Theme Mode</label>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <button
                  type="button"
                  onClick={() => { if (isDarkMode) onToggleDarkMode(); }}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${!isDarkMode ? 'var(--ios-blue)' : 'var(--border-subtle)'}`,
                    background: !isDarkMode ? 'var(--ios-blue-bg)' : 'var(--bg-card-subtle)',
                    color: !isDarkMode ? 'var(--ios-blue)' : 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Sun size={24} color="var(--ios-orange)" />
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>☀️ Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => { if (!isDarkMode) onToggleDarkMode(); }}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${isDarkMode ? 'var(--ios-blue)' : 'var(--border-subtle)'}`,
                    background: isDarkMode ? 'var(--ios-blue-bg)' : 'var(--bg-card-subtle)',
                    color: isDarkMode ? 'var(--ios-blue)' : 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                  }}
                >
                  <Moon size={24} color="var(--ios-blue)" />
                  <span style={{ fontSize: '14px', fontWeight: 700 }}>🌙 Dark Mode</span>
                </button>
              </div>

              {/* Reset Data Section */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <label className="form-label">Data Reset</label>
                <button 
                  type="button"
                  onClick={onResetDemo}
                  className="btn btn-secondary btn-sm"
                  style={{ width: '100%', color: 'var(--ios-red)' }}
                >
                  <RefreshCw size={14} /> Reset All Budget Data
                </button>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', marginTop: '20px' }}>
            <Save size={16} /> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}
