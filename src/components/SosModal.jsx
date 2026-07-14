import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useT } from '../lib/i18n.jsx'
import { getNumbers, primaryContact, getLocation, locationMessage, shareVia } from '../lib/safety'
import { getProfile } from '../lib/localStore'

/**
 * SOS Mode — a calm, minimal emergency screen reachable in seconds. Big,
 * clearly-labelled actions that route to real help (emergency call, a trusted
 * person, live location, nearest hospital), plus a slow breathing pacer and
 * reassuring words while support is on the way. MIRA never replaces emergency
 * services — it helps the user reach them fast.
 */
const BREATHS = [
  { key: 'breatheIn', ms: 4000, scale: 1.3 },
  { key: 'breatheHold', ms: 4000, scale: 1.3 },
  { key: 'breatheOut', ms: 6000, scale: 0.85 },
]

export default function SosModal({ onClose }) {
  const { t } = useT()
  const navigate = useNavigate()
  const [bi, setBi] = useState(0)
  const [locState, setLocState] = useState('idle') // idle | locating | ready | denied
  const numbers = getNumbers()
  const primary = primaryContact()
  const allNumber = numbers[0]?.number || '112'

  useEffect(() => {
    const cur = BREATHS[bi]
    const to = setTimeout(() => setBi((n) => (n + 1) % BREATHS.length), cur.ms)
    return () => clearTimeout(to)
  }, [bi])

  async function shareLocation() {
    setLocState('locating')
    const loc = await getLocation()
    if (!loc) { setLocState('denied') }
    else setLocState('ready')
    const msg = locationMessage(loc, getProfile().name)
    try {
      if (navigator.share) { await navigator.share({ title: 'My location', text: msg, url: loc?.maps }); return }
    } catch { /* fall through to link */ }
    const url = shareVia('whatsapp', primary?.phone, msg)
    if (url) window.open(url, '_blank')
  }

  function go(path) { onClose(); navigate(path) }

  const cur = BREATHS[bi]

  return (
    <div className="fixed inset-0 z-[95] overflow-y-auto bg-gradient-to-b from-[#2a1220] via-[#1a1420] to-bg-primary">
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col px-5 py-6">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 rounded-pill bg-danger/20 px-3 py-1 text-caption font-semibold text-danger">🚨 {t('sosActive')}</span>
          <button onClick={onClose} className="rounded-full border border-white/15 px-3 py-1.5 text-caption text-text-secondary hover:bg-white/10">✕ {t('sosClose')}</button>
        </div>

        {/* Calming header + breathing */}
        <div className="mt-6 text-center">
          <div className="mx-auto grid place-items-center" style={{ width: 128, height: 128 }}>
            <span className="absolute rounded-full bg-accent-primary/25 blur-xl" style={{ width: 120, height: 120 }} />
            <div className="grid h-28 w-28 place-items-center rounded-full bg-white/10 backdrop-blur"
              style={{ transform: `scale(${cur.scale})`, transition: `transform ${cur.ms}ms cubic-bezier(0.4,0,0.2,1)` }}>
              <span className="text-sm font-medium text-white">{t(cur.key)}</span>
            </div>
          </div>
          <h1 className="mt-5 font-heading text-2xl font-semibold text-white">{t('sosTitle')}</h1>
          <p className="mt-2 text-[0.95rem] text-white/80">{t('sosMessage')}</p>
        </div>

        {/* Primary: call emergency services */}
        <a href={`tel:${allNumber}`} className="mt-6 flex items-center justify-center gap-3 rounded-3xl bg-gradient-to-br from-[#ff5a6e] to-[#e23744] py-5 text-lg font-semibold text-white shadow-[0_0_30px_rgba(226,55,68,0.5)] active:scale-[0.98]">
          📞 {t('sosCall')} · {allNumber}
        </a>

        {/* Quick actions grid */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          {primary ? (
            <a href={`tel:${primary.phone}`} className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-center active:scale-[0.98]">
              <span className="text-2xl">📱</span>
              <span className="text-[0.82rem] font-medium text-white">{t('sosContact')}</span>
              <span className="text-[0.7rem] text-white/60">{primary.name}</span>
            </a>
          ) : (
            <button onClick={() => go('/safety')} className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-center active:scale-[0.98]">
              <span className="text-2xl">➕</span>
              <span className="text-[0.82rem] font-medium text-white">{t('sosAddContact')}</span>
            </button>
          )}

          <button onClick={shareLocation} className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-center active:scale-[0.98]">
            <span className="text-2xl">📍</span>
            <span className="text-[0.82rem] font-medium text-white">{locState === 'locating' ? t('sosLocating') : t('sosLocation')}</span>
            {locState === 'denied' && <span className="text-[0.68rem] text-danger">{t('sosLocDenied')}</span>}
          </button>

          <a href="https://www.google.com/maps/search/hospital+near+me" target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-center active:scale-[0.98]">
            <span className="text-2xl">🏥</span>
            <span className="text-[0.82rem] font-medium text-white">{t('sosHospital')}</span>
          </a>

          <button onClick={() => go('/safety')} className="flex flex-col items-center gap-1.5 rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-center active:scale-[0.98]">
            <span className="text-2xl">🪪</span>
            <span className="text-[0.82rem] font-medium text-white">{t('sosCard')}</span>
          </button>
        </div>

        {/* Talk with MIRA */}
        <button onClick={() => go('/voice')} className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-accent-ai/30 bg-accent-ai/[0.08] py-3.5 text-[0.95rem] font-medium text-white active:scale-[0.98]">
          🎙️ {t('sosTalk')}
        </button>

        <p className="mt-5 text-center text-[0.78rem] leading-relaxed text-white/55">{t('sosDisclaimer')}</p>
      </div>
    </div>
  )
}
