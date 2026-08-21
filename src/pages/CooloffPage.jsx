import React, { useState } from 'react';
import WishlistCooloff from '../components/WishlistCooloff';
import { PlusCircle } from 'lucide-react';

export default function CooloffPage({ wishlist, onAddWishItem, onDeleteWishItem, onEditWishItem, currencySymbol = '₹' }) {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🛍️</span>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            Shopping Wishlist
          </h2>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn btn-primary btn-sm"
          style={{
            padding: '5px 10px',
            fontSize: '12px'
          }}
        >
          <PlusCircle size={13} /> Add Wish
        </button>
      </div>

      <WishlistCooloff 
        wishlist={wishlist}
        onAddWishItem={onAddWishItem}
        onDeleteWishItem={onDeleteWishItem}
        onEditWishItem={onEditWishItem}
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}
