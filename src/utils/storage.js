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
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && Array.isArray(parsed.categories) && parsed.categories.length > 0) {
        if (parsed.monthlyAllowance === undefined) parsed.monthlyAllowance = 0;
        if (parsed.emergencyReserve === undefined) parsed.emergencyReserve = 0;
        if (!parsed.paydayAnchorDate) parsed.paydayAnchorDate = 1;
        if (!parsed.archivedCycles) parsed.archivedCycles = [];
        if (!parsed.transactions) parsed.transactions = [];
        if (!parsed.wishlist) parsed.wishlist = [];
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse saved data', e);
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
    archivedCycles: [],
    transactions: [],
    wishlist: []
  };
};

export const saveData = (data) => {
  if (data && typeof data === 'object') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const calculateBudgetStats = (rawInput) => {
  const data = (rawInput && typeof rawInput === 'object' && Array.isArray(rawInput.categories)) ? rawInput : getInitialData();
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

  const spentToday = currentCycleTx
    .filter(tx => tx.date === todayStr)
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const spentPastDays = currentCycleTx
    .filter(tx => tx.date < todayStr)
    .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  const totalSpentThisMonth = currentCycleTx.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
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
    currentCycleTx
  };
};
