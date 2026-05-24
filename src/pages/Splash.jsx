import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { isLoggedIn } from '../utils/storage'
import './Splash.css'

export default function Splash() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoggedIn()) {
        navigate('/dashboard', { replace: true })
      } else {
        navigate('/login', { replace: true })
      }
    }, 2500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="splash">
      <div className="splash-content">
        <div className="splash-logo">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="55" fill="white" opacity="0.15"/>
            <circle cx="60" cy="60" r="40" fill="white"/>
            <rect x="54" y="30" width="12" height="60" rx="6" fill="#2d6a4f"/>
            <rect x="30" y="54" width="60" height="12" rx="6" fill="#2d6a4f"/>
          </svg>
        </div>
        <h1 className="splash-title">Medicine Reminder</h1>
        <p className="splash-subtitle">Your health companion</p>
        <div className="splash-loader">
          <div className="splash-loader-bar"></div>
        </div>
      </div>
    </div>
  )
}
