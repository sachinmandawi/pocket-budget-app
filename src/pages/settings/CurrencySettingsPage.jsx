import React, { useState, useMemo } from 'react';
import { Search, Check, Save, Plus, Trash2, X } from 'lucide-react';
import { WORLD_CURRENCIES, DEFAULT_CURRENCY } from '../../utils/currencies';

export default function CurrencySettingsPage({ data, onSaveSettings, onBack }) {
  const currentCurrency = data?.currency || DEFAULT_CURRENCY;
  const customCurrencies = data?.customCurrencies || [];
  
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Minimal Custom Form State
  const [symbol, setSymbol] = useState('$');
  const [code, setCode] = useState('USD');
  const [name, setName] = useState('United States');
  const [flag, setFlag] = useState('🇺🇸');

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

  const handleSave = () => {
    onSaveSettings({
      ...data,
      currency: selectedCurrency
    });
    if (onBack) onBack();
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!symbol.trim() || !code.trim()) return;

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

    setIsModalOpen(false);
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
          onClick={handleSave}
          className="btn btn-primary btn-sm"
          style={{
            fontSize: '12px',
            fontWeight: 800,
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Save size={13} /> Save
        </button>
      </div>

      {/* Search & Add Custom Row */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
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
              outline: 'none'
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
                background: 'var(--bg-card-subtle)',
                border: 'none',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '10px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-secondary btn-sm"
          style={{
            whiteSpace: 'nowrap',
            fontSize: '12px',
            fontWeight: 700,
            padding: '0 12px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Plus size={14} color="var(--ios-blue)" /> Custom
        </button>
      </div>

      {/* Clean Currency List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {filteredCurrencies.map((curr) => {
          const isSelected = selectedCurrency.code === curr.code && selectedCurrency.symbol === curr.symbol;
          return (
            <div
              key={(curr.id || curr.code) + curr.symbol}
              onClick={() => handleSelect(curr)}
              className="ios-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: '12px',
                cursor: 'pointer',
                border: isSelected ? '1.5px solid var(--ios-blue)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'var(--ios-blue-bg)' : 'var(--bg-card)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: isSelected ? 'var(--ios-blue)' : 'var(--bg-card-subtle)',
                  color: isSelected ? '#FFFFFF' : 'var(--ios-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 800,
                  flexShrink: 0
                }}>
                  {curr.symbol}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1px' }}>
                    <span style={{ fontSize: '14px' }}>{curr.flag}</span>
                    <span style={{ 
                      fontSize: '13px', 
                      fontWeight: 800, 
                      color: isSelected ? 'var(--ios-blue)' : 'var(--text-primary)'
                    }}>
                      {curr.code}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      — {curr.country}
                    </span>
                    {curr.isCustom && (
                      <span style={{
                        fontSize: '9px',
                        fontWeight: 700,
                        background: 'var(--ios-orange-bg)',
                        color: 'var(--ios-orange)',
                        padding: '1px 5px',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        Custom
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>
                    {curr.name} ({curr.symbol})
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {curr.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteCustom(e, curr.id, curr.code)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--ios-red)',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '6px'
                    }}
                    title="Delete custom currency"
                  >
                    <Trash2 size={13} />
                  </button>
                )}

                {isSelected ? (
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'var(--ios-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={13} color="#FFFFFF" strokeWidth={3} />
                  </div>
                ) : (
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    border: '1.5px solid var(--border-medium)'
                  }} />
                )}
              </div>
            </div>
          );
        })}

        {filteredCurrencies.length === 0 && (
          <div className="ios-card" style={{ padding: '24px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 6px', fontWeight: 600 }}>
              No currency found matching "{searchQuery}"
            </p>
            <button
              type="button"
              onClick={() => {
                setCode(searchQuery.toUpperCase().slice(0, 5));
                setSymbol(searchQuery.slice(0, 3));
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

      {/* Clean Minimal Modal for Custom Currency */}
      {isModalOpen && (
        <div 
          className="modal-overlay" 
          onClick={() => setIsModalOpen(false)}
          style={{ alignItems: 'flex-end', padding: 0 }}
        >
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '460px',
              width: '100%',
              borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
              padding: '20px',
              animation: 'slideUp 0.25s ease-out'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  Custom Currency
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                  Set your preferred symbol & code
                </p>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-icon" 
                style={{ background: 'var(--bg-card-subtle)', borderRadius: '50%', width: '28px', height: '28px' }}
              >
                <X size={15} color="var(--text-primary)" />
              </button>
            </div>

            <form onSubmit={handleAddCustom}>
              <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Symbol
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="$"
                    maxLength={6}
                    value={symbol}
                    onChange={e => setSymbol(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '16px', fontWeight: 800, textAlign: 'center', color: 'var(--ios-blue)' }}
                    autoFocus
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="USD"
                    maxLength={5}
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    className="form-input"
                    style={{ fontSize: '14px', fontWeight: 800 }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr', gap: '10px', marginBottom: '16px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Flag
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={flag}
                    onChange={e => setFlag(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '16px', textAlign: 'center' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Country / Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. United States / USD"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="form-input"
                    style={{ fontSize: '13px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '13px', fontWeight: 800, borderRadius: 'var(--radius-md)' }}
              >
                <Check size={15} /> Apply & Save Currency
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
