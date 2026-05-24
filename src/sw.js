import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching'

cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)

const DB_NAME = 'MedReminderDB'
const DB_VERSION = 1
const STORE = 'reminderData'

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (event) => {
      event.target.result.createObjectStore(STORE, { keyPath: 'key' })
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getValue(key, fallback = null) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const req = tx.objectStore(STORE).get(key)
    req.onsuccess = () => resolve(req.result?.value ?? fallback)
    req.onerror = () => reject(req.error)
  })
}

async function putValue(key, value) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put({ key, value })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function getCurrentTimeString() {
  const now = new Date()
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
}

function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function checkReminders() {
  try {
    const [medicines, settings, doctorVisits, notifiedToday] = await Promise.all([
      getValue('medicines', []),
      getValue('settings', { notificationsEnabled: false }),
      getValue('doctorVisits', {}),
      getValue('notifiedToday', [])
    ])

    if (!settings.notificationsEnabled) return

    const currentTime = getCurrentTimeString()
    const today = getTodayKey()
    const notified = new Set(notifiedToday || [])
    let changed = false

    for (const med of medicines) {
      if (!med.enabled) continue
      for (const time of med.times) {
        const notifyKey = `${today}-${med.id}-${time}`
        if (time === currentTime && !notified.has(notifyKey)) {
          const taken = med.takenLog?.[today]?.includes(time)
          if (!taken) {
            await self.registration.showNotification('Time for your medicine!', {
              body: `Please take ${med.name} (${med.dosage}) now.`,
              tag: notifyKey,
              icon: '/favicon.svg',
              badge: '/favicon.svg',
              vibrate: [200, 100, 200, 100, 200],
              requireInteraction: true,
              silent: false,
              data: { url: '/dashboard' }
            })
            notified.add(notifyKey)
            changed = true
          }
        }
      }
    }

    const now = new Date()
    const day = now.getDate()
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    if (day >= 7 && day <= 15 && day === 7) {
      const doctorKey = `doctor-${monthKey}`
      if (!doctorVisits[monthKey]?.completed && !notified.has(doctorKey)) {
        await self.registration.showNotification('Doctor visit reminder', {
          body: 'Your monthly check-up is due between the 7th and 15th. Please schedule your visit.',
          tag: doctorKey,
          icon: '/favicon.svg',
          requireInteraction: true,
          data: { url: '/doctor-visit' }
        })
        notified.add(doctorKey)
        changed = true
      }
    }

    const cleaned = [...notified].filter((key) => {
      if (key.startsWith('doctor-')) return true
      return key.startsWith(today)
    })

    if (changed || cleaned.length !== notified.size) {
      await putValue('notifiedToday', cleaned)
    }
  } catch (err) {
    console.error('Reminder check failed:', err)
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = event.notification.data?.url || '/dashboard'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl)
      }
    })
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'CHECK_NOW') {
    checkReminders()
  }
})

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
  checkReminders()
})

let checkInterval = null

function startReminderLoop() {
  if (checkInterval) clearInterval(checkInterval)
  checkReminders()
  checkInterval = setInterval(checkReminders, 60000)
}

startReminderLoop()
