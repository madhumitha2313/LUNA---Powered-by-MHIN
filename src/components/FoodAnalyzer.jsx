import { useRef, useState } from 'react'
import Button from './ui/Button'
import { useT } from '../lib/i18n.jsx'
import { FOOD_DB, analyzeFood, logMeal } from '../lib/nutritionIntel'

/**
 * AI Food Analyzer — MIRA's "food camera". You can attach a photo of your
 * plate and pick/confirm the food (a real vision model needs a server, so
 * offline we let you choose or type it), then MIRA analyses it against a
 * local nutrition table: macros, a health score, cycle suitability and a
 * healthier swap.
 */
export default function FoodAnalyzer({ onClose, onLogged }) {
  const { t } = useT()
  const [photo, setPhoto] = useState(null)
  const [query, setQuery] = useState('')
  const [result, setResult] = useState(null)
  const fileRef = useRef(null)

  function pickPhoto(e) {
    const f = e.target.files?.[0]
    if (!f) return
    const r = new FileReader()
    r.onload = () => setPhoto(r.result)
    r.readAsDataURL(f)
  }
  function run(q) {
    const res = analyzeFood(q ?? query)
    setResult(res)
  }

  const suitTone = { great: 'text-success', ok: 'text-warning', low: 'text-danger' }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">📸</span>
          <h3 className="font-heading text-lg font-semibold">{t('nuAnalyzerTitle')}</h3>
          <button onClick={onClose} className="ml-auto text-text-muted hover:text-text-primary">✕</button>
        </div>
        <p className="mt-1 text-caption text-text-muted">{t('nuAnalyzerSub')}</p>

        {/* Photo dropzone */}
        <button onClick={() => fileRef.current?.click()}
          className="mt-4 flex w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-white/15 bg-white/[0.02] p-6 text-center transition hover:border-accent-primary/50">
          {photo ? (
            <img src={photo} alt="plate" className="max-h-40 rounded-2xl object-cover" />
          ) : (
            <>
              <span className="text-4xl">🍽️</span>
              <span className="text-caption text-text-secondary">{t('nuAddPhoto')}</span>
            </>
          )}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={pickPhoto} className="hidden" />

        {/* Pick / search food */}
        <p className="mt-5 mb-2 text-[0.72rem] font-semibold uppercase tracking-wide text-text-muted">{t('nuWhatIsIt')}</p>
        <div className="flex gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run()}
            placeholder={t('nuFoodPlaceholder')}
            className="flex-1 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary/50 focus:outline-none" />
          <Button size="md" onClick={() => run()}>{t('nuAnalyze')}</Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {FOOD_DB.slice(0, 8).map((f) => (
            <button key={f.id} onClick={() => { setQuery(f.name); run(f.name) }}
              className="rounded-pill bg-white/[0.05] px-2.5 py-1 text-caption text-text-secondary transition hover:text-text-primary">{f.emoji} {f.name}</button>
          ))}
        </div>

        {/* Result */}
        {result && !result.unknown && (
          <div className="mt-5 rounded-3xl border border-white/[0.06] bg-white/[0.02] p-4 animate-fade-up">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{result.emoji}</span>
              <div className="flex-1">
                <h4 className="font-heading text-lg font-semibold">{result.name}</h4>
                <p className={`text-caption font-medium ${suitTone[result.suit]}`}>{t(`nuSuit_${result.suit}`)}</p>
              </div>
              <div className="text-right">
                <p className="font-stat text-2xl font-bold" style={{ color: result.health >= 70 ? '#6ee7b7' : result.health >= 45 ? '#fbbf24' : '#fb7185' }}>{result.health}</p>
                <p className="text-[0.65rem] text-text-muted">{t('nuHealthScore')}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-center">
              <Macro v={`${result.kcal}`} l={t('nuKcal')} />
              <Macro v={`${result.protein}g`} l={t('nuProtein')} />
              <Macro v={`${result.iron}mg`} l={t('nuIron')} />
              <Macro v={`${result.fiber}g`} l={t('nuFiber')} />
            </div>
            {result.sub && (
              <div className="mt-4 rounded-2xl border border-success/20 bg-success/[0.06] p-3">
                <p className="text-[0.72rem] font-semibold uppercase tracking-wide text-success">{t('nuTrySwap')}</p>
                <p className="mt-1 text-[0.9rem] text-text-secondary">✨ {result.sub}</p>
              </div>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" size="md" onClick={() => { logMeal({ slot: 'scan', name: result.name, healthy: result.health >= 55 }); onLogged?.(); onClose() }}>{t('nuLogThis')}</Button>
            </div>
          </div>
        )}
        {result && result.unknown && (
          <p className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-caption text-text-secondary">{t('nuUnknown')}</p>
        )}
      </div>
    </div>
  )
}

function Macro({ v, l }) {
  return (
    <div className="rounded-2xl bg-black/20 p-2.5">
      <p className="font-stat text-base font-bold text-text-primary">{v}</p>
      <p className="text-[0.62rem] text-text-muted">{l}</p>
    </div>
  )
}
