import React, { useState } from 'react';
import { Save, CloudUpload, CloudDownload, ShieldCheck, Github, AlertCircle, KeyRound, LogOut } from 'lucide-react';
import { getGitHubConfig, saveGitHubConfig, pushToGitHub, pullFromGitHub, fetchGitHubUser } from '../../utils/githubSync';

export default function GithubSyncSettingsPage({ budgetData, onUpdateBudgetData }) {
  const [config, setConfig] = useState(getGitHubConfig);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState(null);

  const isConfigured = Boolean(config.owner && config.repo && config.token);

  const handleTokenInputChange = async (e) => {
    const val = e.target.value;
    const updated = { ...config, token: val };
    setConfig(updated);

    if (val && val.trim().length >= 10) {
      const fetchedOwner = await fetchGitHubUser(val.trim());
      if (fetchedOwner) {
        setConfig(prev => ({
          ...prev,
          token: val,
          owner: fetchedOwner,
          repo: prev.repo || 'pocket-budget-db'
        }));
      }
    }
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    if (!config.token || !config.owner || !config.repo) {
      setSyncStatusMsg({ type: 'error', text: 'Please fill Personal Access Token, Owner, and Repo' });
      return;
    }
    saveGitHubConfig(config);
    setSyncStatusMsg({ type: 'success', text: '✅ GitHub credentials saved!' });
  };

  const handleDisconnect = () => {
    const emptyConfig = {
      token: '',
      owner: '',
      repo: '',
      filename: 'pocket_budget_db.json',
      lastSyncTime: null,
      sha: null
    };
    saveGitHubConfig(emptyConfig);
    setConfig(emptyConfig);
    setSyncStatusMsg({ type: 'info', text: 'Disconnected GitHub Sync' });
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
        {/* Repo Status Pill Card */}
        <div style={{
          padding: '16px',
          background: 'var(--bg-card-subtle)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '16px'
        }}>
          {/* Top Row: Icon + Connected / Not Configured Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Github size={20} color="var(--ios-blue)" />
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Private Database
              </span>
            </div>

            {isConfigured ? (
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                background: 'var(--ios-green-bg)',
                color: 'var(--ios-green)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <ShieldCheck size={13} /> Connected
              </span>
            ) : (
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                background: 'var(--ios-orange-bg)',
                color: 'var(--ios-orange)',
                padding: '3px 10px',
                borderRadius: 'var(--radius-full)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <AlertCircle size={13} /> Not Configured
              </span>
            )}
          </div>

          {/* Repository Full Name */}
          {isConfigured ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{
                fontSize: '15px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                lineHeight: 1.3,
                wordBreak: 'break-word',
                margin: 0
              }}>
                {config.owner} / {config.repo}
              </p>
              <button
                onClick={handleDisconnect}
                style={{
                  background: 'var(--ios-red-bg)',
                  border: 'none',
                  color: 'var(--ios-red)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <LogOut size={12} /> Disconnect
              </button>
            </div>
          ) : (
            <p style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              lineHeight: 1.3,
              margin: 0
            }}>
              Not Configured (Enter Credentials Below)
            </p>
          )}
        </div>

        {/* Sync Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
          <button 
            onClick={handlePushNow}
            disabled={isSyncing || !isConfigured}
            className="btn btn-primary"
            style={{ padding: '12px', fontSize: '13px', opacity: !isConfigured ? 0.4 : 1 }}
          >
            <CloudUpload size={16} /> {isSyncing ? 'Syncing...' : 'Push to GitHub'}
          </button>

          <button 
            onClick={handlePullNow}
            disabled={isSyncing || !isConfigured}
            className="btn btn-secondary"
            style={{ padding: '12px', fontSize: '13px', opacity: !isConfigured ? 0.4 : 1 }}
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
            background: syncStatusMsg.type === 'success' ? 'var(--ios-green-bg)' : syncStatusMsg.type === 'info' ? 'var(--ios-blue-bg)' : 'var(--ios-red-bg)',
            color: syncStatusMsg.type === 'success' ? 'var(--ios-green)' : syncStatusMsg.type === 'info' ? 'var(--ios-blue)' : 'var(--ios-red)'
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
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <KeyRound size={14} color="var(--ios-blue)" /> Personal Access Token
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Paste ghp_xxxxxxxx Token"
              style={{ fontSize: '13px', fontFamily: 'monospace' }}
              value={config.token || ''}
              onChange={handleTokenInputChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">Owner (Auto-filled)</label>
              <input
                type="text"
                placeholder="github_username"
                className="form-input"
                style={{ fontSize: '13px' }}
                value={config.owner || ''}
                onChange={e => setConfig({ ...config, owner: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Private Repo</label>
              <input
                type="text"
                placeholder="pocket-budget-db"
                className="form-input"
                style={{ fontSize: '13px' }}
                value={config.repo || ''}
                onChange={e => setConfig({ ...config, repo: e.target.value })}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '13px', fontWeight: 800 }}>
            <Save size={15} /> Save Credentials
          </button>
        </form>
      </div>
    </div>
  );
}
