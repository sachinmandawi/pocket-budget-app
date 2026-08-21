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
      {/* Centered Pulsing Light Card Logo */}
      <img 
        src="/app-icon.png" 
        alt="Pocket Budget" 
        style={{ 
          width: '84px', 
          height: '84px', 
          borderRadius: '22px', 
          objectFit: 'contain',
          marginBottom: '20px',
          animation: 'pulseLogo 1.5s ease-in-out infinite alternate'
        }} 
      />

      <h1 style={{ 
        fontSize: '26px', 
        fontWeight: 800, 
        color: 'var(--text-primary)', 
        letterSpacing: '-0.8px',
        marginBottom: '6px',
        fontFamily: 'var(--font-sans)'
      }}>
        Pocket Budget
      </h1>

      <p style={{ 
        fontSize: '13px', 
        fontWeight: 600, 
        color: 'var(--text-secondary)',
        letterSpacing: '0.4px'
      }}>
        Smart Daily Expense Tracker
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
