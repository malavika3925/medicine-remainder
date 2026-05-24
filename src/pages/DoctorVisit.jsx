import { useState } from 'react'
import { Link } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { getDoctorVisits, setDoctorVisits, getMonthKey, isDoctorVisitWindow } from '../utils/storage'
import './DoctorVisit.css'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

export default function DoctorVisit() {
  const now = new Date()
  const monthKey = getMonthKey(now)
  const [visits, setVisitsState] = useState(getDoctorVisits())
  const currentVisit = visits[monthKey] || { completed: false, completedDate: null }
  const inWindow = isDoctorVisitWindow(now)
  const monthName = MONTH_NAMES[now.getMonth()]
  const year = now.getFullYear()

  function handleToggleComplete() {
    const updated = {
      ...visits,
      [monthKey]: {
        completed: !currentVisit.completed,
        completedDate: !currentVisit.completed ? new Date().toISOString() : null
      }
    }
    setVisitsState(updated)
    setDoctorVisits(updated)
  }

  const recentMonths = []
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = getMonthKey(d)
    recentMonths.push({
      key,
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
      visit: visits[key]
    })
  }

  return (
    <div className="page doctor-page">
      <header className="page-header">
        <Link to="/dashboard" className="back-link">← Back</Link>
        <h1>Doctor Visit</h1>
      </header>

      <div className="doctor-content">
        <div className="doctor-card main-card">
          <div className="doctor-card-icon">🏥</div>
          <h2>{monthName} {year}</h2>
          <p className="doctor-window">
            Monthly check-up window: <strong>7th – 15th</strong>
          </p>

          {inWindow && !currentVisit.completed && (
            <div className="doctor-alert">
              Your doctor visit is due this month. Please schedule your check-up!
            </div>
          )}

          {currentVisit.completed && (
            <div className="doctor-success">
              ✓ Visit completed
              {currentVisit.completedDate && (
                <span> on {new Date(currentVisit.completedDate).toLocaleDateString()}</span>
              )}
            </div>
          )}

          <label className={`visit-checkbox ${currentVisit.completed ? 'checked' : ''}`}>
            <input
              type="checkbox"
              checked={currentVisit.completed}
              onChange={handleToggleComplete}
            />
            <span className="visit-checkbox-box">
              {currentVisit.completed ? '✓' : ''}
            </span>
            <span className="visit-checkbox-label">
              I have completed my doctor visit this month
            </span>
          </label>
        </div>

        <section className="visit-history">
          <h3>Visit History</h3>
          <div className="history-list">
            {recentMonths.map(({ key, label, visit }) => (
              <div key={key} className={`history-item ${visit?.completed ? 'completed' : ''}`}>
                <span className="history-month">{label}</span>
                <span className="history-status">
                  {visit?.completed ? '✓ Completed' : key === monthKey && inWindow ? 'Due now' : '—'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}
