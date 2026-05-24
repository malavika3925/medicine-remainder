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

async function putValue(key, value) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put({ key, value })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function syncReminderData({ medicines, settings, doctorVisits }) {
  await Promise.all([
    putValue('medicines', medicines),
    putValue('settings', settings),
    putValue('doctorVisits', doctorVisits)
  ])
}

export async function notifyServiceWorkerCheckNow() {
  if (!('serviceWorker' in navigator)) return
  const registration = await navigator.serviceWorker.ready
  if (registration.active) {
    registration.active.postMessage({ type: 'CHECK_NOW' })
  }
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null
  try {
    const { registerSW } = await import('virtual:pwa-register')
    return registerSW({
      immediate: true,
      onRegistered(registration) {
        if (registration) {
          registration.update()
        }
      }
    })
  } catch {
    return null
  }
}
