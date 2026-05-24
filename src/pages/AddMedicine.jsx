import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import { getMedicines, setMedicines, generateId } from '../utils/storage'
import './AddMedicine.css'

const PRESET_TIMES = ['06:00', '08:00', '12:00', '14:00', '18:00', '20:00', '22:00']

export default function AddMedicine() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [dosage, setDosage] = useState('')
  const [notes, setNotes] = useState('')
  const [selectedTimes, setSelectedTimes] = useState([])
  const [customTime, setCustomTime] = useState('')
  const [error, setError] = useState('')

  function toggleTime(time) {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time].sort()
    )
  }

  function addCustomTime() {
    if (customTime && !selectedTimes.includes(customTime)) {
      setSelectedTimes((prev) => [...prev, customTime].sort())
      setCustomTime('')
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter medicine name')
      return
    }
    if (!dosage.trim()) {
      setError('Please enter dosage')
      return
    }
    if (selectedTimes.length === 0) {
      setError('Please select at least one reminder time')
      return
    }

    const medicines = getMedicines()
    const newMedicine = {
      id: generateId(),
      name: name.trim(),
      dosage: dosage.trim(),
      notes: notes.trim(),
      times: selectedTimes,
      enabled: true,
      takenLog: {},
      createdAt: new Date().toISOString()
    }
    setMedicines([...medicines, newMedicine])
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="page add-page">
      <header className="page-header">
        <button type="button" className="back-link" onClick={() => navigate(-1)}>← Back</button>
        <h1>Add Tablet</h1>
      </header>

      <form onSubmit={handleSubmit} className="add-form">
        <div className="form-group">
          <label htmlFor="med-name">Medicine Name</label>
          <input
            id="med-name"
            type="text"
            placeholder="e.g. Metformin, Aspirin"
            value={name}
            onChange={(e) => { setName(e.target.value); setError('') }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="med-dosage">Dosage</label>
          <input
            id="med-dosage"
            type="text"
            placeholder="e.g. 1 tablet, 500mg"
            value={dosage}
            onChange={(e) => { setDosage(e.target.value); setError('') }}
          />
        </div>

        <div className="form-group">
          <label htmlFor="med-notes">Notes (optional)</label>
          <input
            id="med-notes"
            type="text"
            placeholder="e.g. Take after food"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Reminder Times</label>
          <div className="time-grid">
            {PRESET_TIMES.map((time) => (
              <button
                key={time}
                type="button"
                className={`time-chip ${selectedTimes.includes(time) ? 'selected' : ''}`}
                onClick={() => toggleTime(time)}
              >
                {formatChipTime(time)}
              </button>
            ))}
          </div>

          <div className="custom-time-row">
            <input
              type="time"
              value={customTime}
              onChange={(e) => setCustomTime(e.target.value)}
            />
            <button type="button" className="btn btn-secondary" onClick={addCustomTime}>
              Add time
            </button>
          </div>

          {selectedTimes.length > 0 && (
            <div className="selected-times">
              Selected: {selectedTimes.map(formatChipTime).join(', ')}
            </div>
          )}
        </div>

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="btn btn-primary btn-full">
          Save Tablet
        </button>
      </form>

      <BottomNav />
    </div>
  )
}

function formatChipTime(time) {
  const [h, m] = time.split(':')
  const hour = parseInt(h, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${m} ${ampm}`
}
