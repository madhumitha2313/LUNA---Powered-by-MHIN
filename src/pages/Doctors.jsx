import { useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import MapView from '../components/MapView'
import { StethoscopeIcon, ShieldIcon, ArrowRightIcon } from '../components/ui/icons'
import { getSymptoms, getProfile } from '../lib/localStore'

const SPECIALTIES = [
  { key: 'Gynaecologist', treats: 'Periods, PCOS/PCOD, endometriosis, fibroids, fertility.' },
  { key: 'Endocrinologist', treats: 'Hormonal causes — PCOS, thyroid, insulin resistance.' },
  { key: 'General Physician', treats: 'First assessment, anaemia, referrals, blood tests.' },
  { key: 'Haematologist', treats: 'Anaemia and blood-related concerns from heavy bleeding.' },
]

function suggestSpecialty() {
  const s = getSymptoms()
  const keys = Object.keys(s).filter((k) => s[k])
  if (['hirsutism', 'acne', 'weight', 'dark_patches'].filter((k) => keys.includes(k)).length >= 2)
    return 'Endocrinologist'
  return 'Gynaecologist'
}

export default function Doctors() {
  const [specialty, setSpecialty] = useState(suggestSpecialty())
  const [center, setCenter] = useState(null)
  const [city, setCity] = useState(getProfile().city || '')
  const [results, setResults] = useState([])
  const [status, setStatus] = useState('')

  function locate() {
    if (!navigator.geolocation) return setStatus('Location unavailable — search a city instead.')
    setStatus('Locating…')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('')
      },
      () => setStatus('Couldn’t get location — search a city instead.'),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  async function searchCity(e) {
    e?.preventDefault()
    if (!city.trim()) return
    setStatus('Finding ' + city + '…')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(city)}`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      if (!data.length) return setStatus('Couldn’t find that city — try another spelling.')
      setCenter({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) })
      setStatus('')
    } catch {
      setStatus('Search failed — check your connection.')
    }
  }

  function onError() {
    setStatus('Live clinic data is busy right now — try again, or use “Open in Google Maps”.')
  }

  const dirUrl = (p) => `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`
  const shareUrl = (p) =>
    `https://wa.me/?text=${encodeURIComponent(`${p.name} (${specialty}) — https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}`)}`

  return (
    <PageShell max="max-w-4xl">
      <div className="mx-auto max-w-2xl text-center">
        <Badge tone="accent" icon={<StethoscopeIcon size={14} />}>
          Find care
        </Badge>
        <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight sm:text-hero">
          Hospitals & specialists near you
        </h1>
        <p className="mt-4 text-text-secondary">
          Real hospitals and clinics from OpenStreetMap, pinned on the map. Get directions or share
          any one straight to WhatsApp.
        </p>
      </div>

      {/* Controls */}
      <Card className="mt-10">
        <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="block">
            <span className="mb-1.5 block text-caption text-text-muted">Specialist</span>
            <select
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary focus:border-accent-primary/40 focus:outline-none"
            >
              {SPECIALTIES.map((s) => (
                <option key={s.key} value={s.key} className="bg-bg-card">{s.key}</option>
              ))}
            </select>
          </label>
          <form onSubmit={searchCity} className="block">
            <span className="mb-1.5 block text-caption text-text-muted">Search a city</span>
            <div className="flex gap-2">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Salem"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary placeholder:text-text-muted focus:border-accent-primary/40 focus:outline-none"
              />
              <Button type="submit" size="md" variant="secondary">Go</Button>
            </div>
          </form>
          <Button onClick={locate} size="md">Use my location</Button>
        </div>
        {status && <p className="mt-3 text-caption text-warning">{status}</p>}
        <p className="mt-3 text-caption text-text-secondary">
          {SPECIALTIES.find((s) => s.key === specialty)?.treats}
        </p>
      </Card>

      {/* Map */}
      <Card className="mt-6 overflow-hidden p-0">
        <MapView center={center} onResults={setResults} onError={onError} className="h-80 w-full" />
        {!center && (
          <div className="border-t border-white/[0.06] p-4 text-center text-caption text-text-secondary">
            Tap “Use my location” or search a city to load nearby hospitals & clinics.
          </div>
        )}
      </Card>

      {/* Results list */}
      {results.length > 0 && (
        <Card className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-heading text-lg font-semibold">
              {results.length} nearby ({specialty})
            </h2>
            <Badge tone="success">OpenStreetMap</Badge>
          </div>
          <ul className="divide-y divide-white/[0.06]">
            {results.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-text-primary">{p.name}</p>
                  <p className="text-caption text-text-muted capitalize">
                    {p.type} · {p.distanceKm.toFixed(1)} km away
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <a
                    href={dirUrl(p)}
                    target="_blank"
                    rel="noopener"
                    className="rounded-pill border border-white/10 px-3 py-1.5 text-caption text-text-secondary hover:bg-white/5"
                  >
                    Directions
                  </a>
                  <a
                    href={shareUrl(p)}
                    target="_blank"
                    rel="noopener"
                    className="rounded-pill border border-success/25 bg-success/10 px-3 py-1.5 text-caption text-success hover:bg-success/15"
                  >
                    Share
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Specialist guide */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {SPECIALTIES.map((s) => (
          <Card key={s.key} hover>
            <div className="flex items-center gap-2">
              <StethoscopeIcon size={18} className="text-accent-secondary" />
              <h3 className="font-heading text-lg font-semibold">{s.key}</h3>
            </div>
            <p className="mt-2 text-caption text-text-secondary">{s.treats}</p>
            <button onClick={() => setSpecialty(s.key)} className="mt-3 text-caption text-accent-secondary hover:underline">
              Set as specialist →
            </button>
          </Card>
        ))}
      </div>

      <Card className="mt-6 flex items-start gap-3 bg-bg-secondary/40">
        <ShieldIcon size={20} className="mt-0.5 shrink-0 text-success" />
        <p className="text-caption text-text-secondary">
          Hospital pins come live from OpenStreetMap. MIRA doesn’t store your location or share it
          unless you tap share. Bring your MIRA report to the appointment.
        </p>
      </Card>

      <div className="mt-8 flex justify-center">
        <Button as={Link} to="/report" variant="secondary" size="lg">
          Generate my report first <ArrowRightIcon size={16} />
        </Button>
      </div>
    </PageShell>
  )
}
