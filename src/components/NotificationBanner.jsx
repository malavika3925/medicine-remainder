import { useState } from 'react'
import { Link } from 'react-router-dom'
import { getSettings, setSettings } from '../utils/storage'
import { requestNotificationPermission } from '../utils/notifications'
import './NotificationBanner.css'

export default function NotificationBanner() {
  const [settings, setSettingsState] = useState(getSettings())
  const [status, setStatus] = useState(
    'Notification' in window ? Notification.permission : 'unsupported'
  )
  const [loading, setLoading] = useState(false)
  const [dismissed, setDismissed] = useState(
    sessionStorage.getItem('notifBannerDismissed') === 'true'
  )

  if (dismissed || status === 'unsupported') return null
  if (settings.notificationsEnabled && status === 'granted') return null

  async function handleEnable() {
    setLoading(true)
    const permission = await requestNotificationPermission()
    setStatus(permission)
    if (permission === 'granted') {
      const updated = { ...settings, notificationsEnabled: true }
      setSettingsState(updated)
      setSettings(updated)
    }
    setLoading(false)
  }

  function handleDismiss() {
    sessionStorage.setItem('notifBannerDismissed', 'true')
    setDismissed(true)
  }

  if (status === 'denied') {
    return (
      <div className="notif-banner denied">
        <span className="notif-banner-icon">🔔</span>
        <div className="notif-banner-text">
          <strong>Notifications are blocked</strong>
          <p>Turn them on in Chrome: Site settings → Notifications → Allow</p>
        </div>
        <Link to="/settings" className="notif-banner-btn">Help</Link>
      </div>
    )
  }

  return (
    <div className="notif-banner">
      <span className="notif-banner-icon">🔔</span>
      <div className="notif-banner-text">
        <strong>Turn on tablet reminders</strong>
        <p>Get notified on your phone when it's time to take medicine</p>
      </div>
      <button
        type="button"
        className="notif-banner-btn primary"
        onClick={handleEnable}
        disabled={loading}
      >
        {loading ? '...' : 'Enable'}
      </button>
      <button type="button" className="notif-banner-close" onClick={handleDismiss} aria-label="Dismiss">
        ×
      </button>
    </div>
  )
}
