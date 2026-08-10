import React, { useState } from 'react';
import { Clock, Plus, Trash2 } from 'lucide-react';

export default function WishlistCooloff({ wishlist, onAddWishItem, onDeleteWishItem }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title || !amount) return;

    onAddWishItem({
      id: 'wish-' + Date.now(),
      title,
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
    <div className="ios-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={20} color="var(--ios-purple)" />
          48h Impulse Buy Delay
        </span>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-secondary btn-sm"
        >
          <Plus size={14} /> Add Wish
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} style={{ 
          background: 'var(--bg-card-subtle)', 
          padding: '14px', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '14px' 
        }}>
          <div className="form-group">
            <label className="form-label">Item / Wish Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Swiggy pizza"
              className="form-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Price (₹)</label>
            <input
              type="number"
              required
              placeholder="250"
              className="form-input"
              value={amount}
              onChange={e => setAmount(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
              Start 48h Timer
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary btn-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '18px 0', color: 'var(--text-tertiary)', fontSize: '13px' }}>
          No pending impulse items 🎯
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {wishlist.map(item => {
            const remHours = getRemainingHours(item.createdAt, item.cooloffHours || 48);
            const isReady = remHours === 0;

            return (
              <div 
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  background: 'var(--bg-card-subtle)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {item.title}
                  </p>
                  <span style={{ 
                    fontSize: '12px', 
                    color: isReady ? 'var(--ios-green)' : 'var(--ios-purple)', 
                    fontWeight: 700 
                  }}>
                    {isReady ? '✅ Cool-off complete' : `⏳ ${remHours}h remaining`}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>
                    ₹{item.amount}
                  </span>
                  <button 
                    onClick={() => onDeleteWishItem(item.id)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '32px', height: '32px', padding: 0 }}
                    title="Remove item"
                  >
                    <Trash2 size={14} color="var(--ios-red)" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
