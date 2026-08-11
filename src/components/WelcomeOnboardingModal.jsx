import React, { useState, useEffect } from 'react';
import { Wallet, Sparkles, ShieldCheck, Github, ChevronRight, ChevronLeft, CheckCircle2, ArrowRight } from 'lucide-react';

const ONBOARDING_KEY = 'pocket_budget_onboarded_v1';

export default function WelcomeOnboardingModal({ isOpen, onClose, onStartSetup }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      id: 'slide_welcome',
      icon: (
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'var(--ios-blue-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          border: '1px solid rgba(37, 99, 235, 0.2)'
        }}>
          <img src="./app-icon.png" alt="Pocket Budget" style={{ width: '42px', height: '42px', borderRadius: '10px' }} />
        </div>
      ),
      title: 'Welcome to Pocket Budget!',
      subtitle: 'Never run out of money before payday! 💸',
      highlights: [
        { icon: '⚡', title: 'Self-Healing Daily Budget', desc: 'Calculates exact safe spending allowance every single day.' },
        { icon: '⏱️', title: 'Live Payday Countdown', desc: 'Counts down days, hours & seconds to your next payday credit.' }
      ]
    },
    {
      id: 'slide_piggy',
      icon: (
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'var(--ios-orange-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          fontSize: '32px'
        }}>
          🐷
        </div>
      ),
      title: 'Lifetime Piggy Bank Vault',
      subtitle: 'Unused daily budget automatically accumulates! 🪙',
      highlights: [
        { icon: '🏦', title: 'Option 1 Lifetime Vault', desc: 'Saved money carries over indefinitely across month changes.' },
        { icon: '👛', title: 'Dual Spend Source', desc: 'Choose to log expenses from Main Allowance or Piggy Vault!' }
      ]
    },
    {
      id: 'slide_cloud',
      icon: (
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '20px',
          background: 'var(--ios-green-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          border: '1px solid rgba(16, 185, 129, 0.2)'
        }}>
          <ShieldCheck size={34} color="var(--ios-green)" />
        </div>
      ),
      title: '100% Private Cloud Database',
      subtitle: 'Zero 3rd-party servers. Your data, your GitHub! ☁️',
      highlights: [
        { icon: '🔒', title: 'Private GitHub Database', desc: 'Syncs automatically to your personal pocket-budget-db repository.' },
        { icon: '📲', title: 'Multi-Device Sync', desc: 'Real-time automatic sync across all your phones & laptops.' }
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
        padding: '16px'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '350px',
          padding: '24px 20px',
          textAlign: 'center',
          borderRadius: '28px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-medium)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.35)',
          animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Animated Slide Content */}
        <div key={slide.id} style={{ animation: 'fadeIn 0.2s ease-out' }}>
          {slide.icon}

          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', letterSpacing: '-0.4px' }}>
            {slide.title}
          </h3>

          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.4 }}>
            {slide.subtitle}
          </p>

          {/* Feature Highlight Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px', textAlign: 'left' }}>
            {slide.highlights.map((h, i) => (
              <div 
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '10px 12px',
                  background: 'var(--bg-card-subtle)',
                  borderRadius: '14px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <span style={{ fontSize: '18px', lineHeight: 1, flexShrink: 0 }}>{h.icon}</span>
                <div>
                  <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 2px' }}>
                    {h.title}
                  </h4>
                  <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.35, fontWeight: 500 }}>
                    {h.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Carousel Pagination Dots */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginBottom: '20px' }}>
          {slides.map((_, i) => (
            <div 
              key={i}
              onClick={() => setCurrentSlide(i)}
              style={{
                width: i === currentSlide ? '22px' : '7px',
                height: '7px',
                borderRadius: '4px',
                background: i === currentSlide ? 'var(--ios-blue)' : 'var(--border-medium)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {currentSlide > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '11px', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
            >
              <ChevronLeft size={16} /> Back
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="btn btn-primary"
            style={{
              flex: 2,
              padding: '11px',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)'
            }}
          >
            {currentSlide === slides.length - 1 ? (
              <>🚀 Set Allowance Now <ArrowRight size={16} /></>
            ) : (
              <>Next <ChevronRight size={16} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
