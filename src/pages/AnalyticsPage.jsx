import React from 'react';
import SurvivalHealthBar from '../components/SurvivalHealthBar';
import EmergencyReserve from '../components/EmergencyReserve';
import AnalyticsCharts from '../components/AnalyticsCharts';

export default function AnalyticsPage({ stats, categories, reserveAmount, isEmergencyUnlocked, onToggleEmergencyLock }) {
  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
          Budget Analytics
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          Survival HP, Emergency Fund & Spend Projections
        </p>
      </div>

      {/* Survival HP Bar & Badges */}
      <SurvivalHealthBar stats={stats} />

      {/* Emergency Fund Lock */}
      <EmergencyReserve 
        reserveAmount={reserveAmount}
        isUnlocked={isEmergencyUnlocked}
        currentDay={stats.currentDayNumber}
        onToggleUnlock={onToggleEmergencyLock}
      />

      {/* Category Breakdown & Burn Pace Forecast */}
      <AnalyticsCharts 
        categories={categories}
        stats={stats} 
      />
    </div>
  );
}
