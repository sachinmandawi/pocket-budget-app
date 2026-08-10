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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PieChart size={18} color="var(--ios-blue)" />
          Category Breakdown
        </span>
        <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--ios-blue)', background: 'var(--ios-blue-bg)', padding: '3px 10px', borderRadius: 'var(--radius-full)' }}>
          Total: ₹{totalSpentThisMonth}
        </span>
      </div>

      {/* Category Progress Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
        {categories.map(cat => {
          const spent = categoryTotals[cat.id] || 0;
          const percentOfTotal = totalSpentThisMonth > 0 ? Math.round((spent / totalSpentThisMonth) * 100) : 0;
          const barWidth = Math.min(100, Math.round((spent / maxCatValue) * 100));

          return (
            <div key={cat.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '16px' }}>{cat.icon}</span> {cat.name}
                </span>
                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>
                  ₹{spent} <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 600 }}>({percentOfTotal}%)</span>
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

      {/* Monthly Burn Pace Grid */}
      <div style={{
        background: 'var(--bg-card-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingDown size={16} color="var(--ios-blue)" /> Pace Forecast
          </span>
          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            color: projectedMonthSpend > monthlyAllowance ? 'var(--ios-red)' : 'var(--ios-green)',
            background: projectedMonthSpend > monthlyAllowance ? 'var(--ios-red-bg)' : 'var(--ios-green-bg)',
            padding: '3px 10px',
            borderRadius: 'var(--radius-full)'
          }}>
            {projectedMonthSpend > monthlyAllowance ? 'Over Pace' : 'On Track'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', fontWeight: 600 }}>Daily Pace</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{avgDailySpend}/day</span>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '2px' }}>Target: ₹{baseDailyTarget}/day</span>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '10px 12px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'block', fontWeight: 600 }}>Est. Month</span>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>₹{projectedMonthSpend}</span>
            <span style={{ fontSize: '11px', color: projectedMonthSpend > monthlyAllowance ? 'var(--ios-red)' : 'var(--ios-green)', display: 'block', fontWeight: 700, marginTop: '2px' }}>
              {projectedMonthSpend > monthlyAllowance ? `+₹${projectedMonthSpend - monthlyAllowance} Over` : `₹${monthlyAllowance - projectedMonthSpend} Save`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
