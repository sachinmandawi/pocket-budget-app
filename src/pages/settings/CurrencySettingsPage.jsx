import React, { useState, useMemo } from 'react';
import { Search, Check, Plus, Trash2, Edit2, X } from 'lucide-react';
import { WORLD_CURRENCIES, DEFAULT_CURRENCY } from '../../utils/currencies';

export default function CurrencySettingsPage({ data, onSaveSettings, onBack }) {
  const currentCurrency = data?.currency || DEFAULT_CURRENCY;
  const customCurrencies = data?.customCurrencies || [];
  
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomCurrency, setEditingCustomCurrency] = useState(null);

  // Minimal Custom Form State
  const [symbol, setSymbol] = useState('$');
  const [code, setCode] = useState('USD');
  const [name, setName] = useState('United States');
  const [flag, setFlag] = useState('🪙');

  const allCurrencies = useMemo(() => {
    return [...customCurrencies, ...WORLD_CURRENCIES];
  }, [customCurrencies]);

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return allCurrencies;
    const q = searchQuery.toLowerCase().trim();
    return allCurrencies.filter(c => 
      (c.country && c.country.toLowerCase().includes(q)) ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.code && c.code.toLowerCase().includes(q)) ||
      (c.symbol && c.symbol.toLowerCase().includes(q))
    );
  }, [searchQuery, allCurrencies]);

  const handleSelect = (curr) => {
    setSelectedCurrency(curr);
    onSaveSettings({
      ...data,
      currency: curr
    });
  };

  const handleStartAdd = () => {
    setEditingCustomCurrency(null);
    setSymbol('$');
    setCode('USD');
    setName('Custom Currency');
    setFlag('🪙');
    setIsModalOpen(true);
  };

  const handleStartEdit = (curr) => {
    setEditingCustomCurrency(curr);
    setSymbol(curr.symbol || '$');
    setCode(curr.code || 'USD');
    setName(curr.name || curr.country || '');
    setFlag(curr.flag || '🪙');
    setIsModalOpen(true);
  };

  const handleSaveCustom = (e) => {
    e.preventDefault();
    if (!symbol.trim() || !code.trim()) return;

    if (editingCustomCurrency) {
      const updatedCurr = {
        ...editingCustomCurrency,
        code: code.trim().toUpperCase(),
        symbol: symbol.trim(),
        name: name.trim() || `${code.trim().toUpperCase()}`,
        country: name.trim() || 'Custom',
        flag: flag.trim() || '🪙',
        isCustom: true
      };

      const updatedList = customCurrencies.map(c => 
        (c.id === editingCustomCurrency.id || c.code === editingCustomCurrency.code) ? updatedCurr : c
      );

      let nextSelected = selectedCurrency;
      if (selectedCurrency.id === editingCustomCurrency.id || selectedCurrency.code === editingCustomCurrency.code) {
        nextSelected = updatedCurr;
        setSelectedCurrency(updatedCurr);
      }

      onSaveSettings({
        ...data,
        customCurrencies: updatedList,
        currency: nextSelected
      });
    } else {
      const newCurr = {
        id: 'custom_' + Date.now(),
        code: code.trim().toUpperCase(),
        symbol: symbol.trim(),
        name: name.trim() || `${code.trim().toUpperCase()}`,
        country: name.trim() || 'Custom',
        flag: flag.trim() || '🪙',
        isCustom: true
      };

      const updatedList = [newCurr, ...customCurrencies.filter(c => c.code !== newCurr.code)];
      setSelectedCurrency(newCurr);
      onSaveSettings({
        ...data,
        customCurrencies: updatedList,
        currency: newCurr
      });
    }

    setIsModalOpen(false);
    setEditingCustomCurrency(null);
  };

  const handleDeleteCustom = (e, currId, currCode) => {
    e.stopPropagation();
    const updatedList = customCurrencies.filter(c => c.id !== currId && c.code !== currCode);
    let nextCurr = selectedCurrency;
    if (selectedCurrency.code === currCode) {
      nextCurr = DEFAULT_CURRENCY;
      setSelectedCurrency(DEFAULT_CURRENCY);
    }
    onSaveSettings({
      ...data,
      customCurrencies: updatedList,
      currency: nextCurr
    });
  };

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out', paddingBottom: '30px' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.4px' }}>
            Currency & Region
          </h2>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
            Active: <strong style={{ color: 'var(--ios-blue)' }}>{selectedCurrency.flag} {selectedCurrency.code} ({selectedCurrency.symbol})</strong> • {selectedCurrency.country}
          </p>
        </div>

        <button
          type="button"
          onClick={handleStartAdd}
          className="btn btn-secondary btn-sm"
          style={{
            fontSize: '11px',
            fontWeight: 600,
            padding: '5px 10px',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Plus size={13} /> Custom
        </button>
      </div>

      {/* Search Input Bar */}
      <div style={{ position: 'relative', width: '100%', marginBottom: '14px' }}>
        <Search size={15} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
        <input 
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search currency or country..."
          style={{
            width: '100%',
            padding: '9px 30px 9px 34px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 600,
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        {searchQuery && (
          <button 
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '10px',
              top: '9px',
              background: 'none',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              padding: '2px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Currency List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {filteredCurrencies.map((curr) => {
          const isSelected = selectedCurrency.code === curr.code && selectedCurrency.symbol === curr.symbol;
          return (
            <div
              key={(curr.id || curr.code) + curr.symbol}
              onClick={() => handleSelect(curr)}
              className="notion-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 12px',
                cursor: 'pointer',
                border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'var(--bg-card-subtle)' : 'var(--bg-card)',
                transition: 'all 0.1s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, marginRight: '8px' }}>
                <div style={{
                  minWidth: '42px',
                  height: '34px',
                  padding: '0 4px',
                  borderRadius: 'var(--radius-sm)',
                  background: isSelected ? 'var(--text-primary)' : 'var(--bg-card-subtle)',
                  color: isSelected ? 'var(--bg-app)' : 'var(--text-primary)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: (curr.symbol || '').length >= 4 ? '10px' : (curr.symbol || '').length === 3 ? '11.5px' : '13.5px',
                  fontWeight: 700,
                  flexShrink: 0,
                  boxSizing: 'border-box',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden'
                }}>
                  {curr.symbol}
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1px', flexWrap: 'nowrap', overflow: 'hidden' }}>
                    <span style={{ fontSize: '13px', flexShrink: 0 }}>{curr.flag}</span>
                    <span style={{ 
                      fontSize: '13px', 
                      fontWeight: 600, 
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}>
                      {curr.code}
                    </span>
                    <span style={{ 
                      fontSize: '11px', 
                      color: 'var(--text-tertiary)', 
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      — {curr.country}
                    </span>
                    {curr.isCustom && (
                      <span className="notion-tag notion-tag-orange" style={{ fontSize: '9px', padding: '1px 4px', flexShrink: 0 }}>
                        Custom
                      </span>
                    )}
                  </div>
                  <div style={{ 
                    fontSize: '10.5px', 
                    color: 'var(--text-tertiary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {curr.name} ({curr.symbol})
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                {curr.isCustom && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(curr);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        width: '24px',
                        height: '24px',
                        padding: 0,
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                      title="Edit custom currency"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteCustom(e, curr.id, curr.code)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--notion-red-text)',
                        cursor: 'pointer',
                        width: '24px',
                        height: '24px',
                        padding: 0,
                        borderRadius: 'var(--radius-sm)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                      title="Delete custom currency"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}

                <div style={{
                  width: '24px',
                  height: '24px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {isSelected ? (
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Check size={11} color="var(--bg-app)" strokeWidth={3} />
                    </div>
                  ) : (
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      border: '1.5px solid var(--border-medium)'
                    }} />
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredCurrencies.length === 0 && (
          <div className="notion-card" style={{ padding: '20px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 6px', fontWeight: 500 }}>
              No currency found matching "{searchQuery}"
            </p>
            <button
              type="button"
              onClick={() => {
                setEditingCustomCurrency(null);
                setCode(searchQuery.toUpperCase().slice(0, 5));
                setSymbol(searchQuery.slice(0, 3));
                setName('Custom Currency');
                setFlag('🪙');
                setIsModalOpen(true);
              }}
              className="btn btn-primary btn-sm"
              style={{ marginTop: '6px' }}
            >
              <Plus size={13} /> Create Custom Currency
            </button>
          </div>
        )}
      </div>

      {/* Compact Modal for Custom Currency */}
      {isModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => {
            setIsModalOpen(false);
            setEditingCustomCurrency(null);
          }}
          style={{ alignItems: 'center', padding: '16px' }}
        >
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '320px',
              width: '100%',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              border: '1px solid var(--border-subtle)',
              animation: 'slideUp 0.2s ease-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {editingCustomCurrency ? 'Edit Custom Currency' : 'Custom Currency'}
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                  {editingCustomCurrency ? 'Update currency details & symbol' : 'Set your preferred symbol & code'}
                </p>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCustomCurrency(null);
                }}
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
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveCustom}>
              <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px', marginBottom: '10px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                    Symbol
                  </label>
                  <input
                    type="text"
                    inputMode="text"
                    required
                    placeholder="$"
                    maxLength={6}
                    value={symbol}
                    onChange={e => setSymbol(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '15px', fontWeight: 600, textAlign: 'center' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                    Code
                  </label>
                  <input
                    type="text"
                    inputMode="text"
                    required
                    placeholder="USD"
                    maxLength={5}
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    className="form-input"
                    style={{ fontSize: '13px', fontWeight: 600 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '50px 1fr', gap: '8px', marginBottom: '14px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                    Flag
                  </label>
                  <input
                    type="text"
                    inputMode="text"
                    maxLength={4}
                    value={flag}
                    onChange={e => setFlag(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '15px', textAlign: 'center' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>
                    Country / Name
                  </label>
                  <input
                    type="text"
                    inputMode="text"
                    placeholder="e.g. United States / USD"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '12px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '10px', fontSize: '12px', fontWeight: 600 }}
              >
                <Check size={14} /> {editingCustomCurrency ? 'Update Currency' : 'Apply & Save Currency'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
