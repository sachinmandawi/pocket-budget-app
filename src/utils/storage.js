import { DEFAULT_CURRENCY } from './currencies.js';

const STORAGE_KEY = 'pocket_budget_data_v1';

export const DEFAULT_CATEGORIES = [
  { id: 'chai_snacks', name: 'Chai & Snacks', icon: '☕', color: '#ff9500' },
  { id: 'canteen_food', name: 'Canteen & Food', icon: '🍲', color: '#ff3b30' },
  { id: 'travel', name: 'Bus / Auto Travel', icon: '🚌', color: '#007aff' },
  { id: 'recharge', name: 'Mobile Recharge', icon: '📱', color: '#af52de' },
  { id: 'stationery', name: 'Printouts & Books', icon: '📚', color: '#34c759' },
  { id: 'other', name: 'Other Expenses', icon: '🏷️', color: '#8e8e93' }
];

export const PRESET_SPENDS = [
  { label: 'Chai', amount: 10, category: 'chai_snacks', icon: '☕' },
  { label: 'Samosa / Snack', amount: 15, category: 'chai_snacks', icon: '🥟' },
  { label: 'Auto / E-Rickshaw', amount: 20, category: 'travel', icon: '🛺' },
  { label: 'Bus Ticket', amount: 25, category: 'travel', icon: '🚌' },
  { label: 'Canteen Meal', amount: 35, category: 'canteen_food', icon: '🍛' },
  { label: 'Printout / xerox', amount: 10, category: 'stationery', icon: '📄' },
  { label: 'Cold Drink / Juice', amount: 20, category: 'chai_snacks', icon: '🥤' },
  { label: 'Recharge 1-Month', amount: 199, category: 'recharge', icon: '📱' }
];

export const formatDateReadable = (dateStr) => {
  if (!dateStr) return '';
  const parts = String(dateStr).split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if (monthIdx >= 0 && monthIdx < 12) {
      return `${day} ${monthNames[monthIdx]} ${year}`;
    }
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    const day = d.getDate();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  }
  return dateStr;
};

export const getBillingCycleRange = (paydayDay = 1, referenceDate = new Date()) => {
  const ref = new Date(referenceDate);
  const year = ref.getFullYear();
  const month = ref.getMonth();
  const day = ref.getDate();

  let cycleStartDate, cycleEndDate;

  if (day >= paydayDay) {
    cycleStartDate = new Date(year, month, paydayDay);
    cycleEndDate = new Date(year, month + 1, paydayDay - 1);
  } else {
    cycleStartDate = new Date(year, month - 1, paydayDay);
    cycleEndDate = new Date(year, month, paydayDay - 1);
  }

  cycleEndDate.setHours(23, 59, 59, 999);
  return { cycleStartDate, cycleEndDate };
};

export const getInitialData = () => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          if (parsed.categories && Array.isArray(parsed.categories)) {
            parsed.categories = parsed.categories.filter(c => c && c.name && !c.name.toLowerCase().includes('cigarette') && !c.id.toLowerCase().includes('cigarette'));
          }
          if (parsed.monthlyAllowance === undefined) parsed.monthlyAllowance = 0;
          if (parsed.emergencyReserve === undefined) parsed.emergencyReserve = 0;
          if (!parsed.paydayAnchorDate) parsed.paydayAnchorDate = 1;
          if (!parsed.archivedCycles) parsed.archivedCycles = [];
          if (!parsed.transactions) parsed.transactions = [];
          if (!parsed.wishlist) parsed.wishlist = [];
          if (!parsed.customCurrencies) parsed.customCurrencies = [];
          if (!parsed.currency) parsed.currency = DEFAULT_CURRENCY;
          return parsed;
        }
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
  }

  // All values start at 0 by default
  return {
    monthlyAllowance: 0,
    paydayAnchorDate: 1,
    emergencyReserve: 0,
    isEmergencyUnlocked: false,
    fixedDeductions: [],
    categories: DEFAULT_CATEGORIES,
    currency: DEFAULT_CURRENCY,
    customCurrencies: [],
    archivedCycles: [],
    transactions: [],
    wishlist: []
  };
};

export const saveData = (data) => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    if (data && typeof data === 'object') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  }
};

export const calculateBudgetStats = (rawInput) => {
  const data = (rawInput && typeof rawInput === 'object') ? rawInput : getInitialData();
  const now = new Date();
  const todayStr = now.toISOString().substring(0, 10);
  const paydayDay = Number(data.paydayAnchorDate || 1);

  const { cycleStartDate, cycleEndDate } = getBillingCycleRange(paydayDay, now);
  const cycleStartStr = cycleStartDate.toISOString().substring(0, 10);
  const cycleEndStr = cycleEndDate.toISOString().substring(0, 10);

  const diffTime = Math.abs(cycleEndDate - cycleStartDate);
  const totalDaysInCycle = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const daysPassed = Math.floor((now - cycleStartDate) / (1000 * 60 * 60 * 24)) + 1;
  const currentDayNumber = Math.min(totalDaysInCycle, Math.max(1, daysPassed));
  const daysRemaining = Math.max(1, totalDaysInCycle - currentDayNumber + 1);

  const totalFixedDeductions = (data.fixedDeductions || []).reduce((acc, curr) => acc + Number(curr.amount || 0), 0);
  const effectiveReserve = data.isEmergencyUnlocked ? 0 : Number(data.emergencyReserve || 0);

  const totalUsablePool = Math.max(0, Number(data.monthlyAllowance || 0) - totalFixedDeductions - effectiveReserve);
  const baseDailyTarget = Math.round((totalUsablePool / totalDaysInCycle) * 10) / 10;

  const currentCycleTx = (data.transactions || []).filter(tx => {
    return tx && tx.date && tx.date >= cycleStartStr && tx.date <= cycleEndStr;
  });

  const allowanceTx = currentCycleTx.filter(tx => tx.spendSource !== 'piggy_bank');

  const spentToday = allowanceTx
    .filter(tx => tx.date === todayStr)
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const spentPastDays = allowanceTx
    .filter(tx => tx.date < todayStr)
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const totalSpentThisMonth = allowanceTx.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
  const remainingTotalInHand = Number(data.monthlyAllowance || 0) - totalFixedDeductions - totalSpentThisMonth - effectiveReserve;

  const remainingUsablePool = Math.max(0, totalUsablePool - spentPastDays);
  const todaysAllowedTotal = daysRemaining > 0 ? Math.round((remainingUsablePool / daysRemaining) * 10) / 10 : 0;
  const todaysSafeRemaining = Math.round((todaysAllowedTotal - spentToday) * 10) / 10;

  const percentMonthPassed = (currentDayNumber / totalDaysInCycle) * 100;
  const percentMoneySpent = totalUsablePool > 0 ? (totalSpentThisMonth / totalUsablePool) * 100 : 0;
  const isFastBurn = (currentDayNumber <= 10 && percentMoneySpent > 40) || (percentMoneySpent > percentMonthPassed + 15);

  const expectedSpentByNow = (currentDayNumber / totalDaysInCycle) * totalUsablePool;
  let healthScore = 100;
  if (totalUsablePool > 0) {
    if (totalSpentThisMonth > expectedSpentByNow) {
      const excess = totalSpentThisMonth - expectedSpentByNow;
      healthScore = Math.max(10, Math.round(100 - (excess / totalUsablePool) * 150));
    } else {
      const saved = expectedSpentByNow - totalSpentThisMonth;
      healthScore = Math.min(100, Math.round(100 + (saved / totalUsablePool) * 50));
    }
  }

  const categoryTotals = {};
  const activeCategories = data.categories || DEFAULT_CATEGORIES;
  activeCategories.forEach(cat => { if (cat && cat.id) categoryTotals[cat.id] = 0; });
  currentCycleTx.forEach(tx => {
    const cat = tx.category || 'other';
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(tx.amount || 0);
  });

  const cyclePeriodLabel = `${formatDateReadable(cycleStartStr)} – ${formatDateReadable(cycleEndStr)}`;

  return {
    monthlyAllowance: Number(data.monthlyAllowance || 0),
    totalDaysInMonth: totalDaysInCycle,
    currentDayNumber,
    daysRemaining,
    baseDailyTarget,
    todaysAllowedTotal,
    spentToday,
    todaysSafeRemaining,
    spentPastDays,
    totalSpentThisMonth,
    remainingTotalInHand,
    totalFixedDeductions,
    effectiveReserve,
    isFastBurn,
    healthScore,
    categoryTotals,
    cyclePeriodLabel,
    cycleStartStr,
    cycleEndStr,
    currentCycleTx,
    currency: data.currency || DEFAULT_CURRENCY,
    currencySymbol: (data.currency && data.currency.symbol) ? data.currency.symbol : '₹',
    paydayAnchorDate: paydayDay
  };
};

// 🐷 Feature: Piggy Bank Vault & Daily Savings History (Option 1: Lifetime Vault - Never Resets)
export const calculatePiggyBankSavings = (data) => {
  if (!data) return { totalSaved: 0, accumulatedSaved: 0, totalPiggySpent: 0, history: [] };
  
  const stats = calculateBudgetStats(data);
  if (!stats || !stats.baseDailyTarget || stats.baseDailyTarget <= 0 || stats.monthlyAllowance <= 0) {
    return { totalSaved: 0, accumulatedSaved: 0, totalPiggySpent: 0, history: [] };
  }

  const todayStr = new Date().toISOString().substring(0, 10);
  const baseDailyTarget = stats.baseDailyTarget;

  const transactions = data.transactions || [];
  const datesMap = new Map();
  let totalPiggySpent = 0;

  // Track all transactions across ALL time (Lifetime)
  transactions.forEach(tx => {
    if (tx && tx.date) {
      if (tx.spendSource === 'piggy_bank') {
        totalPiggySpent += Number(tx.amount || 0);
      } else if (tx.date < todayStr) {
        const current = datesMap.get(tx.date) || 0;
        datesMap.set(tx.date, current + Number(tx.amount || 0));
      }
    }
  });

  const history = [];
  let accumulatedSaved = 0;

  const allDates = Array.from(datesMap.keys()).sort();
  const startDateStr = allDates.length > 0 ? allDates[0] : stats.cycleStartStr;
  
  const startDate = new Date(startDateStr);
  const todayDate = new Date(todayStr);

  const formatLocalYMD = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  for (let d = new Date(startDate); d < todayDate; d.setDate(d.getDate() + 1)) {
    const dStr = formatLocalYMD(d);
    const spentOnDay = datesMap.get(dStr) || 0;
    const savedAmount = Math.max(0, baseDailyTarget - spentOnDay);

    if (savedAmount > 0) {
      accumulatedSaved += savedAmount;
      history.push({
        type: 'deposit',
        date: dStr,
        spent: spentOnDay,
        limit: baseDailyTarget,
        savedAmount: Math.round(savedAmount),
        isZeroSpend: spentOnDay === 0
      });
    }
  }

  // Include direct Piggy Bank spend transactions in history
  transactions.forEach(tx => {
    if (tx && tx.spendSource === 'piggy_bank') {
      history.push({
        type: 'withdrawal',
        date: tx.date,
        spent: Number(tx.amount || 0),
        note: tx.note || 'Vault Expense',
        savedAmount: -Number(tx.amount || 0)
      });
    }
  });

  history.sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalSaved = Math.max(0, Math.round(accumulatedSaved - totalPiggySpent));

  return {
    totalSaved,
    accumulatedSaved: Math.round(accumulatedSaved),
    totalPiggySpent: Math.round(totalPiggySpent),
    history
  };
};
