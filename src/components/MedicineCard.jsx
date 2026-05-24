import { formatTime, getTodayKey } from '../utils/storage'
import './MedicineCard.css'

export default function MedicineCard({ medicine, onToggleTaken }) {
  const today = getTodayKey()
  const takenTimes = medicine.takenLog?.[today] || []

  return (
    <div className={`medicine-card ${medicine.enabled ? '' : 'disabled'}`}>
      <div className="medicine-card-header">
        <div className="medicine-icon">💊</div>
        <div className="medicine-info">
          <h3>{medicine.name}</h3>
          <p className="medicine-dosage">{medicine.dosage}</p>
          {medicine.notes && <p className="medicine-notes">{medicine.notes}</p>}
        </div>
      </div>

      <div className="medicine-times">
        {medicine.times.map((time) => {
          const isTaken = takenTimes.includes(time)
          return (
            <label key={time} className={`time-slot ${isTaken ? 'taken' : ''}`}>
              <input
                type="checkbox"
                checked={isTaken}
                onChange={() => onToggleTaken(medicine.id, time)}
                className="time-checkbox"
              />
              <span className="time-checkbox-custom">
                {isTaken ? '✓' : ''}
              </span>
              <span className="time-label">{formatTime(time)}</span>
              <span className="time-status">{isTaken ? 'Taken' : 'Mark as taken'}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
