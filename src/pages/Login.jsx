import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUser, setUser, setLoggedIn } from '../utils/storage'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()
  const existingUser = getUser()
  const [name, setName] = useState(existingUser?.name || '')
  const [phone, setPhone] = useState(existingUser?.phone || '')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter your name')
      return
    }
    setUser({
      name: name.trim(),
      phone: phone.trim(),
      joinedAt: existingUser?.joinedAt || new Date().toISOString()
    })
    setLoggedIn(true)
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <svg viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="24" r="22" fill="#d8f3dc"/>
              <rect x="21" y="12" width="6" height="24" rx="3" fill="#2d6a4f"/>
              <rect x="12" y="21" width="24" height="6" rx="3" fill="#2d6a4f"/>
            </svg>
          </div>
          <h1>Welcome</h1>
          <p>Sign in to manage your medicines</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number (optional)</label>
            <input
              id="phone"
              type="tel"
              placeholder="Your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>

          {error && <p className="form-error">{error}</p>}

          <button type="submit" className="btn btn-primary btn-full">
            Continue
          </button>
        </form>
      </div>
    </div>
  )
}
