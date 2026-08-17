import React, { useState, useEffect, useRef } from 'react';
import { CloudUpload, CloudDownload, ShieldCheck, Github, AlertCircle, LogOut, KeyRound, Sparkles, Download, Upload, FileJson } from 'lucide-react';
import { getGitHubConfig, saveGitHubConfig, pushToGitHub, pullFromGitHub, fetchGitHubUser, mergeBudgetData, ensurePrivateRepoExists } from '../../utils/githubSync';
import { formatLocalYMD } from '../../utils/storage';

export default function GithubSyncSettingsPage({ budgetData, onUpdateBudgetData }) {
  const [config, setConfig] = useState(getGitHubConfig);
  const [tokenInput, setTokenInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const importFileRef = useRef(null);

  const isConfigured = Boolean(config.owner && config.repo && config.token);

  // Always sync state from localStorage on mount
  useEffect(() => {
    setConfig(getGitHubConfig());
  }, []);

  // Connect via Manual / Pasted Token Input
  const handleConnectToken = async (e) => {
    e?.preventDefault();
    if (!tokenInput || tokenInput.trim().length < 10) {
      setSyncStatusMsg({ type: 'error', text: 'Please enter a valid GitHub Access Token' });
      return;
    }

    const tokenVal = tokenInput.trim();
    setIsSyncing(true);
    setSyncStatusMsg({ type: 'info', text: 'Validating Token & GitHub Profile...' });

    const username = await fetchGitHubUser(tokenVal);
    if (username) {
      const newConfig = {
        ...getGitHubConfig(),
        token: tokenVal,
        owner: username,
        repo: 'pocket-budget-db'
      };
      saveGitHubConfig(newConfig);
      setConfig(newConfig);
      setTokenInput('');

      setSyncStatusMsg({ type: 'info', text: '🔒 Verifying / Creating Private Repository...' });
      const repoRes = await ensurePrivateRepoExists(newConfig);
      if (repoRes.created) {
        setSyncStatusMsg({ type: 'info', text: '✨ Private repository "pocket-budget-db" created automatically!' });
      }

      setSyncStatusMsg({ type: 'info', text: '📥 Merging offline and cloud databases...' });
      const res = await pullFromGitHub(newConfig);
      setIsSyncing(false);

      if (res.success && res.data) {
        const mergedData = mergeBudgetData(budgetData, res.data);
        onUpdateBudgetData(mergedData);
        pushToGitHub(mergedData, newConfig);
        setSyncStatusMsg({ type: 'success', text: `✅ Connected as @${username} & Smart Merged!` });
      } else {
        pushToGitHub(budgetData, newConfig);
        setSyncStatusMsg({ type: 'success', text: `✅ Connected as @${username} & Database Initialized!` });
      }
    } else {
      setIsSyncing(false);
      setSyncStatusMsg({ type: 'error', text: '❌ Invalid Token. Please check and try again.' });
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('pocket_budget_github_config');
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
    setTokenInput('');
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

  // ---- Local Export: Download JSON File ----
  const handleExport = () => {
    try {
      const filename = `pocket-budget-backup-${formatLocalYMD(new Date())}.json`;
      const jsonStr = JSON.stringify(budgetData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setImportStatus({ type: 'success', text: `✅ Backup downloaded: ${filename}` });
    } catch (err) {
      setImportStatus({ type: 'error', text: '❌ Export failed. Please try again.' });
    }
  };

  // ---- Local Import: Upload JSON File ----
  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.json')) {
      setImportStatus({ type: 'error', text: '❌ Please select a valid .json backup file.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.transactions)) {
          setImportStatus({ type: 'error', text: '❌ Invalid backup file format.' });
          return;
        }
        const txCount = parsed.transactions.length;
        const confirmed = window.confirm(
          `Import this backup?\n\n` +
          `📦 File: ${file.name}\n` +
          `📋 Transactions: ${txCount}\n` +
          `💰 Allowance: ${parsed.currency?.symbol || '₹'}${parsed.monthlyAllowance || 0}\n\n` +
          `⚠️ This will REPLACE your current data!`
        );
        if (confirmed) {
          onUpdateBudgetData(parsed);
          setImportStatus({ type: 'success', text: `✅ Data imported! ${txCount} transactions restored.` });
        } else {
          setImportStatus({ type: 'info', text: 'Import cancelled.' });
        }
      } catch {
        setImportStatus({ type: 'error', text: '❌ Could not read the file. Make sure it is a valid JSON backup.' });
      }
      // Reset file input so same file can be selected again
      if (importFileRef.current) importFileRef.current.value = '';
    };
    reader.readAsText(file);
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
            {isConfigured ? 'Connected' : 'Not Configured'}
          </span>
        </div>

        {/* Connected State vs Clean Token Input Form */}
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
          <form onSubmit={handleConnectToken} style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label style={{
                fontSize: '11px',
                fontWeight: 800,
                color: 'var(--text-tertiary)',
                textTransform: 'uppercase',
                marginBottom: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <KeyRound size={12} /> GitHub Personal Access Token
              </label>
              <input
                type="password"
                placeholder="Paste token (e.g. ghp_xxxxxxxxxxxx)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                className="ios-input"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSyncing || !tokenInput.trim()}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: '13px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                opacity: !tokenInput.trim() ? 0.5 : 1
              }}
            >
              <Sparkles size={16} /> Connect & Sync GitHub
            </button>
          </form>
        )}

        {/* Dual Manual Action Buttons */}
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

      {/* ---- Local Import / Export Card ---- */}
      <div className="ios-card" style={{ marginTop: '16px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '12px',
            background: 'var(--bg-card-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border-subtle)'
          }}>
            <FileJson size={22} color="var(--ios-green)" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
              Local Backup
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Export or import your data as a JSON file
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {/* Export Button */}
          <button
            onClick={handleExport}
            className="btn btn-primary"
            style={{
              padding: '12px',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: 'var(--ios-green)',
              boxShadow: '0 3px 10px rgba(52,199,89,0.3)'
            }}
          >
            <Download size={16} /> Export JSON
          </button>

          {/* Import Button */}
          <button
            onClick={() => importFileRef.current?.click()}
            className="btn btn-secondary"
            style={{
              padding: '12px',
              fontSize: '13px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Upload size={16} /> Import JSON
          </button>

          {/* Hidden file input */}
          <input
            ref={importFileRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleImportFile}
          />
        </div>


        {/* Import/Export Status */}
        {importStatus && (
          <div style={{
            marginTop: '12px',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            background: importStatus.type === 'success' ? 'var(--ios-green-bg)' : importStatus.type === 'info' ? 'var(--ios-blue-bg)' : 'var(--ios-red-bg)',
            color: importStatus.type === 'success' ? 'var(--ios-green)' : importStatus.type === 'info' ? 'var(--ios-blue)' : 'var(--ios-red)',
            fontSize: '13px',
            fontWeight: 800
          }}>
            {importStatus.text}
          </div>
        )}
      </div>
    </div>
  );
}
