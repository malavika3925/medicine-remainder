import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import MedicineCard from '../components/MedicineCard'
import NotificationBanner from '../components/NotificationBanner'
import { getUser, getMedicines, setMedicines, getTodayKey, isDoctorVisitWindow } from '../utils/storage'
import './Dashboard.css'

export default function Dashboard() {
  const user = getUser()
  const [medicines, setMedicinesState] = useState(getMedicines())
  const today = getTodayKey()
  const showDoctorReminder = isDoctorVisitWindow()

  useEffect(() => {
    setMedicines(medicines)
  }, [medicines])

  function handleToggleTaken(medicineId, time) {
    setMedicinesState((prev) => {
      const updated = prev.map((med) => {
        if (med.id !== medicineId) return med
        const takenLog = { ...med.takenLog }
        const todayTaken = [...(takenLog[today] || [])]
        const idx = todayTaken.indexOf(time)
        if (idx >= 0) {
          todayTaken.splice(idx, 1)
        } else {
          todayTaken.push(time)
        }
        takenLog[today] = todayTaken
        return { ...med, takenLog }
      })
      setMedicines(updated)
      return updated
    })
  }

  const totalDoses = medicines.reduce((sum, m) => sum + m.times.length, 0)
  const takenDoses = medicines.reduce((sum, m) => {
    const taken = m.takenLog?.[today] || []
    return sum + taken.length
  }, 0)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 17) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="page dashboard-page">
      <header className="dashboard-header">
        <div className="profile-section">
          <div className="profile-avatar">
            {user?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="profile-details">
            <p className="profile-greeting">{greeting()}</p>
            <h1>{user?.name || 'User'}</h1>
          </div>
        </div>
      </header>

      <NotificationBanner />

      {showDoctorReminder && (
        <Link to="/doctor-visit" className="doctor-banner">
          <span className="doctor-banner-icon">🏥</span>
          <div>
            <strong>Doctor visit due</strong>
            <p>Monthly check-up between 7th–15th — tap to mark complete</p>
          </div>
          <span className="doctor-banner-arrow">→</span>
        </Link>
      )}

      <section className="progress-section">
        <div className="progress-card">
          <div className="progress-info">
            <span className="progress-label">Today's Progress</span>
            <span className="progress-count">{takenDoses}/{totalDoses} doses taken</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: totalDoses ? `${(takenDoses / totalDoses) * 100}%` : '0%' }}
            />
          </div>
        </div>
      </section>

      <section className="medicines-section">
        <div className="section-header">
          <h2>Your Tablets</h2>
          <Link to="/add-medicine" className="add-link">+ Add</Link>
        </div>

        {medicines.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">💊</span>
            <p>No medicines added yet</p>
            <Link to="/add-medicine" className="btn btn-primary">Add your first tablet</Link>
          </div>
        ) : (
          <div className="medicines-list">
            {medicines.map((med) => (
              <MedicineCard
                key={med.id}
                medicine={med}
                onToggleTaken={handleToggleTaken}
              />
            ))}
          </div>
        )}
      </section>

      <BottomNav />
    </div>
  )
}
