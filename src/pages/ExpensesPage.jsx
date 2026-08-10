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
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            Expenses & History
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Track and filter all cycle transactions
          </p>
        </div>

        <button 
          onClick={onOpenQuickAdd} 
          className="btn btn-primary"
          style={{
            padding: '10px 18px',
            fontSize: '13px',
            borderRadius: 'var(--radius-full)',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)'
          }}
        >
          <PlusCircle size={16} /> Log Spend
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
