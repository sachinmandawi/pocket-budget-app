import React, { useState } from 'react';
import { Clock, Plus, Trash2, Target, CheckCircle2, Edit3, X } from 'lucide-react';
import { formatCurrencyAmount } from '../utils/currencies';

export default function WishlistCooloff({ 
  wishlist, 
  onAddWishItem, 
  onDeleteWishItem, 
  onEditWishItem,
  showAddForm, 
  setShowAddForm, 
  currencySymbol = '₹' 
}) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [editingWish, setEditingWish] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAmount, setEditAmount] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    onAddWishItem({
      id: 'wish-' + Date.now(),
      title: title.trim(),
      amount: Number(amount),
      createdAt: new Date().toISOString(),
      cooloffHours: 48,
      status: 'waiting'
    });

    setTitle('');
    setAmount('');
    setShowAddForm(false);
  };

  const getRemainingHours = (createdAt, cooloffHours) => {
    const created = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const elapsedHours = (now - created) / (1000 * 60 * 60);
    return Math.max(0, Math.round(cooloffHours - elapsedHours));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Add Wish Form Overlay Card */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="notion-card" style={{ animation: 'fadeIn 0.15s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={14} color="var(--notion-purple-text)" />
              Add Wishlist Item
            </span>
            <button 
              type="button"
              onClick={() => setShowAddForm(false)}
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

          <div className="form-group">
            <label className="form-label">Item Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Swiggy Pizza / Headphones"
              className="form-input"
              style={{ fontSize: '14px' }}
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Estimated Price ({currencySymbol})</label>
            <input
              type="number"
              required
              placeholder="e.g. 500"
              className="form-input"
              style={{ fontSize: '14px' }}
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '14px' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '12px', fontSize: '13px' }}>
              Add to Wishlist
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary" style={{ padding: '12px', fontSize: '13px' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Main Wishlist Card */}
      <div className="notion-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 14px',
          borderBottom: wishlist.length > 0 ? '1px solid var(--border-subtle)' : 'none',
          background: 'var(--bg-card)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} color="var(--notion-purple-text)" />
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
              48-Hour Wishlist
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {wishlist.length > 0 && (
              <span className="notion-tag notion-tag-gray" style={{ fontSize: '10px' }}>
                Total: {formatCurrencyAmount(currencySymbol, wishlist.reduce((s, i) => s + Number(i.amount || 0), 0))}
              </span>
            )}
            <span className="notion-tag notion-tag-purple" style={{ fontSize: '10px' }}>
              {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-tertiary)' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              background: 'var(--bg-card-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              border: '1px solid var(--border-subtle)'
            }}>
              <Target size={18} color="var(--text-tertiary)" />
            </div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>
              No Pending Wishes
            </p>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Save items here and wait 48 hours before buying to avoid impulse spending.
            </p>
          </div>
        ) : (
          <div>
            {wishlist.map((item, idx) => {
              const remHours = getRemainingHours(item.createdAt, item.cooloffHours || 48);
              const isReady = remHours === 0;
              const isLast = idx === wishlist.length - 1;

              return (
                <div 
                  key={item.id}
                  onClick={() => {
                    setEditingWish(item);
                    setEditTitle(item.title);
                    setEditAmount(String(item.amount));
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '11px 14px',
                    borderBottom: isLast ? 'none' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    gap: '12px'
                  }}
                >
                  {/* Left Avatar */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'var(--bg-card-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                    border: '1px solid var(--border-subtle)'
                  }}>
                    {isReady ? '✅' : '⏳'}
                  </div>

                  {/* Middle Title & Status */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <p style={{ 
                        fontSize: '13px', 
                        fontWeight: 600, 
                        color: 'var(--text-primary)', 
                        margin: 0, 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        whiteSpace: 'nowrap' 
                      }}>
                        {item.title}
                      </p>
                    </div>

                    <div>
                      <span className={`notion-tag ${isReady ? 'notion-tag-green' : 'notion-tag-purple'}`} style={{ fontSize: '9px', padding: '1px 5px' }}>
                        {isReady ? 'Ready to buy' : `${remHours}h left`}
                      </span>
                    </div>
                  </div>

                  {/* Right Price & Clean Action Buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                    <span style={{ 
                      fontWeight: 700, 
                      fontSize: '14px', 
                      color: 'var(--text-primary)', 
                      marginRight: '2px',
                      letterSpacing: '-0.2px'
                    }}>
                      {formatCurrencyAmount(currencySymbol, item.amount)}
                    </span>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingWish(item);
                        setEditTitle(item.title);
                        setEditAmount(String(item.amount));
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ 
                        width: '26px', 
                        height: '26px', 
                        padding: 0, 
                        borderRadius: 'var(--radius-sm)',
                        background: 'transparent',
                        border: '1px solid transparent',
                        color: 'var(--text-tertiary)'
                      }}
                      title="Edit item"
                    >
                      <Edit3 size={13} />
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteWishItem(item.id);
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ 
                        width: '26px', 
                        height: '26px', 
                        padding: 0, 
                        borderRadius: 'var(--radius-sm)',
                        background: 'transparent',
                        border: '1px solid transparent',
                        color: 'var(--notion-red-text)'
                      }}
                      title="Remove item"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Wishlist Item Modal */}
      {editingWish && (
        <div className="modal-overlay" style={{ alignItems: 'flex-end', padding: 0 }} onClick={() => setEditingWish(null)}>
          <div 
            className="modal-content" 
            onClick={e => e.stopPropagation()}
            style={{ 
              maxWidth: '480px', 
              width: '100%', 
              borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0',
              padding: '20px 18px',
              animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '18px' }}>✏️</span>
                <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Edit Wishlist Item
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setEditingWish(null)} 
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

            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editTitle || !editAmount) return;
              if (onEditWishItem) {
                onEditWishItem({
                  ...editingWish,
                  title: editTitle.trim(),
                  amount: Number(editAmount)
                });
              }
              setEditingWish(null);
            }}>
              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label className="form-label">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swiggy Pizza / Headphones"
                  className="form-input"
                  style={{ fontSize: '13px' }}
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Estimated Price ({currencySymbol})</label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    position: 'absolute',
                    left: '12px',
                    fontSize: '18px',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    pointerEvents: 'none'
                  }}>
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="0"
                    className="form-input"
                    style={{
                      fontSize: '20px',
                      fontWeight: 700,
                      paddingLeft: '32px',
                      height: '46px',
                      color: 'var(--text-primary)'
                    }}
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
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
                  <CheckCircle2 size={16} /> Save Changes
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onDeleteWishItem) onDeleteWishItem(editingWish.id);
                      setEditingWish(null);
                    }}
                    className="btn btn-secondary"
                    style={{
                      padding: '9px',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'var(--notion-red-text)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingWish(null)}
                    className="btn btn-secondary"
                    style={{
                      padding: '9px',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
