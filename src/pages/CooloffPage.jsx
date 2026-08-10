import React from 'react';
import WishlistCooloff from '../components/WishlistCooloff';

export default function CooloffPage({ wishlist, onAddWishItem, onDeleteWishItem }) {
  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Wishlist Cool-Off
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          48-hour delay bucket to stop impulse purchases
        </p>
      </div>

      <WishlistCooloff 
        wishlist={wishlist}
        onAddWishItem={onAddWishItem}
        onDeleteWishItem={onDeleteWishItem}
      />
    </div>
  );
}
