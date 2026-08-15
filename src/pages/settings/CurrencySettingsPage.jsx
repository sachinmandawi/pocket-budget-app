import React, { useState, useMemo } from 'react';
import { Search, Check, Globe, Sparkles, Save, ArrowLeft, Plus } from 'lucide-react';
import { WORLD_CURRENCIES, DEFAULT_CURRENCY } from '../../utils/currencies';

export default function CurrencySettingsPage({ data, onSaveSettings, onBack }) {
  const currentCurrency = data?.currency || DEFAULT_CURRENCY;
  const [selectedCurrency, setSelectedCurrency] = useState(currentCurrency);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCustomOpen, setIsCustomOpen] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');
  const [customName, setCustomName] = useState('');

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

  const handleSaveCustom = (e) => {
    e.preventDefault();
    if (!customSymbol.trim() || !customCode.trim()) return;
    const customCurr = {
      code: customCode.trim().toUpperCase(),
      symbol: customSymbol.trim(),
      name: customName.trim() || customCode.trim().toUpperCase(),
      country: 'Custom',
      flag: '🌐'
    };
    setSelectedCurrency(customCurr);
    setIsCustomOpen(false);
  };

  const handleSave = () => {
    onSaveSettings({
      ...data,
      currency: selectedCurrency
    });
  };

  const popularCurrencies = WORLD_CURRENCIES.filter(c => c.popular);

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            type="button"
            onClick={onBack}
            className="btn-icon"
            style={{ padding: '6px', background: 'var(--bg-card-subtle)', borderRadius: '50%', border: 'none', cursor: 'pointer' }}
          >
            <ArrowLeft size={18} color="var(--text-primary)" />
          </button>
          <div>
            <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.3px' }}>
              Currency & Region
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0 }}>
              Choose your local country currency
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="btn btn-primary"
          style={{
            fontSize: '12px',
            fontWeight: 800,
            padding: '7px 14px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Save size={13} /> Save
        </button>
      </div>

      {/* Live Preview Card */}
      <div 
        className="ios-card" 
        style={{ 
          marginBottom: '16px',
          padding: '14px 16px',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(16, 185, 129, 0.08) 100%)',
          border: '1px solid var(--border-medium)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '22px' }}>{selectedCurrency.flag}</span>
            <div>
              <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {selectedCurrency.name} ({selectedCurrency.code})
              </span>
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Symbol: <strong style={{ color: 'var(--ios-blue)', fontSize: '13px' }}>{selectedCurrency.symbol}</strong> • {selectedCurrency.country}
              </span>
            </div>
          </div>
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            color: 'var(--ios-blue)',
            background: 'var(--ios-blue-bg)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            Preview
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block' }}>Daily Limit</span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
              {selectedCurrency.symbol} 250.00
            </span>
          </div>
          <div style={{ background: 'var(--bg-card)', padding: '8px 10px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, display: 'block' }}>Total In Hand</span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ios-green)' }}>
              {selectedCurrency.symbol} 4,500.00
            </span>
          </div>
        </div>
      </div>

      {/* Popular Currencies Quick Chips */}
      <div style={{ marginBottom: '14px' }}>
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '8px' }}>
          Popular Currencies
        </span>
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {popularCurrencies.map(curr => {
            const isSelected = selectedCurrency.code === curr.code;
            return (
              <button
                key={curr.code}
                type="button"
                onClick={() => handleSelect(curr)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-full)',
                  border: isSelected ? '1.5px solid var(--ios-blue)' : '1px solid var(--border-medium)',
                  background: isSelected ? 'var(--ios-blue-bg)' : 'var(--bg-card)',
                  color: isSelected ? 'var(--ios-blue)' : 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{curr.flag}</span>
                <span>{curr.code}</span>
                <span style={{ opacity: 0.7 }}>({curr.symbol})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search Input */}
      <div style={{ position: 'relative', marginBottom: '14px' }}>
        <Search size={15} color="var(--text-tertiary)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
        <input 
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search country, currency name or code (e.g. Philippines, PHP, ₱)..."
          style={{
            width: '100%',
            padding: '9px 12px 9px 34px',
            borderRadius: '12px',
            border: '1px solid var(--border-medium)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: '12px',
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
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Custom Currency Toggle */}
      <div style={{ marginBottom: '14px' }}>
        <button
          type="button"
          onClick={() => setIsCustomOpen(!isCustomOpen)}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '9px 12px',
            borderRadius: '12px',
            border: '1px dashed var(--border-medium)',
            background: 'var(--bg-card-subtle)',
            color: 'var(--ios-blue)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={14} /> Add Custom Currency Symbol
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
            {isCustomOpen ? 'Close ▲' : 'Open ▼'}
          </span>
        </button>

        {isCustomOpen && (
          <form onSubmit={handleSaveCustom} className="ios-card" style={{ marginTop: '8px', padding: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Currency Code (e.g. BTC, USDT)
                </label>
                <input 
                  type="text"
                  value={customCode}
                  onChange={e => setCustomCode(e.target.value)}
                  placeholder="CODE"
                  maxLength={6}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                  Symbol (e.g. ₿, ₮, 💎)
                </label>
                <input 
                  type="text"
                  value={customSymbol}
                  onChange={e => setCustomSymbol(e.target.value)}
                  placeholder="Symbol"
                  maxLength={5}
                  style={{
                    width: '100%',
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-medium)',
                    background: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                  required
                />
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Currency Name (Optional)
              </label>
              <input 
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="e.g. Bitcoin / Special Token"
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-medium)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  fontSize: '12px'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '7px', fontSize: '11px', fontWeight: 800, borderRadius: 'var(--radius-md)' }}
            >
              Apply Custom Currency
            </button>
          </form>
        )}
      </div>

      {/* All World Currencies List */}
      <div className="ios-card" style={{ padding: '4px' }}>
        <div style={{ padding: '10px 12px 6px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)' }}>
            All World Currencies
          </span>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-tertiary)' }}>
            {filteredCurrencies.length} found
          </span>
        </div>

        <div style={{ maxHeight: '420px', overflowY: 'auto' }}>
          {filteredCurrencies.map((curr, index) => {
            const isSelected = selectedCurrency.code === curr.code;
            return (
              <div
                key={curr.code}
                onClick={() => handleSelect(curr)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  borderBottom: index < filteredCurrencies.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  background: isSelected ? 'var(--ios-blue-bg)' : 'transparent',
                  transition: 'background 0.15s ease'
                }}
                className="menu-item-hover"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>{curr.flag}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? 'var(--ios-blue)' : 'var(--text-primary)' }}>
                        {curr.code}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'var(--text-secondary)',
                        background: 'var(--bg-card-subtle)',
                        padding: '1px 6px',
                        borderRadius: '6px'
                      }}>
                        {curr.symbol}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>
                      {curr.country} • {curr.name}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div style={{
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'var(--ios-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={14} color="#FFFFFF" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
