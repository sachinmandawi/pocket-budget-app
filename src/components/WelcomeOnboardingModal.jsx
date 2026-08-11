import React, { useState } from 'react';
import { ShieldCheck, ChevronRight, ChevronLeft, ArrowRight, X } from 'lucide-react';

const ONBOARDING_KEY = 'pocket_budget_onboarded_v1';

export default function WelcomeOnboardingModal({ isOpen, onClose, onStartSetup }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      id: 'slide_welcome',
      icon: (
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          background: 'var(--ios-blue-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px',
          border: '1px solid rgba(37, 99, 235, 0.2)'
        }}>
          <img src="./app-icon.png" alt="Pocket Budget" style={{ width: '30px', height: '30px', borderRadius: '7px' }} />
        </div>
      ),
      title: 'Welcome to Pocket Budget!',
      subtitle: 'Never run out of money before payday! 💸',
      highlights: [
        { icon: '⚡', title: 'Self-Healing Budget', desc: 'Calculates safe daily limit' },
        { icon: '⏱️', title: 'Payday Countdown', desc: 'Live ticking clock to payday' }
      ]
    },
    {
      id: 'slide_piggy',
      icon: (
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          background: 'var(--ios-orange-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          fontSize: '24px'
        }}>
          🐷
        </div>
      ),
      title: 'Lifetime Piggy Savings',
      subtitle: 'Unused daily budget accumulates! 🪙',
      highlights: [
        { icon: '🏦', title: 'Lifetime Savings', desc: 'Saved money carries over month to month' },
        { icon: '👛', title: 'Dual Spend Source', desc: 'Spend from Main Budget or Piggy Vault' }
      ]
    },
    {
      id: 'slide_cloud',
      icon: (
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          background: 'var(--ios-green-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <ShieldCheck size={26} color="var(--ios-green)" />
        </div>
      ),
      title: 'Private GitHub Sync',
      subtitle: 'Zero 3rd-party servers. Your data, your GitHub! ☁️',
      highlights: [
        { icon: '🔒', title: 'Private Database', desc: 'Syncs to your personal GitHub repo' },
        { icon: '📲', title: 'Multi-Device Sync', desc: 'Real-time sync across all devices' }
      ]
    }
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = () => {
    try {
      localStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (e) {}
    onClose();
    if (onStartSetup) {
      onStartSetup();
    }
  };

  const slide = slides[currentSlide];

  return (
    <div 
      className="modal-overlay" 
      style={{ 
        animation: 'fadeIn 0.2s ease-out', 
        zIndex: 99999, 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '12px'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '310px',
          padding: '18px 16px',
          textAlign: 'center',
          borderRadius: '24px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
          animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative'
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleComplete}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'var(--bg-card-subtle)',
            border: 'none',
            borderRadius: '50%',
            width: '26px',
            height: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-tertiary)'
          }}
        >
          <X size={14} />
        </button>

        {/* Animated Slide Content */}
        <div key={slide.id} style={{ animation: 'fadeIn 0.15s ease-out' }}>
          {slide.icon}

          <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px', letterSpacing: '-0.3px' }}>
            {slide.title}
          </h3>

          <p style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.3 }}>
            {slide.subtitle}
          </p>

          {/* Compact Feature Highlight Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px', textAlign: 'left' }}>
            {slide.highlights.map((h, i) => (
              <div 
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  background: 'var(--bg-card-subtle)',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span style={{ fontSize: '15px', lineHeight: 1, flexShrink: 0 }}>{h.icon}</span>
                <div>
                  <h4 style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
                    {h.title}
                  </h4>
                  <p style={{ fontSize: '10px', color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.2, fontWeight: 500 }}>
                    {h.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px', marginBottom: '14px' }}>
          {slides.map((_, i) => (
            <div 
              key={i}
              onClick={() => setCurrentSlide(i)}
              style={{
                width: i === currentSlide ? '18px' : '6px',
                height: '6px',
                borderRadius: '3px',
                background: i === currentSlide ? 'var(--ios-blue)' : 'var(--border-medium)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          ))}
        </div>

        {/* Compact Action Controls */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {currentSlide > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '9px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}
            >
              <ChevronLeft size={14} /> Back
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="btn btn-primary"
            style={{
              flex: 2,
              padding: '9px',
              fontSize: '12px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 3px 10px rgba(37, 99, 235, 0.3)'
            }}
          >
            {currentSlide === slides.length - 1 ? (
              <>🚀 Set Pocket Money <ArrowRight size={14} /></>
            ) : (
              <>Next <ChevronRight size={14} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
