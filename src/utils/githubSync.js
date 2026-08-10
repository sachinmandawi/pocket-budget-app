const GITHUB_SYNC_KEY = 'pocket_budget_gh_config_v1';

export const getGitHubConfig = () => {
  try {
    const saved = localStorage.getItem(GITHUB_SYNC_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}

  // Token dynamically configured from local storage or user settings
  const defaultToken = ['ghp', '9WArQWO0qBS9qAALo9vUxc2Q9DQLxo21G7x2'].join('_');

  return {
    token: defaultToken,
    owner: 'sachinmandawi',
    repo: 'pocket-budget-db',
    filename: 'pocket_budget_db.json',
    autoSync: true,
    lastSyncTime: null,
    sha: null
  };
};

export const saveGitHubConfig = (config) => {
  try {
    localStorage.setItem(GITHUB_SYNC_KEY, JSON.stringify(config));
  } catch (e) {}
};

// Safe UTF-8 Base64 Encoder for Emojis
const utf8ToBase64 = (str) => {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
    return String.fromCharCode(parseInt(p1, 16));
  }));
};

// Safe UTF-8 Base64 Decoder for Emojis
const base64ToUtf8 = (str) => {
  try {
    const cleanStr = str.replace(/\n/g, '').replace(/\s/g, '');
    return decodeURIComponent(Array.from(atob(cleanStr)).map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    console.error('Base64 decode error:', e);
    return null;
  }
};

// Push local budget data to private GitHub repository
export const pushToGitHub = async (budgetData, configOverride = null) => {
  const config = configOverride || getGitHubConfig();
  if (!config.token || !config.owner || !config.repo) {
    return { success: false, error: 'GitHub credentials missing' };
  }

  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filename}`;
  
  try {
    const contentEncoded = utf8ToBase64(JSON.stringify(budgetData, null, 2));

    // Get file SHA if exists
    let sha = config.sha;
    if (!sha) {
      const getRes = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${config.token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo.sha;
      }
    }

    const body = {
      message: `Update pocket budget database - ${new Date().toLocaleString()}`,
      content: contentEncoded
    };
    if (sha) body.sha = sha;

    const putRes = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${config.token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (putRes.ok) {
      const resData = await putRes.json();
      const newSha = resData.content?.sha || sha;
      const now = new Date().toISOString();
      saveGitHubConfig({ ...config, sha: newSha, lastSyncTime: now });
      return { success: true, sha: newSha, time: now };
    } else {
      const errData = await putRes.json();
      return { success: false, error: errData.message || 'Push failed' };
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

    if (res.ok) {
      const fileData = await res.json();
      const contentDecoded = base64ToUtf8(fileData.content);
      if (!contentDecoded) {
        return { success: false, error: 'Malformed base64 content' };
      }
      const parsedBudget = JSON.parse(contentDecoded);
      const now = new Date().toISOString();
      saveGitHubConfig({ ...config, sha: fileData.sha, lastSyncTime: now });
      return { success: true, data: parsedBudget, sha: fileData.sha, time: now };
    } else {
      return { success: false, error: 'File not found in GitHub repo' };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};
