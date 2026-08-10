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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
            Expenses & History
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Filter by current cycle or past month archives
          </p>
        </div>

        <button onClick={onOpenQuickAdd} className="btn btn-primary btn-sm">
          <PlusCircle size={15} /> Log Spend
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
