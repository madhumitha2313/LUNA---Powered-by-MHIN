import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Voice from './pages/Voice'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/voice" element={<Voice />} />
    </Routes>
  )
}
