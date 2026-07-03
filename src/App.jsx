import { Routes, Route, Navigate } from 'react-router-dom'
import { isOnboarded } from './lib/i18n.jsx'
import Landing from './pages/Landing'
import Voice from './pages/Voice'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Legal from './pages/Legal'

/** First-run gate: send new users through onboarding before the app. */
function RequireOnboarding({ children }) {
  return isOnboarded() ? children : <Navigate to="/onboarding" replace />
}

/** Root: first-run users land in onboarding; returning users see the landing page. */
function RootEntry() {
  return isOnboarded() ? <Landing /> : <Navigate to="/onboarding" replace />
}
import Login from './pages/Login'
import Features from './pages/Features'
import HowItWorks from './pages/HowItWorks'
import Tracker from './pages/Tracker'
import Symptoms from './pages/Symptoms'
import Conditions from './pages/Conditions'
import Report from './pages/Report'
import Doctors from './pages/Doctors'
import Profile from './pages/Profile'
import Guide from './pages/Guide'
import Impact from './pages/Impact'
import Settings from './pages/Settings'
import Timeline from './pages/Timeline'
import Community from './pages/Community'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootEntry />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/terms" element={<Legal doc="terms" />} />
      <Route path="/privacy" element={<Legal doc="privacy" />} />
      <Route path="/home" element={<RequireOnboarding><Home /></RequireOnboarding>} />
      <Route path="/voice" element={<RequireOnboarding><Voice /></RequireOnboarding>} />
      <Route path="/login" element={<Login />} />
      <Route path="/features" element={<Features />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/tracker" element={<Tracker />} />
      <Route path="/symptoms" element={<Symptoms />} />
      <Route path="/conditions" element={<Conditions />} />
      <Route path="/report" element={<Report />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/guide" element={<Guide />} />
      <Route path="/impact" element={<Impact />} />
      <Route path="/timeline" element={<Timeline />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/community" element={<Community />} />
    </Routes>
  )
}
