import { useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useT } from '../lib/i18n.jsx'
import SosModal from './SosModal'

/**
 * Floating emergency button, present across the app. A deliberate long-press
 * (~2s) activates SOS mode so it can't be triggered by accident; a progress
 * ring fills while held. Hidden on onboarding / legal screens.
 */
const HOLD_MS = 1800

export default function SosButton() {
  const { t } = useT()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [holding, setHolding] = useState(false)
  const [progress, setProgress] = useState(0)
  const timer = useRef(null)
  const raf = useRef(null)

  // Show everywhere except onboarding + legal (and the bare landing "/").
  const shouldHide = pathname.startsWith('/onboarding') || pathname.startsWith('/terms') || pathname.startsWith('/privacy') || pathname === '/'

  function start(e) {
    e.preventDefault()
    setHolding(true)
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - t0) / HOLD_MS)
      setProgress(p)
      if (p < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    timer.current = setTimeout(() => { cancel(); setOpen(true); try { navigator.vibrate?.(60) } catch { /* ignore */ } }, HOLD_MS)
  }
  function cancel() {
    clearTimeout(timer.current)
    cancelAnimationFrame(raf.current)
    setHolding(false)
    setProgress(0)
  }

  if (shouldHide) return open ? <SosModal onClose={() => setOpen(false)} /> : null

  const R = 26, C = 2 * Math.PI * R
  return (
    <>
      <button
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onClick={(e) => e.preventDefault()}
        aria-label={t('sosHold')}
        title={t('sosHold')}
        className="fixed bottom-24 right-4 z-[60] grid h-14 w-14 select-none place-items-center rounded-full bg-gradient-to-br from-[#ff5a6e] to-[#e23744] text-white shadow-[0_0_22px_rgba(226,55,68,0.55)] transition-transform active:scale-95 sm:bottom-6"
        style={{ touchAction: 'none' }}
      >
        {holding && (
          <svg className="pointer-events-none absolute inset-0" width="56" height="56" viewBox="0 0 56 56">
            <circle cx="28" cy="28" r={R} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="3" strokeLinecap="round"
              strokeDasharray={C} strokeDashoffset={C * (1 - progress)} transform="rotate(-90 28 28)" />
          </svg>
        )}
        <span className="text-xl font-bold">SOS</span>
      </button>
      {holding && <span className="fixed bottom-40 right-2 z-[60] rounded-lg bg-black/70 px-2 py-1 text-[0.7rem] text-white sm:bottom-24">{t('sosHolding')}</span>}
      {open && <SosModal onClose={() => setOpen(false)} />}
    </>
  )
}
