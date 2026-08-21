import React from 'react';
import { PieChart, TrendingDown } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../utils/storage';
import { formatCurrencyAmount } from '../utils/currencies';

export default function AnalyticsCharts({ categories = DEFAULT_CATEGORIES, stats }) {
  const { categoryTotals, totalSpentThisMonth, baseDailyTarget, currentDayNumber, totalDaysInMonth, monthlyAllowance = 1500 } = stats;
  const currencySymbol = stats?.currencySymbol || '₹';

  const maxCatValue = Math.max(1, ...Object.values(categoryTotals));
  const avgDailySpend = currentDayNumber > 0 ? Math.round(totalSpentThisMonth / currentDayNumber) : 0;
  const projectedMonthSpend = Math.round(avgDailySpend * totalDaysInMonth);

  return (
    <div className="notion-card" style={{ marginBottom: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PieChart size={15} color="var(--text-primary)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Category Breakdown
          </span>
        </div>
        <span className="notion-tag notion-tag-gray">
          Total: {formatCurrencyAmount(currencySymbol, totalSpentThisMonth)}
        </span>
      </div>

      {/* Category Progress Bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
        {categories.map(cat => {
          const spent = categoryTotals[cat.id] || 0;
          const percentOfTotal = totalSpentThisMonth > 0 ? Math.round((spent / totalSpentThisMonth) * 100) : 0;
          const barWidth = Math.min(100, Math.round((spent / maxCatValue) * 100));

          return (
            <div key={cat.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px' }}>{cat.icon}</span> {cat.name}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatCurrencyAmount(currencySymbol, spent)} <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 500 }}>({percentOfTotal}%)</span>
                </span>
              </div>
              <div className="progress-bar-bg" style={{ height: '5px', borderRadius: '3px' }}>
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${barWidth}%`, backgroundColor: cat.color || 'var(--text-primary)', borderRadius: '3px' }} 
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
        borderRadius: 'var(--radius-sm)',
        padding: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingDown size={14} color="var(--text-primary)" />
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Monthly Forecast
            </span>
          </div>
          <span className={`notion-tag ${projectedMonthSpend > monthlyAllowance ? 'notion-tag-red' : 'notion-tag-green'}`}>
            {projectedMonthSpend > monthlyAllowance ? 'Over Budget' : 'On Track'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div style={{ 
            background: 'var(--bg-card)', 
            padding: '10px 12px', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '82px'
          }}>
            <div>
              <span style={{ 
                fontSize: '10px', 
                color: 'var(--text-tertiary)', 
                display: 'block', 
                fontWeight: 600, 
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Daily Average
              </span>
              <span style={{ 
                fontSize: '16px', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                display: 'block',
                marginTop: '4px',
                lineHeight: 1.1
              }}>
                {formatCurrencyAmount(currencySymbol, avgDailySpend)}/day
              </span>
            </div>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block', marginTop: '6px', whiteSpace: 'nowrap' }}>
              Daily Target: {formatCurrencyAmount(currencySymbol, baseDailyTarget)}/day
            </span>
          </div>

          <div style={{ 
            background: 'var(--bg-card)', 
            padding: '10px 12px', 
            borderRadius: 'var(--radius-sm)', 
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '82px'
          }}>
            <div>
              <span style={{ 
                fontSize: '10px', 
                color: 'var(--text-tertiary)', 
                display: 'block', 
                fontWeight: 600, 
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                Monthly Estimate
              </span>
              <span style={{ 
                fontSize: '16px', 
                fontWeight: 700, 
                color: 'var(--text-primary)',
                display: 'block',
                marginTop: '4px',
                lineHeight: 1.1
              }}>
                {formatCurrencyAmount(currencySymbol, projectedMonthSpend)}
              </span>
            </div>
            <span style={{ 
              fontSize: '10px', 
              color: projectedMonthSpend > monthlyAllowance ? 'var(--notion-red-text)' : 'var(--notion-green-text)', 
              display: 'block', 
              fontWeight: 600, 
              marginTop: '6px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {projectedMonthSpend > monthlyAllowance ? `+${formatCurrencyAmount(currencySymbol, projectedMonthSpend - monthlyAllowance)} Overspend` : `${formatCurrencyAmount(currencySymbol, monthlyAllowance - projectedMonthSpend)} Savings`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
