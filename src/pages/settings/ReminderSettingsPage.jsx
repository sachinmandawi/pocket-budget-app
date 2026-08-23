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
        try {
          await LocalNotifications.createChannel({
            id: 'daily-reminder',
            name: 'Daily Reminders',
            description: 'Daily expense logging reminders',
            importance: 4,
            visibility: 1,
            vibration: true
          });
        } catch (channelErr) {}

        await LocalNotifications.schedule({
          notifications: [
            {
              title: 'Pocket Budget Evening Reminder 🔔',
              body: 'Did you log today\'s expenses? Tap to record your spends now!',
              id: 101,
              channelId: 'daily-reminder',
              autoCancel: true,
              schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true }
            }
          ]
        });
      }
    } catch (e) {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pocket Budget Evening Reminder 🔔', {
          body: 'Did you log today\'s expenses? Tap to record your spends now!',
          icon: '/app-icon.png'
        });
      } else if ('Notification' in window && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('Pocket Budget Evening Reminder 🔔', {
              body: 'Did you log today\'s expenses? Tap to record your spends now!',
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
      <form onSubmit={handleSubmit} className="notion-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Bell size={15} color="var(--notion-green-text)" />
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Daily Spend Reminder
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: 0 }}>
              Evening notification to log your daily expenses
            </p>
          </div>
        </div>

        {/* Toggle Enable/Disable */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 14px',
          background: 'var(--bg-card-subtle)',
          borderRadius: 'var(--radius-sm)',
          marginBottom: '14px',
          border: '1px solid var(--border-subtle)'
        }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', display: 'block' }}>
              Enable Daily Alert
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              Reminds you every evening
            </span>
          </div>

          <button
            type="button"
            onClick={() => setEnabled(!enabled)}
            style={{
              width: '46px',
              height: '26px',
              borderRadius: '13px',
              background: enabled ? 'var(--notion-green-text)' : 'var(--border-medium)',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background 0.2s ease'
            }}
          >
            <div style={{
              width: '22px',
              height: '22px',
              borderRadius: '50%',
              background: '#ffffff',
              position: 'absolute',
              top: '2px',
              left: enabled ? '22px' : '2px',
              transition: 'left 0.2s ease',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
            }} />
          </button>
        </div>

        {/* Preset Time Chips & Custom Stepper */}
        {enabled && (
          <div className="form-group" style={{ marginBottom: '16px', animation: 'fadeIn 0.15s ease-out' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <Clock size={13} color="var(--text-secondary)" /> Quick Evening Time Slots
            </label>

            {/* 4 Preset Time Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
              {presetTimes.map(pt => (
                <button
                  key={pt.id}
                  type="button"
                  onClick={() => setTime(pt.id)}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: time === pt.id ? '2px solid var(--text-primary)' : '1px solid var(--border-subtle)',
                    background: time === pt.id ? 'var(--bg-card-subtle)' : 'transparent',
                    color: time === pt.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: time === pt.id ? 600 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.1s ease'
                  }}
                >
                  {pt.label}
                </button>
              ))}
            </div>

            {/* Custom Interactive Time Stepper */}
            <div style={{
              background: 'var(--bg-card-subtle)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}>
              <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
                Custom Time
              </span>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Hours Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleHourChange(-1)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '30px', height: '30px', padding: 0 }}
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', width: '28px', textAlign: 'center' }}>
                    {display12Formatted}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleHourChange(1)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '30px', height: '30px', padding: 0 }}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                <span style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-secondary)' }}>:</span>

                {/* Minutes Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleMinChange(-15)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '30px', height: '30px', padding: 0 }}
                  >
                    <Minus size={13} />
                  </button>
                  <span style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', width: '28px', textAlign: 'center' }}>
                    {displayMinFormatted}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleMinChange(15)}
                    className="btn btn-secondary btn-sm"
                    style={{ width: '30px', height: '30px', padding: 0 }}
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* AM / PM Toggle */}
                <button
                  type="button"
                  onClick={() => handleHourChange(12)}
                  className="notion-tag notion-tag-gray"
                  style={{
                    padding: '5px 10px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none'
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
          style={{ width: '100%', padding: '10px', marginBottom: '12px', fontSize: '12px' }}
        >
          {testSent ? <CheckCircle2 size={14} color="var(--notion-green-text)" /> : <Bell size={14} />}
          {testSent ? 'Test Alert Triggered!' : 'Send Test Notification'}
        </button>

        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '13px' }}>
          <Save size={15} /> Save Reminder Settings
        </button>
      </form>
    </div>
  );
}
