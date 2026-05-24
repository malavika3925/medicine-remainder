import {
  syncReminderData,
  notifyServiceWorkerCheckNow
} from './reminderDb'

const STORAGE_KEYS = {
  user: 'medReminder_user',
  medicines: 'medReminder_medicines',
  doctorVisits: 'medReminder_doctorVisits',
  settings: 'medReminder_settings',
  loggedIn: 'medReminder_loggedIn'
}

export function load(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

async function syncToServiceWorker() {
  try {
    await syncReminderData({
      medicines: getMedicines(),
      settings: getSettings(),
      doctorVisits: getDoctorVisits()
    })
    await notifyServiceWorkerCheckNow()
  } catch {
    // IndexedDB or SW may not be ready yet
  }
}

export function getUser() {
  return load(STORAGE_KEYS.user)
}

export function setUser(user) {
  save(STORAGE_KEYS.user, user)
}

export function isLoggedIn() {
  return load(STORAGE_KEYS.loggedIn, false) === true
}

export function setLoggedIn(value) {
  save(STORAGE_KEYS.loggedIn, value)
}

export function getMedicines() {
  return load(STORAGE_KEYS.medicines, [])
}

export function setMedicines(medicines) {
  save(STORAGE_KEYS.medicines, medicines)
  syncToServiceWorker()
}

export function getDoctorVisits() {
  return load(STORAGE_KEYS.doctorVisits, {})
}

export function setDoctorVisits(visits) {
  save(STORAGE_KEYS.doctorVisits, visits)
  syncToServiceWorker()
}

export function getSettings() {
  return load(STORAGE_KEYS.settings, {
    notificationsEnabled: false,
    soundEnabled: true
  })
}

export function setSettings(settings) {
  save(STORAGE_KEYS.settings, settings)
  syncToServiceWorker()
}

export async function syncAllReminderData() {
  await syncToServiceWorker()
}

export function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

export function isDoctorVisitWindow(date = new Date()) {
  const day = date.getDate()
  return day >= 7 && day <= 15
}

export function formatTime(time) {
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours, 10)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${minutes} ${ampm}`
}

export function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export { STORAGE_KEYS }
