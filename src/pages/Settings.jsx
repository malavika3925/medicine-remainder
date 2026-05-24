import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { getSettings, setSettings, setLoggedIn } from '../utils/storage'
import {
  requestNotificationPermission,
  sendTestNotification,
  getNotificationStatus,
  areNotificationsReady
} from '../utils/notifications'
import './Settings.css'

export default function Settings() {
  const navigate = useNavigate()
  const [settings, setSettingsState] = useState(getSettings())
  const [notifStatus, setNotifStatus] = useState(getNotificationStatus())
  const [testResult, setTestResult] = useState('')

  async function handleToggleNotifications() {
    if (!settings.notificationsEnabled) {
      const permission = await requestNotificationPermission()
      setNotifStatus(permission)
      if (permission === 'granted') {
        const updated = { ...settings, notificationsEnabled: true }
        setSettingsState(updated)
        setSettings(updated)
      }
    } else {
      const updated = { ...settings, notificationsEnabled: false }
      setSettingsState(updated)
      setSettings(updated)
    }
  }

  function handleToggleSound() {
    const updated = { ...settings, soundEnabled: !settings.soundEnabled }
    setSettingsState(updated)
    setSettings(updated)
  }

  async function handleTestNotification() {
    setTestResult('')
    if (notifStatus !== 'granted') {
      const permission = await requestNotificationPermission()
      setNotifStatus(permission)
      if (permission !== 'granted') {
        setTestResult('Please allow notifications first.')
        return
      }
      const updated = { ...settings, notificationsEnabled: true }
      setSettingsState(updated)
      setSettings(updated)
    }
    const sent = await sendTestNotification()
    setTestResult(sent ? 'Test notification sent! Check your phone or computer.' : 'Could not send notification.')
  }

  function handleLogout() {
    setLoggedIn(false)
    navigate('/login', { replace: true })
  }

  const remindersActive = areNotificationsReady(settings)

  return (
    <div className="page settings-page">
      <header className="page-header">
        <h1>Settings</h1>
      </header>

      <div className="settings-content">
        <section className={`settings-section status-card ${remindersActive ? 'active' : ''}`}>
          <div className="status-row">
            <span className="status-icon">{remindersActive ? '✅' : '🔔'}</span>
            <div>
              <strong>{remindersActive ? 'Reminders are ON' : 'Reminders are OFF'}</strong>
              <p>{remindersActive ? 'You will be notified at tablet times' : 'Turn on below to get tablet alerts'}</p>
            </div>
          </div>
        </section>

        <section className="settings-section">
          <h2>Notifications</h2>
          <p className="settings-desc">
            Works in Chrome on phone or computer. Keep Chrome running in the background for best results.
          </p>

          <label className="setting-toggle">
            <div>
              <span className="setting-label">Medicine Reminders</span>
              <span className="setting-hint">
                {notifStatus === 'denied'
                  ? 'Blocked — tap the lock icon in Chrome → Site settings → Allow notifications'
                  : notifStatus === 'unsupported'
                  ? 'Not supported on this browser'
                  : 'Alert you at each tablet time'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.notificationsEnabled}
              onChange={handleToggleNotifications}
              disabled={notifStatus === 'denied' || notifStatus === 'unsupported'}
            />
            <span className="toggle-slider" />
          </label>

          <label className="setting-toggle">
            <div>
              <span className="setting-label">Notification Sound</span>
              <span className="setting-hint">Play sound with reminders</span>
            </div>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={handleToggleSound}
            />
            <span className="toggle-slider" />
          </label>

          <button type="button" className="btn btn-secondary btn-full test-notif-btn" onClick={handleTestNotification}>
            Send test notification
          </button>
          {testResult && <p className="test-result">{testResult}</p>}
        </section>

        <section className="settings-section info-section">
          <h2>Setup for your mom (Chrome)</h2>
          <ol className="setup-steps">
            <li>Open this app in <strong>Google Chrome</strong></li>
            <li>Turn on <strong>Medicine Reminders</strong> above and tap <strong>Allow</strong></li>
            <li>Tap <strong>Send test notification</strong> to confirm it works</li>
            <li>Add tablets with reminder times on the Add screen</li>
            <li>Optional: Menu (⋮) → <strong>Install app</strong> or <strong>Add to Home screen</strong></li>
          </ol>
        </section>

        <button type="button" className="btn btn-danger btn-full" onClick={handleLogout}>
          Log Out
        </button>
      </div>

      <BottomNav />
    </div>
  )
}
