import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login.jsx'
import Signup from './components/Signup.jsx'
import Dashboard from './components/Dashboard.jsx'
import VideoUpload from './components/VideoUpload.jsx'
import YouTubeAnalytics from './components/YouTubeAnalytics.jsx'
import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setUser(decoded)
      } catch (error) {
        localStorage.removeItem('token')
      }
    }
  }, [])

  const ProtectedRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" />
  }

  return (
    <Routes>
      <Route path="/login" element={<Login setUser={setUser} />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/video-upload" element={<ProtectedRoute><VideoUpload /></ProtectedRoute>} />
      <Route path="/youtube-analytics" element={<ProtectedRoute><YouTubeAnalytics /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  )
}

export default App