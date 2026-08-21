// Version Checker Utility for Pocket Budget GitHub Releases

export const CURRENT_APP_VERSION = '1.4.0';
export const GITHUB_REPO_OWNER = 'sachinmandawi';
export const GITHUB_REPO_NAME = 'pocket-budget-app';

// Simple semver compare (returns true if remote is newer than current)
export const isNewerVersion = (remoteVer, currentVer = CURRENT_APP_VERSION) => {
  if (!remoteVer) return false;
  const cleanRemote = remoteVer.replace(/^v/i, '').trim();
  const cleanCurrent = currentVer.replace(/^v/i, '').trim();

  const rParts = cleanRemote.split('.').map(Number);
  const cParts = cleanCurrent.split('.').map(Number);

  for (let i = 0; i < Math.max(rParts.length, cParts.length); i++) {
    const r = rParts[i] || 0;
    const c = cParts[i] || 0;
    if (r > c) return true;
    if (r < c) return false;
  }
  return false;
};

// Check GitHub Releases for the latest version
export const checkForAppUpdate = async () => {
  try {
    const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/releases/latest`;
    const res = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!res.ok) {
      return { hasUpdate: false, error: 'Could not fetch release info' };
    }

    const releaseData = await res.json();
    const remoteVersion = releaseData.tag_name || '';
    const hasUpdate = isNewerVersion(remoteVersion, CURRENT_APP_VERSION);

    // Find direct APK asset download URL
    let apkDownloadUrl = releaseData.html_url;
    if (Array.isArray(releaseData.assets)) {
      const apkAsset = releaseData.assets.find(a => a.name && a.name.endsWith('.apk'));
      if (apkAsset && apkAsset.browser_download_url) {
        apkDownloadUrl = apkAsset.browser_download_url;
      }
    }

    // Clean, short highlights (extract top 2-3 bullets from release body without clutter)
    const rawBody = releaseData.body || '';
    const highlights = rawBody
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('-') || line.startsWith('*') || line.startsWith('•'))
      .map(line => line.replace(/^[-*•]\s*/, '').replace(/\*\*/g, ''))
      .filter(line => line.length > 0 && !line.includes('Download') && !line.includes('APK'))
      .slice(0, 3);

    return {
      hasUpdate,
      currentVersion: CURRENT_APP_VERSION,
      latestVersion: remoteVersion.replace(/^v/i, ''),
      releaseName: releaseData.name || `Version ${remoteVersion}`,
      downloadUrl: apkDownloadUrl,
      htmlUrl: releaseData.html_url,
      highlights: highlights.length > 0 ? highlights : ['Performance improvements & bug fixes']
    };
  } catch (err) {
    return { hasUpdate: false, error: err.message };
  }
};
