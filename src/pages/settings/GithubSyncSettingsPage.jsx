import React, { useState } from 'react';
import { CloudUpload, CloudDownload, ShieldCheck, Github, AlertCircle, ExternalLink, LogOut } from 'lucide-react';
import { getGitHubConfig, saveGitHubConfig, pushToGitHub, pullFromGitHub } from '../../utils/githubSync';

export default function GithubSyncSettingsPage({ budgetData, onUpdateBudgetData }) {
  const [config, setConfig] = useState(getGitHubConfig);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState(null);

  const isConfigured = Boolean(config.owner && config.repo && config.token);

  // 1-Click Cloudflare Worker GitHub OAuth Flow (PocketBudget Gatekeeper Engine)
  const handleGithubSignIn = () => {
    window.location.href = 'https://pocketbudget-gatekeeper.smandavi2003.workers.dev/auth/login';
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
      setSyncStatusMsg({ type: 'success', text: '✅ Database pushed to private repository!' });
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
      setSyncStatusMsg({ type: 'success', text: '✅ Database restored from GitHub private repository!' });
    } else {
      setSyncStatusMsg({ type: 'error', text: `❌ Pull failed: ${res.error}` });
    }
  };

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="ios-card">
        {/* Header Branding Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--bg-card-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-subtle)'
            }}>
              <Github size={22} color="var(--ios-blue)" />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                GitHub Cloud Sync
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Private Automated Database Backup
              </p>
            </div>
          </div>

          <span style={{
            fontSize: '11px',
            fontWeight: 800,
            background: isConfigured ? 'var(--ios-green-bg)' : 'var(--ios-orange-bg)',
            color: isConfigured ? 'var(--ios-green)' : 'var(--ios-orange)',
            padding: '4px 10px',
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {isConfigured ? <ShieldCheck size={13} /> : <AlertCircle size={13} />}
            {isConfigured ? 'Connected' : 'Not Connected'}
          </span>
        </div>

        {/* Connected State vs 1-Click Cloudflare Worker Sign In Button */}
        {isConfigured ? (
          <div style={{
            background: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block' }}>
                Connected Repository
              </span>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 800 }}>
                {config.owner} / {config.repo}
              </strong>
            </div>
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
          <div style={{ marginBottom: '16px' }}>
            {/* 1-Click GitHub OAuth Authorization Button */}
            <button
              type="button"
              onClick={handleGithubSignIn}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '14px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Github size={18} /> Sign in with GitHub Auth <ExternalLink size={14} style={{ opacity: 0.8 }} />
            </button>
          </div>
        )}

        {/* Dual Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <button 
            onClick={handlePushNow}
            disabled={isSyncing || !isConfigured}
            className="btn btn-primary"
            style={{
              padding: '12px',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              opacity: !isConfigured ? 0.4 : 1
            }}
          >
            <CloudUpload size={16} /> Push to Cloud
          </button>

          <button 
            onClick={handlePullNow}
            disabled={isSyncing || !isConfigured}
            className="btn btn-secondary"
            style={{
              padding: '12px',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              opacity: !isConfigured ? 0.4 : 1
            }}
          >
            <CloudDownload size={16} /> Pull from Cloud
          </button>
        </div>

        {config.lastSyncTime && (
          <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: '14px', margin: '14px 0 0' }}>
            Last Synced: {new Date(config.lastSyncTime).toLocaleString()}
          </p>
        )}
      </div>

      {/* Sync Status Feedback Toast */}
      {syncStatusMsg && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 'var(--radius-md)',
          background: syncStatusMsg.type === 'success' ? 'var(--ios-green-bg)' : syncStatusMsg.type === 'info' ? 'var(--ios-blue-bg)' : 'var(--ios-red-bg)',
          color: syncStatusMsg.type === 'success' ? 'var(--ios-green)' : syncStatusMsg.type === 'info' ? 'var(--ios-blue)' : 'var(--ios-red)',
          fontSize: '13px',
          fontWeight: 800,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {syncStatusMsg.text}
        </div>
      )}
    </div>
  );
}
