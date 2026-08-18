import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React App Error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    try {
      localStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          background: 'var(--bg-app)',
          color: 'var(--text-primary)'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--ios-red-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '26px',
            marginBottom: '16px'
          }}>
            ⚠️
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
            App Encountered an Issue
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', maxWidth: '320px' }}>
            {this.state.error?.message || 'An unexpected state occurred.'}
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={this.handleReload} className="btn btn-primary" style={{ padding: '10px 18px', fontSize: '13px' }}>
              Reload App
            </button>
            <button onClick={this.handleReset} className="btn btn-secondary" style={{ padding: '10px 14px', fontSize: '13px' }}>
              Reset Data
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
