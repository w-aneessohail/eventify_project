// src/pages/Logout.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Logout() {
  const nav = useNavigate()
  useEffect(() => {
    // clear auth tokens / user info
    localStorage.removeItem('authToken')
    // redirect to login or homepage
    nav('/login', { replace: true })
  }, [])
  return <div className="p-6">Logging out...</div>
}
