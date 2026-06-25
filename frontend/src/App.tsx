import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import { MenuBar } from './components/MenuBar'
import { Footer } from './components/Footer'
import { Starfield } from './components/Starfield'
import { NavigationOverlay } from './components/NavigationOverlay'
import { ContactPopup } from './components/ContactPopup'
import { ScrollToTop } from './components/ScrollToTop'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Register from './pages/Register'
import Login from './pages/login'
import Logout from './pages/logout'
import UserMgr from './pages/UserMgr'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import Invite from './pages/Invite'
import Verify from './pages/Verify'
import Profile from './pages/Profile'
import ResetPassword from './pages/ResetPassword'
 

function App() {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isContactOpen, setIsContactOpen] = useState(false)

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Starfield />
          <MenuBar onMenuClick={() => setIsNavOpen(true)} />
          <Routes>
            <Route path="/" element={<Home onContactClick={() => setIsContactOpen(true)} />} />
            <Route path="/home" element={<Home   />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register/:token" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password/:token?" element={<ResetPassword />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/usermgr" element={<UserMgr />} />
            <Route path="/term" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/invite" element={<Invite />} />
            <Route path="/verify/:token" element={<Verify />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
          <Footer onContactClick={() => setIsContactOpen(true)} />
          <NavigationOverlay 
            isOpen={isNavOpen} 
            onClose={() => setIsNavOpen(false)} 
          />
          <ContactPopup 
            isOpen={isContactOpen} 
            onClose={() => setIsContactOpen(false)} 
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
