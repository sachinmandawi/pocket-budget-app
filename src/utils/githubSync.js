// GitHub Auto Sync Utility for Private DB Repository

const CONFIG_KEY = 'pocket_budget_github_config';

export const getGitHubConfig = () => {
  try {
    const stored = localStorage.getItem(CONFIG_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Remove legacy hardcoded credentials if present
      if (parsed) {
        if (parsed.token && parsed.token.includes('9WArQWO0qBS9qAA')) parsed.token = '';
        return parsed;
      }
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
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
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

// Push local budget data to private GitHub repository with Automatic 409 Conflict Handling
export const pushToGitHub = async (budgetData, configOverride = null) => {
  const config = configOverride || getGitHubConfig();
  if (!config.token || !config.owner || !config.repo) {
    return { success: false, error: 'GitHub credentials missing' };
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
      const fileInfo = await getRes.json();
      sha = fileInfo.sha;
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
        const freshFileInfo = await freshGetRes.json();
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

    if (!res.ok) {
      if (res.status === 404) {
        return { success: false, error: 'Database file not found in repo' };
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
