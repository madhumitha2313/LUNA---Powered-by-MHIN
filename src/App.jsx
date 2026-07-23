import { Routes, Route, Navigate } from 'react-router-dom'
import { isAuthenticated } from './lib/authStore'
import Landing from './pages/Landing'
import Voice from './pages/Voice'
import Home from './pages/Home'
import Onboarding from './pages/Onboarding'
import Legal from './pages/Legal'

/**
 * Protected-route gate. Every feature that holds personal health data requires
 * an authenticated session; unauthenticated visitors are sent to the welcome/
 * login screen and can never reach another user's data.
 */
function RequireOnboarding({ children }) {
  return isAuthenticated() ? children : <Navigate to="/welcome" replace />
}

/**
 * Root entry. Authenticated users land on their dashboard; everyone else starts
 * at the welcome screen (splash → welcome → login / sign up).
 */
function RootEntry() {
  return isAuthenticated() ? <Navigate to="/home" replace /> : <Navigate to="/welcome" replace />
}

import Login from './pages/Login'
import Welcome from './pages/Welcome'
import Signup from './pages/Signup'
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
import Cycle from './pages/Cycle'
import Journey from './pages/Journey'
import Mood from './pages/Mood'
import Nutrition from './pages/Nutrition'
import Mira from './pages/Mira'
import Planner from './pages/Planner'
import Safety from './pages/Safety'
import SosButton from './components/SosButton'
import DesignSystem from './pages/DesignSystem'
import Admin from './pages/Admin'
import Developers from './pages/Developers'
import Roadmap from './pages/Roadmap'
import DigitalTwin from './pages/DigitalTwin'
import Wearables from './pages/Wearables'
import Healthcare from './pages/Healthcare'
import Research from './pages/Research'
import Premium from './pages/Premium'
import Community from './pages/Community'
import Marketplace from './pages/Marketplace'
import Trust from './pages/Trust'
import Platform from './pages/Platform'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootEntry />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/terms" element={<Legal doc="terms" />} />
      <Route path="/privacy" element={<Legal doc="privacy" />} />
      <Route path="/home" element={<RequireOnboarding><Home /></RequireOnboarding>} />
      <Route path="/voice" element={<RequireOnboarding><Voice /></RequireOnboarding>} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
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
      <Route path="/cycle" element={<RequireOnboarding><Cycle /></RequireOnboarding>} />
      <Route path="/journey" element={<RequireOnboarding><Journey /></RequireOnboarding>} />
      <Route path="/mood" element={<RequireOnboarding><Mood /></RequireOnboarding>} />
      <Route path="/nutrition" element={<RequireOnboarding><Nutrition /></RequireOnboarding>} />
      <Route path="/mira" element={<RequireOnboarding><Mira /></RequireOnboarding>} />
      <Route path="/planner" element={<RequireOnboarding><Planner /></RequireOnboarding>} />
      <Route path="/safety" element={<RequireOnboarding><Safety /></RequireOnboarding>} />
      <Route path="/design" element={<DesignSystem />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/developers" element={<Developers />} />
      <Route path="/roadmap" element={<Roadmap />} />
      <Route path="/twin" element={<RequireOnboarding><DigitalTwin /></RequireOnboarding>} />
      <Route path="/wearables" element={<RequireOnboarding><Wearables /></RequireOnboarding>} />
      <Route path="/healthcare" element={<RequireOnboarding><Healthcare /></RequireOnboarding>} />
      <Route path="/research" element={<RequireOnboarding><Research /></RequireOnboarding>} />
      <Route path="/premium" element={<RequireOnboarding><Premium /></RequireOnboarding>} />
      <Route path="/community" element={<RequireOnboarding><Community /></RequireOnboarding>} />
      <Route path="/marketplace" element={<RequireOnboarding><Marketplace /></RequireOnboarding>} />
      <Route path="/trust" element={<RequireOnboarding><Trust /></RequireOnboarding>} />
      <Route path="/platform" element={<Platform />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  )
}

/** App shell: routes + the always-available emergency SOS button. */
export function AppShell() {
  return (
    <>
      <App />
      <SosButton />
    </>
  )
}
