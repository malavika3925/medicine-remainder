import { notifyServiceWorkerCheckNow } from './reminderDb'

let checkInterval = null
let notifiedToday = new Set()

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return 'unsupported'
  }
  if (Notification.permission === 'granted') {
    return 'granted'
  }
  if (Notification.permission === 'denied') {
    return 'denied'
  }
  const result = await Notification.requestPermission()
  return result
}

export async function showNotification(title, body, tag, url = '/dashboard') {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false
  }

  const options = {
    body,
    tag,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200, 100, 200],
    requireInteraction: true,
    silent: false,
    data: { url }
  }

  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.ready
    await registration.showNotification(title, options)
  } else {
    new Notification(title, options)
  }
  return true
}

export async function sendTestNotification() {
  return showNotification(
    'Medicine Reminder is working!',
    'You will get alerts like this when it is time to take your tablets.',
    'test-notification'
  )
}

function getCurrentTimeString() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function runReminderCheck(getMedicines, getSettings) {
  const settings = getSettings()
  if (!settings.notificationsEnabled) return

  const medicines = getMedicines()
  const currentTime = getCurrentTimeString()
  const today = getTodayKey()

  medicines.forEach((med) => {
    if (!med.enabled) return
    med.times.forEach((time) => {
      const notifyKey = `${today}-${med.id}-${time}`
      if (time === currentTime && !notifiedToday.has(notifyKey)) {
        const taken = med.takenLog?.[today]?.includes(time)
        if (!taken) {
          showNotification(
            'Time for your medicine!',
            `Please take ${med.name} (${med.dosage}) now.`,
            notifyKey
          )
          notifiedToday.add(notifyKey)
        }
      }
    })
  })
}

export function startReminderChecker(getMedicines, getSettings) {
  stopReminderChecker()

  runReminderCheck(getMedicines, getSettings)
  notifyServiceWorkerCheckNow()

  checkInterval = setInterval(() => {
    runReminderCheck(getMedicines, getSettings)
  }, 15000)

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      runReminderCheck(getMedicines, getSettings)
      notifyServiceWorkerCheckNow()
    }
  })
}

export function stopReminderChecker() {
  if (checkInterval) {
    clearInterval(checkInterval)
    checkInterval = null
  }
}

export function resetDailyNotifications() {
  const today = getTodayKey()
  notifiedToday = new Set(
    [...notifiedToday].filter((key) => key.startsWith(today))
  )
}

export function checkDoctorVisitReminder(getDoctorVisits, getSettings) {
  const settings = getSettings()
  if (!settings.notificationsEnabled) return

  const now = new Date()
  const day = now.getDate()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  if (day >= 7 && day <= 15) {
    const visits = getDoctorVisits()
    if (!visits[monthKey]?.completed) {
      const notifyKey = `doctor-${monthKey}`
      if (!notifiedToday.has(notifyKey) && day === 7) {
        showNotification(
          'Doctor visit reminder',
          'Your monthly check-up is due between the 7th and 15th. Please schedule your visit!',
          notifyKey,
          '/doctor-visit'
        )
        notifiedToday.add(notifyKey)
      }
    }
  }
}

export function getNotificationStatus() {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export function areNotificationsReady(settings) {
  return settings?.notificationsEnabled && getNotificationStatus() === 'granted'
}
