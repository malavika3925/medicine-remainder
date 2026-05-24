import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Splash from './pages/Splash'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import DoctorVisit from './pages/DoctorVisit'
import Settings from './pages/Settings'
import AddMedicine from './pages/AddMedicine'
import { isLoggedIn, syncAllReminderData } from './utils/storage'
import { startReminderChecker, checkDoctorVisitReminder } from './utils/notifications'
import { getMedicines, getSettings, getDoctorVisits } from './utils/storage'

function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    syncAllReminderData()
    startReminderChecker(getMedicines, getSettings)
    checkDoctorVisitReminder(getDoctorVisits, getSettings)

    const doctorCheck = setInterval(() => {
      checkDoctorVisitReminder(getDoctorVisits, getSettings)
    }, 3600000)

    setReady(true)
    return () => clearInterval(doctorCheck)
  }, [])

  if (!ready) return null

  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/dashboard"
        element={isLoggedIn() ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/doctor-visit"
        element={isLoggedIn() ? <DoctorVisit /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/settings"
        element={isLoggedIn() ? <Settings /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/add-medicine"
        element={isLoggedIn() ? <AddMedicine /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
