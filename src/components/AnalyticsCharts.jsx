import React from 'react';
import { PieChart, TrendingDown } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../utils/storage';

export default function AnalyticsCharts({ categories = DEFAULT_CATEGORIES, stats }) {
  const { categoryTotals, totalSpentThisMonth, baseDailyTarget, currentDayNumber, totalDaysInMonth, monthlyAllowance = 1500 } = stats;

  const maxCatValue = Math.max(1, ...Object.values(categoryTotals));
  const avgDailySpend = currentDayNumber > 0 ? Math.round(totalSpentThisMonth / currentDayNumber) : 0;
  const projectedMonthSpend = Math.round(avgDailySpend * totalDaysInMonth);

  return (
    <div className="ios-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieChart size={20} color="var(--ios-blue)" />
          Category Breakdown
        </span>
        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
          Total: ₹{totalSpentThisMonth}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
        {categories.map(cat => {
          const spent = categoryTotals[cat.id] || 0;
          const percentOfTotal = totalSpentThisMonth > 0 ? Math.round((spent / totalSpentThisMonth) * 100) : 0;
          const barWidth = Math.min(100, Math.round((spent / maxCatValue) * 100));

          return (
            <div key={cat.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{cat.icon}</span> {cat.name}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                  ₹{spent} ({percentOfTotal}%)
                </span>
              </div>
              <div className="progress-bar-bg" style={{ height: '8px' }}>
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${barWidth}%`, backgroundColor: cat.color || '#2563eb' }} 
                />
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ 
        background: 'var(--ios-blue-bg)', 
        padding: '16px', 
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start'
      }}>
        <TrendingDown size={22} color="var(--ios-blue)" style={{ marginTop: '2px', shrink: 0 }} />
        <div>
          <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ios-blue)', marginBottom: '2px' }}>
            Monthly Burn Pace
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '6px' }}>
            Current daily spend: <strong>₹{avgDailySpend}/day</strong> (Target: ₹{baseDailyTarget}/day)
          </p>
          <div style={{ 
            fontSize: '13px', 
            fontWeight: 800, 
            color: projectedMonthSpend > monthlyAllowance ? 'var(--ios-red)' : 'var(--ios-green)' 
          }}>
            {projectedMonthSpend > monthlyAllowance ? (
              `⚠️ Month forecast: ₹${projectedMonthSpend} (₹${projectedMonthSpend - monthlyAllowance} over budget!)`
            ) : (
              `✅ On Track! Projected month spend: ₹${projectedMonthSpend}. Save ₹${monthlyAllowance - projectedMonthSpend}!`
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
