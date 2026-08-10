import React from 'react';

export default function SplashScreen({ fadeOut }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'var(--bg-app)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
      opacity: fadeOut ? 0 : 1,
      transform: fadeOut ? 'scale(1.05)' : 'scale(1)',
      pointerEvents: fadeOut ? 'none' : 'auto'
    }}>
      {/* Centered Pulsing Logo */}
      <div style={{
        width: '90px',
        height: '90px',
        borderRadius: '24px',
        background: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 12px 35px rgba(37, 99, 235, 0.15)',
        marginBottom: '20px',
        animation: 'pulseLogo 1.5s ease-in-out infinite alternate'
      }}>
        <img 
          src="/app-icon.png" 
          alt="PocketBudget" 
          style={{ width: '64px', height: '64px', objectFit: 'contain' }} 
        />
      </div>

      <h1 style={{ 
        fontSize: '26px', 
        fontWeight: 800, 
        color: 'var(--text-primary)', 
        letterSpacing: '-0.8px',
        marginBottom: '6px',
        fontFamily: 'var(--font-sans)'
      }}>
        PocketBudget
      </h1>

      <p style={{ 
        fontSize: '13px', 
        fontWeight: 600, 
        color: 'var(--text-secondary)',
        letterSpacing: '0.4px'
      }}>
        ₹1500 Pocket Money Tracker
      </p>

      {/* CSS Keyframe Animations */}
      <style>{`
        @keyframes pulseLogo {
          0% { transform: scale(0.95); }
          100% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}
