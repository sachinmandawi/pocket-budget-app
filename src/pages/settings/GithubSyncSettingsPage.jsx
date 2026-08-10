import React, { useState } from 'react';
import { Save, CloudUpload, CloudDownload, ShieldCheck, Github } from 'lucide-react';
import { getGitHubConfig, saveGitHubConfig, pushToGitHub, pullFromGitHub } from '../../utils/githubSync';

export default function GithubSyncSettingsPage({ budgetData, onUpdateBudgetData }) {
  const [config, setConfig] = useState(getGitHubConfig);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState(null);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    saveGitHubConfig(config);
    setSyncStatusMsg({ type: 'success', text: 'GitHub configuration saved!' });
  };

  const handlePushNow = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    const res = await pushToGitHub(budgetData, config);
    setIsSyncing(false);

    if (res.success) {
      setConfig(getGitHubConfig());
      setSyncStatusMsg({ type: 'success', text: '✅ Database successfully pushed to private repo!' });
    } else {
      setSyncStatusMsg({ type: 'error', text: `❌ Push failed: ${res.error}` });
    }
  };

  const handlePullNow = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    const res = await pullFromGitHub(config);
    setIsSyncing(false);

    if (res.success && res.data) {
      onUpdateBudgetData(res.data);
      setConfig(getGitHubConfig());
      setSyncStatusMsg({ type: 'success', text: '✅ Database successfully restored from GitHub private repo!' });
    } else {
      setSyncStatusMsg({ type: 'error', text: `❌ Pull failed: ${res.error}` });
    }
  };

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="ios-card">
        {/* Repo Status Pill Container */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          padding: '14px',
          background: 'var(--bg-card-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 180px', minWidth: 0 }}>
            <Github size={22} color="var(--ios-blue)" style={{ flexShrink: 0 }} />
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <p style={{
                fontSize: '13px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                wordBreak: 'break-all',
                lineHeight: 1.2
              }}>
                {config.owner}/{config.repo}
              </p>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Private Database Repository
              </p>
            </div>
          </div>

          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            background: 'var(--ios-green-bg)',
            color: 'var(--ios-green)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            whiteSpace: 'nowrap',
            flexShrink: 0,
            marginLeft: 'auto'
          }}>
            <ShieldCheck size={13} /> Connected
          </span>
        </div>

        {/* Sync Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <button 
            onClick={handlePushNow}
            disabled={isSyncing}
            className="btn btn-primary"
            style={{ padding: '12px', fontSize: '13px' }}
          >
            <CloudUpload size={16} /> {isSyncing ? 'Syncing...' : 'Push to GitHub'}
          </button>

          <button 
            onClick={handlePullNow}
            disabled={isSyncing}
            className="btn btn-secondary"
            style={{ padding: '12px', fontSize: '13px' }}
          >
            <CloudDownload size={16} /> Pull from GitHub
          </button>
        </div>

        {syncStatusMsg && (
          <div style={{
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '16px',
            background: syncStatusMsg.type === 'success' ? 'var(--ios-green-bg)' : 'var(--ios-red-bg)',
            color: syncStatusMsg.type === 'success' ? 'var(--ios-green)' : 'var(--ios-red)'
          }}>
            {syncStatusMsg.text}
          </div>
        )}

        {config.lastSyncTime && (
          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px', textAlign: 'center' }}>
            Last Sync: {new Date(config.lastSyncTime).toLocaleString()}
          </p>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleSaveConfig} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <div className="form-group">
            <label className="form-label">Personal Access Token</label>
            <input
              type="password"
              required
              className="form-input"
              style={{ fontSize: '13px', fontFamily: 'monospace' }}
              value={config.token}
              onChange={e => setConfig({ ...config, token: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Owner</label>
              <input
                type="text"
                required
                className="form-input"
                style={{ fontSize: '13px' }}
                value={config.owner}
                onChange={e => setConfig({ ...config, owner: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Private Repo</label>
              <input
                type="text"
                required
                className="form-input"
                style={{ fontSize: '13px' }}
                value={config.repo}
                onChange={e => setConfig({ ...config, repo: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
            <Save size={14} /> Update Credentials
          </button>
        </form>
      </div>
    </div>
  );
}
