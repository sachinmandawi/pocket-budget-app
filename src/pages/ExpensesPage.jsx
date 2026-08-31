import React from 'react';
import TransactionsList from '../components/TransactionsList';
import { PlusCircle } from 'lucide-react';

export default function ExpensesPage({ 
  categories, 
  transactions, 
  onDeleteTransaction, 
  onEditTransaction,
  onOpenQuickAdd, 
  onOpenExportPdf,
  archivedCycles = [],
  cyclePeriodLabel = 'Current Cycle',
  currencySymbol = '₹'
}) {
  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>📋</span>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Expenses & History
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '1px 0 0' }}>
              Track and filter all cycle transactions
            </p>
          </div>
        </div>

        <button 
          onClick={onOpenQuickAdd} 
          className="btn btn-primary btn-sm"
          style={{
            padding: '5px 10px',
            fontSize: '12px'
          }}
        >
          <PlusCircle size={13} /> Log Spend
        </button>
      </div>

      <TransactionsList 
        categories={categories}
        transactions={transactions}
        onDeleteTransaction={onDeleteTransaction}
        onEditTransaction={onEditTransaction}
        onOpenExportPdf={onOpenExportPdf}
        archivedCycles={archivedCycles}
        cyclePeriodLabel={cyclePeriodLabel}
        currencySymbol={currencySymbol}
      />
    </div>
  );
}
