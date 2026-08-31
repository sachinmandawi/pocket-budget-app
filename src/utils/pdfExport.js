import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { formatDateReadable, formatLocalYMD } from './storage.js';

/**
 * Generate and download/share Bank-Style PDF Statement
 * @param {Object} options
 * @param {Array} options.transactions - Filtered transactions to export
 * @param {Object} options.stats - Budget stats
 * @param {Object} options.budgetData - Full budget data
 * @param {string} options.dateRangeLabel - Label for date range (e.g. "18 Aug 2026 – 17 Sep 2026")
 * @param {string} options.currencySymbol - Currency symbol (e.g. "₹")
 */
export async function exportTransactionsToPdf({
  transactions = [],
  stats = {},
  budgetData = {},
  dateRangeLabel = 'Statement Period',
  currencySymbol = '₹'
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Colors
  const primaryColor = [17, 24, 39]; // Slate 900
  const secondaryColor = [75, 85, 99]; // Slate 600
  const accentBlue = [37, 99, 235]; // Blue 600
  const accentGreen = [16, 185, 129]; // Emerald 500
  const accentRed = [239, 68, 68]; // Red 500
  const bgCard = [243, 244, 246]; // Gray 100

  // 1. Executive Header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('POCKET BUDGET', margin, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(209, 213, 219);
  doc.text('OFFICIAL TRANSACTION STATEMENT', margin, 18);

  const genDateStr = formatDateReadable(formatLocalYMD(new Date()));
  doc.setFontSize(8);
  doc.text(`Generated on: ${genDateStr}`, pageWidth - margin, 12, { align: 'right' });
  doc.text(`Period: ${dateRangeLabel}`, pageWidth - margin, 18, { align: 'right' });

  let currentY = 36;

  // 2. Summary KPI Metrics Grid (4 Clean Cards)
  const totalAllowance = Number(budgetData?.monthlyAllowance || 0) + Number(stats?.totalTopupsThisMonth || 0);
  const totalSpent = transactions
    .filter(t => t.type !== 'topup')
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const piggySaved = Number(stats?.currentCyclePiggySavings || 0);
  const balance = Math.max(0, Number(stats?.remainingTotalInHand || 0));

  const cardWidth = (pageWidth - (margin * 2) - (3 * 4)) / 4;
  const cardHeight = 16;

  const kpis = [
    { label: 'Total Income / Budget', value: `${currencySymbol}${totalAllowance.toLocaleString()}`, color: primaryColor },
    { label: 'Total Money Spent', value: `${currencySymbol}${totalSpent.toLocaleString()}`, color: accentRed },
    { label: 'Piggy Vault Savings', value: `+${currencySymbol}${piggySaved.toLocaleString()}`, color: accentGreen },
    { label: 'Net Balance', value: `${currencySymbol}${balance.toLocaleString()}`, color: accentBlue }
  ];

  kpis.forEach((kpi, idx) => {
    const cardX = margin + idx * (cardWidth + 4);
    doc.setFillColor(...bgCard);
    doc.roundedRect(cardX, currentY, cardWidth, cardHeight, 2, 2, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...secondaryColor);
    doc.text(kpi.label, cardX + 3, currentY + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...kpi.color);
    doc.text(kpi.value, cardX + 3, currentY + 12);
  });

  currentY += cardHeight + 8;

  // 3. Category Breakdown Bar / Summary (If expenses exist)
  const categoryTotals = {};
  transactions.filter(t => t.type !== 'topup').forEach(t => {
    const cat = t.category || 'other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount || 0);
  });

  const categories = budgetData.categories || [];
  const sortedCategories = Object.entries(categoryTotals)
    .map(([catId, amt]) => {
      const found = categories.find(c => c.id === catId);
      return {
        name: found?.name || (catId.charAt(0).toUpperCase() + catId.slice(1)),
        amount: amt,
        percent: totalSpent > 0 ? Math.round((amt / totalSpent) * 100) : 0
      };
    })
    .sort((a, b) => b.amount - a.amount);

  if (sortedCategories.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(...primaryColor);
    doc.text('Expense Breakdown by Category', margin, currentY);
    currentY += 4;

    const topCats = sortedCategories.slice(0, 5);
    const catSummaryText = topCats.map(c => `${c.name}: ${currencySymbol}${c.amount.toLocaleString()} (${c.percent}%)`).join('   •   ');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...secondaryColor);
    doc.text(catSummaryText, margin, currentY);
    currentY += 8;
  }

  // 4. Itemized Transaction Statement Table
  const tableRows = transactions.map(tx => {
    const isTopup = tx.type === 'topup';
    const isPiggy = tx.spendSource === 'piggy_bank';
    const foundCat = (budgetData.categories || []).find(c => c.id === tx.category);
    const categoryName = isTopup ? 'Top-up / Income' : foundCat?.name || (tx.category ? tx.category.charAt(0).toUpperCase() + tx.category.slice(1) : 'Other');
    
    const sourceLabel = isTopup 
      ? 'Top-up (+)' 
      : isPiggy 
        ? 'Piggy Bank' 
        : 'Pocket Money';

    const formattedAmount = isTopup 
      ? `+${currencySymbol}${Number(tx.amount || 0).toLocaleString()}`
      : `-${currencySymbol}${Number(tx.amount || 0).toLocaleString()}`;

    return [
      formatDateReadable(tx.date || tx.createdAt),
      tx.time || '-',
      categoryName,
      tx.note || '-',
      sourceLabel,
      formattedAmount
    ];
  });

  autoTable(doc, {
    startY: currentY,
    head: [['Date', 'Time', 'Category', 'Note / Description', 'Source', 'Amount']],
    body: tableRows.length > 0 ? tableRows : [['-', '-', 'No transactions in selected period', '-', '-', '-']],
    theme: 'striped',
    margin: { left: margin, right: margin, bottom: 18 },
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: [31, 41, 55],
      lineColor: [229, 231, 235],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left'
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    columnStyles: {
      0: { cellWidth: 26 },
      1: { cellWidth: 16 },
      2: { cellWidth: 30, fontStyle: 'bold' },
      3: { cellWidth: 'auto' },
      4: { cellWidth: 28 },
      5: { cellWidth: 24, halign: 'right', fontStyle: 'bold' }
    },
    didDrawPage: (data) => {
      // Clean Footer on every page
      const pageHeight = doc.internal.pageSize.getHeight();
      const pageWidth = doc.internal.pageSize.getWidth();
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(156, 163, 175);
      doc.text(
        'Generated by Pocket Budget App  •  Personal Financial Statement  •  Strictly Confidential',
        margin,
        pageHeight - 8
      );
      doc.text(`Page ${data.pageNumber}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
    }
  });

  const fileName = `PocketBudget_Statement_${formatLocalYMD(new Date())}.pdf`;

  // 5. Native Android Share vs Web Download Delivery
  if (Capacitor.isNativePlatform()) {
    try {
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: pdfBase64,
        directory: Directory.Cache
      });

      await Share.share({
        title: 'Pocket Budget Statement',
        text: `Transaction Statement (${dateRangeLabel})`,
        url: savedFile.uri,
        dialogTitle: 'Share or Save PDF Statement'
      });
      return { success: true, method: 'share' };
    } catch (err) {
      console.warn('Native share failed, falling back to download:', err);
      doc.save(fileName);
      return { success: true, method: 'download' };
    }
  } else {
    doc.save(fileName);
    return { success: true, method: 'download' };
  }
}
