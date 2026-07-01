import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { StethoscopeIcon, ShieldIcon, ArrowRightIcon } from '../components/ui/icons'
import { getSymptoms, getProfile } from '../lib/localStore'

const SPECIALTIES = [
  { key: 'Gynaecologist', treats: 'Periods, PCOS/PCOD, endometriosis, fibroids, fertility.' },
  { key: 'Endocrinologist', treats: 'Hormonal causes — PCOS, thyroid, insulin resistance.' },
  { key: 'General Physician', treats: 'First assessment, anaemia, referrals, blood tests.' },
  { key: 'Haematologist', treats: 'Anaemia and blood-related concerns from heavy bleeding.' },
]

/** Suggest a starting specialty from what the user has tracked. */
function suggestSpecialty() {
  const s = getSymptoms()
  const keys = Object.keys(s).filter((k) => s[k])
  if (['hirsutism', 'acne', 'weight', 'dark_patches'].filter((k) => keys.includes(k)).length >= 2)
    return 'Endocrinologist'
  return 'Gynaecologist'
}

export default function Doctors() {
  const [specialty, setSpecialty] = useState(suggestSpecialty())
  const [coords, setCoords] = useState(null)
  const [city, setCity] = useState(getProfile().city || '')
  const [status, setStatus] = useState('')

  function locate() {
    if (!navigator.geolocation) {
      setStatus('Location not available — enter your city below.')
      return
    }
    setStatus('Locating…')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setStatus('')
      },
      () => setStatus('Couldn’t get location — enter your city below.'),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const mapSrc = useMemo(() => {
    if (!coords) return null
    const d = 0.04
    const bbox = [coords.lng - d, coords.lat - d, coords.lng + d, coords.lat + d].join(',')
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${coords.lat},${coords.lng}`
  }, [coords])

  const mapsUrl = coords
    ? `https://www.google.com/maps/search/${encodeURIComponent(specialty + ' near me')}/@${coords.lat},${coords.lng},14z`
    : `https://www.google.com/maps/search/${encodeURIComponent(specialty + (city ? ' in ' + city : ' near me'))}`

  const shareText = `Looking for a ${specialty}${city ? ' in ' + city : ' nearby'}. Here's a map: ${mapsUrl}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

  async function share() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'MIRA — nearby specialist', text: shareText, url: mapsUrl })
      } catch {
        /* user cancelled */
      }
    } else {
      window.open(whatsappUrl, '_blank')
    }
  }

  return (
    <PageShell max="max-w-4xl">
      <div className="mx-auto max-w-2xl text-center">
        <Badge tone="accent" icon={<StethoscopeIcon size={14} />}>
          Find care
        </Badge>
        <h1 className="mt-5 font-heading text-3xl font-semibold tracking-tight sm:text-hero">
          Specialists near you
        </h1>
        <p className="mt-4 text-text-secondary">
          Based on what you’ve tracked, here’s the kind of specialist to see — and a live map to find
          real clinics near you. Share any location straight to WhatsApp.
        </p>
      </div>

      {/* Specialty + locate controls */}
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
                <option key={s.key} value={s.key} className="bg-bg-card">
                  {s.key}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-caption text-text-muted">City (if no location)</span>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Chennai"
              className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary placeholder:text-text-muted focus:border-accent-primary/40 focus:outline-none"
            />
          </label>
          <Button onClick={locate} size="md">
            Use my location
          </Button>
        </div>
        {status && <p className="mt-3 text-caption text-warning">{status}</p>}
        <p className="mt-3 text-caption text-text-secondary">
          {SPECIALTIES.find((s) => s.key === specialty)?.treats}
        </p>
      </Card>

      {/* Live map */}
      <Card className="mt-6 overflow-hidden p-0">
        {mapSrc ? (
          <iframe
            title="Nearby clinics map"
            src={mapSrc}
            className="h-80 w-full border-0"
            loading="lazy"
          />
        ) : (
          <div className="flex h-56 flex-col items-center justify-center gap-3 text-center">
            <StethoscopeIcon size={28} className="text-accent-secondary" />
            <p className="max-w-xs text-caption text-text-secondary">
              Tap “Use my location” to load a live map centred on you — or open results for your city.
            </p>
          </div>
        )}
        <div className="flex flex-wrap gap-2 border-t border-white/[0.06] p-4">
          <Button as="a" href={mapsUrl} target="_blank" rel="noopener" size="md">
            Open in Google Maps <ArrowRightIcon size={16} />
          </Button>
          <Button as="a" href={whatsappUrl} target="_blank" rel="noopener" variant="secondary" size="md">
            Share on WhatsApp
          </Button>
          <Button onClick={share} variant="ghost" size="md">
            Share…
          </Button>
        </div>
      </Card>

      {/* Specialist guide */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {SPECIALTIES.map((s) => (
          <Card key={s.key} hover>
            <div className="flex items-center gap-2">
              <StethoscopeIcon size={18} className="text-accent-secondary" />
              <h3 className="font-heading text-lg font-semibold">{s.key}</h3>
            </div>
            <p className="mt-2 text-caption text-text-secondary">{s.treats}</p>
            <button
              onClick={() => setSpecialty(s.key)}
              className="mt-3 text-caption text-accent-secondary hover:underline"
            >
              Find {s.key}s near me →
            </button>
          </Card>
        ))}
      </div>

      <Card className="mt-6 flex items-start gap-3 bg-bg-secondary/40">
        <ShieldIcon size={20} className="mt-0.5 shrink-0 text-success" />
        <p className="text-caption text-text-secondary">
          Clinic results come from your maps app in real time — MIRA doesn’t store your location or
          share it without you tapping share. Bring your MIRA report to the appointment.
        </p>
      </Card>

      <div className="mt-8 flex justify-center">
        <Button as={Link} to="/report" variant="secondary" size="lg">
          Generate my report first
        </Button>
      </div>
    </PageShell>
  )
}
