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

/**
 * Root entry.
 * In the single-file / preview build we ALWAYS open into the onboarding flow so
 * the demo starts with the logo animation + questions every time it's opened —
 * even if a previous run already stored the "onboarded" flag. In a normal
 * deployed build, returning users see the landing page and only first-run users
 * are sent to onboarding.
 */
const PREVIEW_BUILD = import.meta.env.VITE_HASH_ROUTER === 'true'
function RootEntry() {
  if (PREVIEW_BUILD) return <Navigate to="/onboarding" replace />
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
import Learn from './pages/Learn'
import Impact from './pages/Impact'
import Settings from './pages/Settings'
import Timeline from './pages/Timeline'

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
      <Route path="/guide" element={<Learn />} />
      <Route path="/readiness" element={<Guide />} />
      <Route path="/impact" element={<Impact />} />
      <Route path="/timeline" element={<Timeline />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}
