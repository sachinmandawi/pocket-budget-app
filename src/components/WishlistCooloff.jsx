import React, { useState } from 'react';
import { Clock, Plus, Trash2, Target, CheckCircle2 } from 'lucide-react';

export default function WishlistCooloff({ wishlist, onAddWishItem, onDeleteWishItem, showAddForm, setShowAddForm }) {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Add Wish Form Overlay Card */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="ios-card" style={{ animation: 'fadeIn 0.15s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={18} color="var(--ios-purple)" />
              New Impulse Delay Item
            </span>
            <button 
              type="button"
              onClick={() => setShowAddForm(false)}
              className="btn btn-secondary btn-sm"
              style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%' }}
            >
              ✕
            </button>
          </div>

          <div className="form-group">
            <label className="form-label">Item / Wish Title</label>
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
              Start 48h Delay
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-secondary" style={{ padding: '12px', fontSize: '13px' }}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Main Wishlist Card */}
      <div className="ios-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--ios-purple)" />
            48h Impulse Delay Bucket
          </span>

          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--ios-purple)', background: 'var(--ios-purple-bg)', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>
            {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
          </span>
        </div>

        {wishlist.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-tertiary)' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '18px',
              background: 'var(--ios-purple-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px'
            }}>
              <Target size={24} color="var(--ios-purple)" />
            </div>
            <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
              No Pending Impulse Items
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Wait 48 hours before non-essential purchases to save money.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {wishlist.map(item => {
              const remHours = getRemainingHours(item.createdAt, item.cooloffHours || 48);
              const isReady = remHours === 0;

              return (
                <div 
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: 'var(--bg-card-subtle)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '12px',
                      background: isReady ? 'var(--ios-green-bg)' : 'var(--ios-purple-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {isReady ? <CheckCircle2 size={20} color="var(--ios-green)" /> : <Clock size={20} color="var(--ios-purple)" />}
                    </div>

                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
                        {item.title}
                      </p>
                      <span style={{ 
                        fontSize: '11px', 
                        color: isReady ? 'var(--ios-green)' : 'var(--ios-purple)', 
                        fontWeight: 800,
                        background: isReady ? 'var(--ios-green-bg)' : 'var(--ios-purple-bg)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)'
                      }}>
                        {isReady ? 'Ready to buy' : `⏳ ${remHours}h remaining`}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-primary)' }}>
                      {currencySymbol}{item.amount}
                    </span>
                    <button 
                      onClick={() => onDeleteWishItem(item.id)}
                      className="btn btn-secondary btn-sm"
                      style={{ width: '32px', height: '32px', padding: 0, borderRadius: '10px' }}
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
    </div>
  );
}
