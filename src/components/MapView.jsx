import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Leaflet map that pins real nearby hospitals / clinics / doctors around a
 * centre, sourced live from OpenStreetMap's Overpass API (keyless). Reports the
 * found places back to the parent via onResults so it can render a list.
 *
 * Markers use inline SVG divIcons so no external image assets are needed — this
 * keeps the single-file preview self-contained.
 */
function pin(color) {
  return L.divIcon({
    className: '',
    html: `<svg width="26" height="34" viewBox="0 0 26 34" xmlns="http://www.w3.org/2000/svg">
      <path d="M13 0C5.8 0 0 5.8 0 13c0 9 13 21 13 21s13-12 13-21C26 5.8 20.2 0 13 0z" fill="${color}"/>
      <circle cx="13" cy="13" r="5" fill="#0D1117"/></svg>`,
    iconSize: [26, 34],
    iconAnchor: [13, 34],
    popupAnchor: [0, -30],
  })
}
const YOU_ICON = pin('#A78BFA')
const CLINIC_ICON = pin('#D97BA8')

function haversineKm(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s))
}

// The public Overpass servers are shared and frequently busy, so we try a few
// mirrors in turn (each with a timeout) before giving up.
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]

function parseElements(data, center) {
  return (data.elements || [])
    .map((el) => {
      const plat = el.lat ?? el.center?.lat
      const plng = el.lon ?? el.center?.lon
      if (plat == null || plng == null) return null
      const t = el.tags || {}
      return {
        id: el.id,
        name: t.name || (t.amenity ? t.amenity + ' (unnamed)' : 'Healthcare facility'),
        type: t.amenity || 'clinic',
        phone: t.phone || t['contact:phone'] || t['contact:mobile'] || t['contact:landline'] || null,
        lat: plat,
        lng: plng,
        distanceKm: haversineKm(center, { lat: plat, lng: plng }),
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 20)
}

async function fetchPlaces(center, onResults, onError) {
  const { lat, lng } = center
  const q = `[out:json][timeout:25];(
    node["amenity"~"hospital|clinic|doctors"](around:6000,${lat},${lng});
    way["amenity"~"hospital|clinic|doctors"](around:6000,${lat},${lng});
  );out center 40;`

  for (const url of OVERPASS_ENDPOINTS) {
    try {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 18000)
      const res = await fetch(url, {
        method: 'POST',
        body: 'data=' + encodeURIComponent(q),
        signal: ctrl.signal,
      })
      clearTimeout(timer)
      if (!res.ok) continue // busy/rate-limited — try the next mirror
      const data = await res.json()
      const places = parseElements(data, center)
      onResults(places)
      return places
    } catch {
      // timeout / network / CORS on this mirror — fall through to the next
    }
  }
  // Every mirror was busy or unreachable.
  onError?.(new Error('all overpass endpoints unavailable'))
  onResults([])
  return []
}

export default function MapView({ center, onResults, onError, onSelect, className = '' }) {
  const selectRef = useRef(onSelect)
  selectRef.current = onSelect
  const elRef = useRef(null)
  const mapRef = useRef(null)
  const layerRef = useRef(null)

  // Init map once.
  useEffect(() => {
    if (mapRef.current || !elRef.current) return
    const map = L.map(elRef.current, { zoomControl: true, scrollWheelZoom: false }).setView([20.59, 78.96], 5)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)
    layerRef.current = L.layerGroup().addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  // Recenter + refetch when the centre changes.
  useEffect(() => {
    const map = mapRef.current
    const layer = layerRef.current
    if (!map || !layer || !center) return
    map.setView([center.lat, center.lng], 13)
    layer.clearLayers()
    L.marker([center.lat, center.lng], { icon: YOU_ICON }).addTo(layer).bindPopup('You are here')

    let cancelled = false
    fetchPlaces(center, (places) => {
      if (cancelled) return
      onResults?.(places)
      places.forEach((p) => {
        const phoneLine = p.phone ? `<br/><a href="tel:${p.phone}">📞 ${p.phone}</a>` : ''
        const m = L.marker([p.lat, p.lng], { icon: CLINIC_ICON })
          .addTo(layer)
          .bindPopup(`<strong>${p.name}</strong><br/>${p.type} · ${p.distanceKm.toFixed(1)} km${phoneLine}`)
        // Tapping a pin also surfaces the styled detail card in the app UI.
        m.on('click', () => selectRef.current?.(p))
      })
    }, onError)
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.lat, center?.lng])

  return <div ref={elRef} className={className} />
}
