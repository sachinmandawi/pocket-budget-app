import React, { useState } from 'react';
import { Bell, Save, CheckCircle2, Clock, Plus, Minus } from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';

export default function ReminderSettingsPage({ reminderSettings = { enabled: true, time: '20:00' }, onSaveReminder, onBack }) {
  const [enabled, setEnabled] = useState(reminderSettings.enabled !== undefined ? reminderSettings.enabled : true);
  const [time, setTime] = useState(reminderSettings.time || '20:00');
  const [testSent, setTestSent] = useState(false);

  // Parse HH:MM to hours and minutes
  const [hour24, minStr] = time.split(':');
  let currentHour = parseInt(hour24 || '20', 10);
  let currentMin = parseInt(minStr || '0', 10);

  const presetTimes = [
    { id: '19:00', label: '🌇 7:00 PM' },
    { id: '20:00', label: '🌙 8:00 PM' },
    { id: '21:00', label: '🌌 9:00 PM' },
    { id: '22:00', label: '🌃 10:00 PM' }
  ];

  const handleHourChange = (delta) => {
    let newH = (currentHour + delta + 24) % 24;
    const hFormatted = String(newH).padStart(2, '0');
    const mFormatted = String(currentMin).padStart(2, '0');
    setTime(`${hFormatted}:${mFormatted}`);
  };

  const handleMinChange = (delta) => {
    let newM = (currentMin + delta + 60) % 60;
    const hFormatted = String(currentHour).padStart(2, '0');
    const mFormatted = String(newM).padStart(2, '0');
    setTime(`${hFormatted}:${mFormatted}`);
  };

  // Convert 24h to 12h display
  const display12Hour = currentHour % 12 === 0 ? 12 : currentHour % 12;
  const isPm = currentHour >= 12;
  const display12Formatted = String(display12Hour).padStart(2, '0');
  const displayMinFormatted = String(currentMin).padStart(2, '0');

  const handleSubmit = async (e) => {
    e.preventDefault();
    onSaveReminder({ enabled, time });

    if (enabled) {
      try {
        await LocalNotifications.requestPermissions();
      } catch (err) {
        if ('Notification' in window) {
          Notification.requestPermission().catch(() => {});
        }
      }
    }
    onBack();
  };

  const handleTestNotification = async () => {
    setTestSent(true);

    try {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display === 'granted') {
        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'PocketBudget Evening Reminder 🔔',
              body: 'Aaj ka expense log kiya? Tap to record your spends today!',
              id: 101,
              schedule: { at: new Date(Date.now() + 1000) }
            }
          ]
        });
      }
    } catch (e) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('PocketBudget Evening Reminder 🔔', {
          body: 'Aaj ka expense log kiya? Tap to record your spends today!',
          icon: '/app-icon.png'
        });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('PocketBudget Evening Reminder 🔔', {
              body: 'Aaj ka expense log kiya? Tap to record your spends today!',
              icon: '/app-icon.png'
            });
          }
        });
      }
    }

    setTimeout(() => {
      setTestSent(false);
    }, 3000);
  };

  return (
    <div className="page-view" style={{ animation: 'fadeIn 0.2s ease-out' }}>
      <form onSubmit={handleSubmit} className="ios-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--ios-green-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={22} color="var(--ios-green)" />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Daily Spend Reminder
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
              Evening notification to log your daily expenses
            </p>
          </div>
        </div>

        {/* Toggle Enable/Disable Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          background: 'var(--bg-card-subtle)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>
              Enable Daily Alert
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              Reminds you every evening
            </span>
          </div>

          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            style={{
              width: '50px',
              height: '28px',
              borderRadius: '14px',
              background: enabled ? 'var(--ios-green)' : 'var(--border-medium)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s ease'
            }}
          >
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#ffffff',
              position: 'absolute',
              top: '2px',
              left: enabled ? '24px' : '2px',
              transition: 'left 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>

        {/* Preset Time Chip Cards & Pure Custom Stepper Card */}
        {enabled && (
          <div className="form-group" style={{ marginBottom: '18px', animation: 'fadeIn 0.15s ease-out' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
              <Clock size={15} color="var(--ios-blue)" /> Quick Evening Time Slots
            </label>

            {/* 4 Preset Time Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              {presetTimes.map(pt => (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setTime(pt.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: time === pt.id ? '2px solid var(--ios-blue)' : '1px solid var(--border-subtle)',
                    background: time === pt.id ? 'var(--ios-blue-bg)' : 'var(--bg-card-subtle)',
                    color: time === pt.id ? 'var(--ios-blue)' : 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {pt.label}
                </button>
              ))}
            </div>

            {/* Custom Interactive Time Stepper (Zero Browser Native Popups!) */}
            <div style={{
              background: 'var(--bg-card-subtle)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                Custom Time Control
              </span>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Hours Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleHourChange(-1)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '32px', height: '32px', padding: 0 }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', width: '28px', textAlign: 'center' }}>
                    {display12Formatted}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleHourChange(1)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '32px', height: '32px', padding: 0 }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ios-blue)' }}>:</span>

                {/* Minutes Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleMinChange(-15)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '32px', height: '32px', padding: 0 }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', width: '28px', textAlign: 'center' }}>
                    {displayMinFormatted}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMinChange(15)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '32px', height: '32px', padding: 0 }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* AM / PM Toggle Pill */}
                <button
                  type="button"
                  onClick={() => handleHourChange(12)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--ios-blue-bg)',
                    color: 'var(--ios-blue)',
                    fontSize: '13px',
                    fontWeight: 800,
                    border: '1px solid var(--ios-blue)',
                    cursor: 'pointer'
                  }}
                >
                  {isPm ? 'PM' : 'AM'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Test Notification Button */}
        <button
          type="button"
          onClick={handleTestNotification}
          className="btn btn-secondary"
          style={{ width: '100%', padding: '12px', marginBottom: '16px', fontSize: '13px' }}
        >
          {testSent ? <CheckCircle2 size={16} color="var(--ios-green)" /> : <Bell size={16} />}
          {testSent ? 'Test Alert Triggered!' : 'Send Test Notification'}
        </button>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '14px' }}>
          <Save size={16} /> Save Reminder Settings
        </button>
      </form>
    </div>
  );
}
