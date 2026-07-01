import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Voice from './pages/Voice'
import Home from './pages/Home'
import Login from './pages/Login'
import Features from './pages/Features'
import HowItWorks from './pages/HowItWorks'
import Tracker from './pages/Tracker'
import Symptoms from './pages/Symptoms'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/voice" element={<Voice />} />
      <Route path="/login" element={<Login />} />
      <Route path="/features" element={<Features />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/tracker" element={<Tracker />} />
      <Route path="/symptoms" element={<Symptoms />} />
    </Routes>
  )
}
