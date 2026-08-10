import React from 'react';
import TransactionsList from '../components/TransactionsList';
import { PlusCircle } from 'lucide-react';

export default function ExpensesPage({ 
  categories, 
  transactions, 
  onDeleteTransaction, 
  onOpenQuickAdd, 
  archivedCycles = [],
  cyclePeriodLabel = 'Current Cycle'
}) {
  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Sleek Top Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', margin: 0, lineHeight: 1.2 }}>
            Expenses & History
          </h2>
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
            Track and filter all cycle transactions
          </p>
        </div>

        <button 
          onClick={onOpenQuickAdd} 
          className="btn btn-primary btn-sm"
          style={{
            padding: '6px 13px',
            fontSize: '12px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
          }}
        >
          <PlusCircle size={14} /> Log Spend
        </button>
      </div>

      <TransactionsList 
        categories={categories}
        transactions={transactions}
        onDeleteTransaction={onDeleteTransaction}
        archivedCycles={archivedCycles}
        cyclePeriodLabel={cyclePeriodLabel}
      />
    </div>
  );
}
