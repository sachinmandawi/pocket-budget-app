import React, { useState } from 'react';
import WishlistCooloff from '../components/WishlistCooloff';
import { PlusCircle } from 'lucide-react';

export default function CooloffPage({ wishlist, onAddWishItem, onDeleteWishItem }) {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Sleek Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0 }}>
            Wishlist Cool-Off
          </h2>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn btn-primary"
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
          }}
        >
          <PlusCircle size={16} /> Add Wish
        </button>
      </div>

      <WishlistCooloff 
        wishlist={wishlist}
        onAddWishItem={onAddWishItem}
        onDeleteWishItem={onDeleteWishItem}
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
      />
    </div>
  );
}
