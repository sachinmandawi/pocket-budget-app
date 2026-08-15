import React, { useState, useMemo } from 'react';
import { Search, Check, Save } from 'lucide-react';
import { WORLD_CURRENCIES, DEFAULT_CURRENCY } from '../../utils/currencies';

export default function CurrencySettingsPage({ data, onSaveSettings, onBack }) {
  const currentCurrency = data?.currency || DEFAULT_CURRENCY;
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) return WORLD_CURRENCIES;
    const q = searchQuery.toLowerCase().trim();
    return WORLD_CURRENCIES.filter(c => 
      c.country.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.symbol.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelect = (curr) => {
    setSelectedCurrency(curr);
  };

  const handleSave = () => {
    onSaveSettings({
      ...data,
      currency: selectedCurrency
    });
    if (onBack) onBack();
  };

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out', paddingBottom: '30px' }}>
      {/* Top Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.4px' }}>
            Select Currency
          </h2>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
            Active: <strong style={{ color: 'var(--ios-blue)' }}>{selectedCurrency.code} ({selectedCurrency.symbol})</strong> • {selectedCurrency.country}
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="btn btn-primary"
          style={{
            fontSize: '12px',
            fontWeight: 800,
            padding: '8px 16px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)'
          }}
        >
          <Save size={13} /> Save
        </button>
      </div>

      {/* Sleek Search Input */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <Search size={16} color="var(--text-tertiary)" style={{ position: 'absolute', left: '14px', top: '12px' }} />
        <input 
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search country or currency (e.g. Philippines, PHP, ₱, USD)..."
          style={{
            width: '100%',
            padding: '10px 36px 10px 38px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '13px',
            fontWeight: 600,
            outline: 'none',
            boxShadow: 'var(--shadow-sm)'
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              position: 'absolute',
              right: '12px',
              top: '10px',
              background: 'var(--bg-card-subtle)',
              border: 'none',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '11px',
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

      {/* Clean, Modern Currency Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {filteredCurrencies.map((curr) => {
          const isSelected = selectedCurrency.code === curr.code;
          return (
            <div
              key={curr.code}
              onClick={() => handleSelect(curr)}
              className="ios-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                borderRadius: '14px',
                cursor: 'pointer',
                border: isSelected ? '1.5px solid var(--ios-blue)' : '1px solid var(--border-subtle)',
                background: isSelected ? 'var(--ios-blue-bg)' : 'var(--bg-card)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {/* Clean Currency Symbol Avatar Badge */}
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: isSelected ? 'var(--ios-blue)' : 'var(--bg-card-subtle)',
                  color: isSelected ? '#FFFFFF' : 'var(--ios-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 800,
                  flexShrink: 0,
                  boxShadow: isSelected ? '0 3px 10px rgba(37, 99, 235, 0.25)' : 'none'
                }}>
                  {curr.symbol}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: 800, 
                      color: isSelected ? 'var(--ios-blue)' : 'var(--text-primary)',
                      letterSpacing: '-0.2px'
                    }}>
                      {curr.code}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                      — {curr.country}
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block' }}>
                    {curr.name}
                  </span>
                </div>
              </div>

              {isSelected ? (
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: 'var(--ios-blue)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)'
                }}>
                  <Check size={14} color="#FFFFFF" strokeWidth={3} />
                </div>
              ) : (
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--border-medium)'
                }} />
              )}
            </div>
          );
        })}

        {filteredCurrencies.length === 0 && (
          <div className="ios-card" style={{ padding: '30px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 6px', fontWeight: 600 }}>
              No currency found matching "{searchQuery}"
            </p>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              Try searching by country name (e.g. Philippines) or code (e.g. PHP)
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
