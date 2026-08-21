import React, { useState, useEffect, useRef } from 'react';
import { CloudUpload, CloudDownload, ShieldCheck, Github, AlertCircle, LogOut, KeyRound, Sparkles, Download, Upload, FileJson, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { getGitHubConfig, saveGitHubConfig, pushToGitHub, pullFromGitHub, fetchGitHubUser, mergeBudgetData, ensurePrivateRepoExists } from '../../utils/githubSync';
import { formatLocalYMD } from '../../utils/storage';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

export default function GithubSyncSettingsPage({ budgetData, onUpdateBudgetData }) {
  const [config, setConfig] = useState(getGitHubConfig);
  const [tokenInput, setTokenInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const [pendingImport, setPendingImport] = useState(null);
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

      if (res.success && res.data) {
        const mergedData = mergeBudgetData(budgetData, res.data);
        onUpdateBudgetData(mergedData);
        await pushToGitHub(mergedData, newConfig);
        setSyncStatusMsg({ type: 'success', text: `✅ Connected as @${username} & Smart Merged!` });
      } else {
        await pushToGitHub(budgetData, newConfig);
        setSyncStatusMsg({ type: 'success', text: `✅ Connected as @${username} & Database Initialized!` });
      }
      setIsSyncing(false);
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

  // ---- Local Export: Native Android / Web Download JSON File ----
  const handleExport = async () => {
    try {
      const filename = `pocket-budget-backup-${formatLocalYMD(new Date())}.json`;
      const jsonStr = JSON.stringify(budgetData, null, 2);

      if (Capacitor.isNativePlatform()) {
        const writeRes = await Filesystem.writeFile({
          path: filename,
          data: jsonStr,
          directory: Directory.Cache,
          encoding: Encoding.UTF8
        });

        await Share.share({
          title: 'Pocket Budget Backup',
          text: `Pocket Budget backup file (${filename})`,
          url: writeRes.uri,
          dialogTitle: 'Save or Share Backup File'
        });

        setImportStatus({ type: 'success', text: `✅ Backup file generated! Choose where to save/share.` });
      } else {
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
      }
    } catch (err) {
      setImportStatus({ type: 'error', text: `❌ Export failed: ${err.message || 'Please try again'}` });
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
        setPendingImport({
          fileName: file.name,
          txCount,
          allowance: parsed.monthlyAllowance || 0,
          currencySymbol: parsed.currency?.symbol || '₹',
          data: parsed
        });
      } catch {
        setImportStatus({ type: 'error', text: '❌ Could not read the file. Make sure it is a valid JSON backup.' });
      }
      if (importFileRef.current) importFileRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = () => {
    if (pendingImport?.data) {
      onUpdateBudgetData(pendingImport.data);
      setImportStatus({ type: 'success', text: `✅ Data imported!` });
    }
    setPendingImport(null);
  };

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <div className="notion-card">
        {/* Header Branding Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Github size={18} color="var(--text-primary)" />
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
                GitHub Cloud Sync
              </h3>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
                Private Automated Database Backup
              </p>
            </div>
          </div>

          <span className={`notion-tag ${isConfigured ? 'notion-tag-green' : 'notion-tag-orange'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            {isConfigured ? <ShieldCheck size={11} /> : <AlertCircle size={11} />}
            {isConfigured ? 'Connected' : 'Not Configured'}
          </span>
        </div>

        {/* Connected State vs Clean Token Input Form */}
        {isConfigured ? (
          <div style={{
            background: 'var(--bg-card-subtle)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block' }}>
                Connected Repository
              </span>
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600 }}>
                {config.owner} / {config.repo}
              </strong>
            </div>
            <button
              onClick={handleDisconnect}
              className="notion-tag notion-tag-red"
              style={{
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px'
              }}
            >
              <LogOut size={11} /> Disconnect
            </button>
          </div>
        ) : (
          <form onSubmit={handleConnectToken} style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'block',
                marginBottom: '4px'
              }}>
                GitHub Personal Access Token (PAT)
              </label>
              <input
                type="password"
                required
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={tokenInput}
                onChange={e => setTokenInput(e.target.value)}
                className="form-input"
                style={{ fontSize: '13px', fontFamily: 'monospace', width: '100%' }}
              />
              <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px', display: 'block' }}>
                Auto-detects your GitHub account & creates a private "pocket-budget-db" repo
              </span>
            </div>

            <button
              type="submit"
              disabled={isSyncing || !tokenInput.trim()}
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px', fontSize: '13px', fontWeight: 600 }}
            >
              {isSyncing ? 'Connecting...' : 'Connect GitHub & Sync'}
            </button>
          </form>
        )}

        {/* Sync Actions Grid */}
        {isConfigured && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
              <button
                onClick={handlePullNow}
                disabled={isSyncing}
                className="btn btn-secondary"
                style={{ padding: '9px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <CloudDownload size={14} /> {isSyncing ? 'Syncing...' : 'Pull from Cloud'}
              </button>

              <button
                onClick={handlePushNow}
                disabled={isSyncing}
                className="btn btn-primary"
                style={{ padding: '9px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <CloudUpload size={14} /> {isSyncing ? 'Syncing...' : 'Push to Cloud'}
              </button>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
              Last Synced: {config.lastSyncTime ? new Date(config.lastSyncTime).toLocaleString() : 'Not yet synced in this session'}
            </div>
          </div>
        )}
      </div>

      {/* Sync Status Banner */}
      {syncStatusMsg && (
        <div 
          className="notion-callout"
          style={{
            marginTop: '12px',
            background: syncStatusMsg.type === 'success' ? 'var(--notion-green-bg)' : syncStatusMsg.type === 'info' ? 'var(--notion-blue-bg)' : 'var(--notion-red-bg)',
            color: syncStatusMsg.type === 'success' ? 'var(--notion-green-text)' : syncStatusMsg.type === 'info' ? 'var(--notion-blue-text)' : 'var(--notion-red-text)',
            fontSize: '12px',
            fontWeight: 600
          }}
        >
          {syncStatusMsg.text}
        </div>
      )}

      {/* ---- Local Import / Export Card ---- */}
      <div className="notion-card" style={{ marginTop: '14px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <FileJson size={18} color="var(--notion-green-text)" />
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--text-primary)' }}>
              Local Backup
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
              Export or import your data as a JSON file
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {/* Export Button */}
          <button
            onClick={handleExport}
            className="btn btn-primary"
            style={{
              padding: '10px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Download size={14} /> Export JSON
          </button>

          {/* Import Button */}
          <button
            onClick={() => importFileRef.current?.click()}
            className="btn btn-secondary"
            style={{
              padding: '10px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Upload size={14} /> Import JSON
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
          <div 
            className="notion-callout"
            style={{
              marginTop: '10px',
              background: importStatus.type === 'success' ? 'var(--notion-green-bg)' : importStatus.type === 'info' ? 'var(--notion-blue-bg)' : 'var(--notion-red-bg)',
              color: importStatus.type === 'success' ? 'var(--notion-green-text)' : importStatus.type === 'info' ? 'var(--notion-blue-text)' : 'var(--notion-red-text)',
              fontSize: '11px',
              fontWeight: 600
            }}
          >
            {importStatus.text}
          </div>
        )}
      </div>

      {/* Compact Import Confirmation Modal */}
      {pendingImport && (
        <div 
          className="modal-overlay" 
          onClick={() => setPendingImport(null)}
          style={{ 
            animation: 'fadeIn 0.15s ease-out', 
            zIndex: 9999, 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '16px' 
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ 
              width: '100%',
              maxWidth: '280px', 
              padding: '18px 16px', 
              textAlign: 'center', 
              borderRadius: '12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'none',
              animation: 'slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Compact Icon */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'var(--bg-card-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 8px',
              border: '1px solid var(--border-subtle)'
            }}>
              <Upload size={16} color="var(--text-primary)" />
            </div>

            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px', lineHeight: 1.2 }}>
              Import Backup?
            </h3>

            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '0 0 10px' }}>
              Restore data from selected file
            </p>

            {/* Compact Info Row */}
            <div style={{
              background: 'var(--bg-card-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 10px',
              marginBottom: '10px',
              textAlign: 'left',
              fontSize: '11px',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Transactions</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{pendingImport.txCount} records</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Pocket Money</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{pendingImport.currencySymbol}{pendingImport.allowance}</span>
              </div>
            </div>

            <p style={{ fontSize: '10px', color: 'var(--notion-orange-text)', fontWeight: 600, margin: '0 0 12px' }}>
              ⚠️ This will replace current local data
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '6px' }}>
              <button 
                type="button"
                onClick={() => setPendingImport(null)}
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, padding: '8px', fontSize: '12px', fontWeight: 600 }}
              >
                Cancel
              </button>

              <button 
                type="button"
                onClick={handleConfirmImport}
                className="btn btn-primary btn-sm"
                style={{
                  flex: 1.2,
                  padding: '8px',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <CheckCircle2 size={13} /> Import Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
