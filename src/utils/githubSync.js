// GitHub Auto Sync Utility for Private DB Repository

const CONFIG_KEY = 'pocket_budget_github_config';

export const getGitHubConfig = () => {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed) return parsed;
    }
  } catch (e) {}

  return {
    token: '',
    owner: '',
    repo: '',
    filename: 'pocket_budget_db.json',
    lastSyncTime: null,
    sha: null
  };
};

export const saveGitHubConfig = (config) => {
  try {
    if (!config || !config.token) {
      localStorage.removeItem(CONFIG_KEY);
    } else {
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    }
  } catch (e) {}
};

// Dynamically fetch real GitHub username via token
export const fetchGitHubUser = async (token) => {
  if (!token || token.trim().length < 10) return null;
  try {
    const res = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token.trim()}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (res.ok) {
      const userData = await res.json();
      return userData.login || null;
    }
  } catch (e) {}
  return null;
};

// Smart 2-Way Merge Helper (Combines offline local entries + cloud entries seamlessly)
export const mergeBudgetData = (localData, cloudData) => {
  if (!cloudData && !localData) return null;
  if (!cloudData) return localData;
  if (!localData) return cloudData;

  const localTx = Array.isArray(localData.transactions) ? localData.transactions : [];
  const cloudTx = Array.isArray(cloudData.transactions) ? cloudData.transactions : [];

  // Map transactions by unique ID to prevent duplicates
  const txMap = new Map();
  cloudTx.forEach(tx => { if (tx && tx.id) txMap.set(tx.id, tx); });
  localTx.forEach(tx => { if (tx && tx.id) txMap.set(tx.id, tx); });

  const mergedTransactions = Array.from(txMap.values()).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const isLocalEmpty = localTx.length === 0 && Number(localData.monthlyAllowance || 0) === 0;
  const isCloudEmpty = cloudTx.length === 0 && Number(cloudData.monthlyAllowance || 0) === 0;

  // Categories resolution:
  // If local app is brand new/empty and cloud has categories, hydrate directly from cloud
  // If local has categories, local categories is the authority (preserves custom icons, names, deletions & ordering)
  // Plus, safely append any cloud custom categories that local doesn't have so historical transactions don't lose icons
  let effectiveCategories = [];
  if (isLocalEmpty && !isCloudEmpty && Array.isArray(cloudData.categories) && cloudData.categories.length > 0) {
    effectiveCategories = cloudData.categories;
  } else if (Array.isArray(localData.categories) && localData.categories.length > 0) {
    const localCatIds = new Set(localData.categories.map(c => c.id));
    const extraCloudCats = (cloudData.categories || []).filter(cc => cc && cc.id && !localCatIds.has(cc.id));
    effectiveCategories = [...localData.categories, ...extraCloudCats];
  } else if (Array.isArray(cloudData.categories) && cloudData.categories.length > 0) {
    effectiveCategories = cloudData.categories;
  } else {
    effectiveCategories = localData.categories || [];
  }

  // Merge Wishlist
  const wishMap = new Map();
  (cloudData.wishlist || []).forEach(w => { if (w && w.id) wishMap.set(w.id, w); });
  (localData.wishlist || []).forEach(w => { if (w && w.id) wishMap.set(w.id, w); });

  // Merge Custom Currencies
  const currMap = new Map();
  (cloudData.customCurrencies || []).forEach(c => { if (c && c.code) currMap.set(c.code, c); });
  (localData.customCurrencies || []).forEach(c => { if (c && c.code) currMap.set(c.code, c); });

  // Merge Debts (smart merge of debt records and repayment history logs)
  const debtMap = new Map();
  (cloudData.debts || []).forEach(d => { if (d && d.id) debtMap.set(d.id, { ...d }); });
  (localData.debts || []).forEach(d => {
    if (!d || !d.id) return;
    if (debtMap.has(d.id)) {
      const cloudDebt = debtMap.get(d.id);
      const historyMap = new Map();
      (cloudDebt.history || []).forEach(h => { if (h && (h.id || h.date)) historyMap.set(h.id || `${h.date}-${h.amount}`, h); });
      (d.history || []).forEach(h => { if (h && (h.id || h.date)) historyMap.set(h.id || `${h.date}-${h.amount}`, h); });
      const mergedHistory = Array.from(historyMap.values()).sort((a, b) => new Date(a.date || 0) - new Date(b.date || 0));

      const actualRepaid = mergedHistory.filter(h => h.type === 'repayment').reduce((s, h) => s + Number(h.amount || 0), 0);
      const totalAmount = Number(d.amount || cloudDebt.amount || 0);
      const isSettled = Boolean(d.isSettled || cloudDebt.isSettled || (totalAmount > 0 && actualRepaid >= totalAmount));
      const remainingAmount = isSettled ? 0 : Math.max(0, totalAmount - actualRepaid);
      const settledAmount = isSettled ? totalAmount : actualRepaid;

      debtMap.set(d.id, {
        ...cloudDebt,
        ...d,
        settledAmount,
        remainingAmount,
        isSettled,
        history: mergedHistory
      });
    } else {
      debtMap.set(d.id, { ...d });
    }
  });

  // Merge Piggy Manual Deposits
  const piggyDepMap = new Map();
  (cloudData.piggyManualDeposits || []).forEach(p => { if (p && p.id) piggyDepMap.set(p.id, p); });
  (localData.piggyManualDeposits || []).forEach(p => { if (p && p.id) piggyDepMap.set(p.id, p); });

  // Merge Archived Cycles (deduplicate by id or date)
  const cycleMap = new Map();
  (cloudData.archivedCycles || []).forEach(c => { 
    const key = c.id || c.cycleEndStr || c.date; 
    if (key) cycleMap.set(key, c); 
  });
  (localData.archivedCycles || []).forEach(c => { 
    const key = c.id || c.cycleEndStr || c.date; 
    if (key) cycleMap.set(key, c); 
  });

  // Merge Fixed Deductions
  const fixMap = new Map();
  (cloudData.fixedDeductions || []).forEach(f => { if (f && (f.id || f.title)) fixMap.set(f.id || f.title, f); });
  (localData.fixedDeductions || []).forEach(f => { if (f && (f.id || f.title)) fixMap.set(f.id || f.title, f); });
  const effectiveFixedDeductions = Array.from(fixMap.values());

  let effectiveMonthlyAllowance = Number(localData.monthlyAllowance || 0);
  let effectivePayday = Number(localData.paydayAnchorDate || 1);
  let effectiveReserve = Number(localData.emergencyReserve || 0);
  let effectiveCurrency = localData.currency || { code: 'INR', symbol: '₹', name: 'Indian Rupee', country: 'India', flag: '🇮🇳' };
  let effectiveDarkMode = Boolean(localData.isDarkMode ?? cloudData.isDarkMode ?? false);
  let effectiveReminderSettings = localData.reminderSettings || cloudData.reminderSettings || { enabled: true, time: '20:00' };

  if (isLocalEmpty && !isCloudEmpty) {
    // Local app is fresh/empty: Hydrate 100% directly from Cloud
    effectiveMonthlyAllowance = Number(cloudData.monthlyAllowance || 0);
    effectivePayday = Number(cloudData.paydayAnchorDate || 1);
    effectiveReserve = Number(cloudData.emergencyReserve || 0);
    effectiveCurrency = cloudData.currency || effectiveCurrency;
    effectiveDarkMode = Boolean(cloudData.isDarkMode ?? false);
  } else if (!isLocalEmpty && isCloudEmpty) {
    // Cloud is fresh/empty: Keep local configuration
    effectiveMonthlyAllowance = Number(localData.monthlyAllowance || 0);
    effectivePayday = Number(localData.paydayAnchorDate || 1);
  } else {
    // Both sides have data: If local payday is 1 and cloud has a custom payday, preserve cloud payday
    effectiveMonthlyAllowance = Number(localData.monthlyAllowance || cloudData.monthlyAllowance || 0);
    effectivePayday = (localData.paydayAnchorDate && localData.paydayAnchorDate !== 1) 
      ? Number(localData.paydayAnchorDate) 
      : Number(cloudData.paydayAnchorDate || localData.paydayAnchorDate || 1);
    effectiveReserve = Number(localData.emergencyReserve || cloudData.emergencyReserve || 0);
  }

  return {
    ...cloudData,
    ...localData,
    monthlyAllowance: effectiveMonthlyAllowance,
    paydayAnchorDate: effectivePayday,
    emergencyReserve: effectiveReserve,
    isEmergencyUnlocked: Boolean(localData.isEmergencyUnlocked ?? cloudData.isEmergencyUnlocked ?? false),
    isDarkMode: effectiveDarkMode,
    fixedDeductions: effectiveFixedDeductions,
    currency: effectiveCurrency,
    categories: effectiveCategories,
    transactions: mergedTransactions,
    wishlist: Array.from(wishMap.values()),
    debts: Array.from(debtMap.values()),
    piggyManualDeposits: Array.from(piggyDepMap.values()),
    customCurrencies: Array.from(currMap.values()),
    archivedCycles: Array.from(cycleMap.values()),
    reminderSettings: effectiveReminderSettings
  };
};

// Helper: Safely encode UTF-8 text to Base64 (handles emojis & special characters)
const utf8ToBase64 = (str) => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1) => {
    return String.fromCharCode('0x' + p1);
  }));
};

// Helper: Safely decode Base64 to UTF-8 text
const base64ToUtf8 = (str) => {
  return decodeURIComponent(Array.prototype.map.call(atob(str), (c) => {
    return '%' + ('0' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
};

// Automatically check & create private GitHub repository if it doesn't exist
export const ensurePrivateRepoExists = async (configOverride = null) => {
  const config = configOverride || getGitHubConfig();
  if (!config.token || !config.owner || !config.repo) {
    return { success: false, error: 'GitHub credentials missing' };
  }

  const repoUrl = `https://api.github.com/repos/${config.owner}/${config.repo}`;

  try {
    const checkRes = await fetch(repoUrl, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (checkRes.ok) {
      return { success: true, created: false };
    }

    if (checkRes.status === 404) {
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: config.repo,
          description: 'Pocket Budget App Private Automated Database Repository',
          private: true,
          auto_init: true
        })
      });

      if (createRes.ok || createRes.status === 201) {
        // Give GitHub a brief moment to initialize the repo and main branch
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true, created: true };
      } else {
        const errData = await createRes.json().catch(() => ({}));
        return {
          success: false,
          error: errData.message || 'Cannot create private repository. Make sure your token has "repo" scope checked.'
        };
      }
    }

    if (checkRes.status === 401 || checkRes.status === 403) {
      return { success: false, error: 'GitHub Token invalid or missing "repo" scope permission.' };
    }

    return { success: false, error: `GitHub check failed (status ${checkRes.status})` };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// Push local budget data to private GitHub repository with Automatic 409 Conflict & Auto Repo Creation
export const pushToGitHub = async (budgetData, configOverride = null) => {
  const config = configOverride || getGitHubConfig();
  if (!config.token || !config.owner || !config.repo) {
    return { success: false, error: 'GitHub credentials missing' };
  }

  // Ensure private repo exists automatically
  const repoRes = await ensurePrivateRepoExists(config);
  if (!repoRes.success && !repoRes.created) {
    return { success: false, error: repoRes.error || 'Private repository pocket-budget-db not accessible. Ensure your token has "repo" scope.' };
  }

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filename}`;
  
  try {
    const contentEncoded = utf8ToBase64(JSON.stringify(budgetData, null, 2));

    // Always fetch latest fresh file SHA from GitHub to prevent 409 Conflict
    let sha = null;
    const getRes = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (getRes.ok) {
      const fileInfo = await getRes.json().catch(() => ({}));
      sha = fileInfo.sha || null;
    }

    const body = {
      message: `Update pocket budget database - ${new Date().toLocaleString()}`,
      content: contentEncoded
    };
    if (sha) body.sha = sha;

    let putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    // Automatic 409 Conflict Retry Logic
    if (putRes.status === 409) {
      const freshGetRes = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (freshGetRes.ok) {
        const freshFileInfo = await freshGetRes.json().catch(() => ({}));
        body.sha = freshFileInfo.sha;
        putRes = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${config.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });
      }
    }

    if (putRes.ok || putRes.status === 201 || putRes.status === 200) {
      const resData = await putRes.json().catch(() => ({}));
      const newSha = resData.content?.sha || sha;
      const now = new Date().toISOString();
      saveGitHubConfig({ ...config, sha: newSha, lastSyncTime: now });
      return { success: true, sha: newSha, time: now };
    } else {
      const errData = await putRes.json().catch(() => ({}));
      if (putRes.status === 404) {
        return { success: false, error: 'Database repository not found. Please ensure your GitHub token has "repo" permission.' };
      }
      return { success: false, error: errData.message || `Push failed (Status ${putRes.status})` };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

// Pull latest budget data from private GitHub repository
export const pullFromGitHub = async (configOverride = null) => {
  const config = configOverride || getGitHubConfig();
  if (!config.token || !config.owner || !config.repo) {
    return { success: false, error: 'GitHub credentials missing' };
  }

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filename}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) {
      if (res.status === 404) {
        return { success: false, error: 'Cloud database is empty. Please tap "Push to Cloud" first to upload your data.' };
      }
      if (res.status === 401 || res.status === 403) {
        return { success: false, error: 'Access denied. Please check your GitHub token and "repo" permissions.' };
      }
      return { success: false, error: `GitHub fetch failed: ${res.statusText}` };
    }

    const fileData = await res.json();
    const jsonText = base64ToUtf8(fileData.content);
    const parsedData = JSON.parse(jsonText);
    const now = new Date().toISOString();

    saveGitHubConfig({ ...config, sha: fileData.sha, lastSyncTime: now });
    return { success: true, data: parsedData, sha: fileData.sha, time: now };
  } catch (err) {
    return { success: false, error: err.message };
  }
};
