import { useState } from 'react'
import Button from './ui/Button'
import { useT } from '../lib/i18n.jsx'
import { addLog, getCycleStats } from '../lib/localStore'
import { EMOTIONS, summarizeMood } from '../lib/moodIntel'

/**
 * Gentle daily mood check-in. Pick one or more emotions, optionally set an
 * intensity and add a note. Writes a mood entry to the log (with a compat
 * mood token so it also feeds the health-score engine).
 */
const REASONS = ['reWork', 'reRelationships', 'reHealth', 'reHormones', 'reSleep', 'reNothing']

export default function MoodCheckIn({ onClose, onSaved }) {
  const { t } = useT()
  const [picked, setPicked] = useState([])
  const [intensity, setIntensity] = useState(3)
  const [reason, setReason] = useState(null)
  const [note, setNote] = useState('')
  const [step, setStep] = useState('mood') // mood | more

  function toggle(id) {
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }
  function save() {
    const { compat } = summarizeMood(picked)
    addLog({
      moods: picked,
      mood: compat,
      moodIntensity: intensity,
      moodReason: reason || undefined,
      phase: getCycleStats().phase || null,
      ...(note.trim() ? { note: note.trim() } : {}),
    })
    onSaved?.(picked)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💗</span>
          <h3 className="font-heading text-lg font-semibold">{t('moTitle')}</h3>
          <button onClick={onClose} className="ml-auto text-text-muted hover:text-text-primary">✕</button>
        </div>

        {step === 'mood' && (
          <>
            <p className="mt-1 text-caption text-text-muted">{t('moGreeting')}</p>
            <div className="mt-4 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
              {EMOTIONS.map((e) => {
                const on = picked.includes(e.id)
                return (
                  <button key={e.id} onClick={() => toggle(e.id)}
                    className={`flex flex-col items-center gap-1 rounded-2xl border p-2.5 transition ${on ? 'border-accent-primary bg-accent-primary/[0.14] scale-[1.03]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/20'}`}>
                    <span className="text-2xl">{e.emoji}</span>
                    <span className="text-[0.66rem] font-medium text-text-secondary">{t(`emo_${e.id}`)}</span>
                  </button>
                )
              })}
            </div>
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" size="md" onClick={onClose}>{t('ciCancel')}</Button>
              <Button size="md" disabled={!picked.length} onClick={() => setStep('more')}>{t('moNext')}</Button>
            </div>
          </>
        )}

        {step === 'more' && (
          <>
            <p className="mt-1 text-caption text-text-muted">{t('moMoreSub')}</p>

            <p className="mt-4 mb-2 text-[0.72rem] font-semibold uppercase tracking-wide text-text-muted">{`${t('moIntensity')} · ${intensity}/5`}</p>
            <input type="range" min="1" max="5" value={intensity} onChange={(e) => setIntensity(Number(e.target.value))}
              className="mira-range h-2 w-full cursor-pointer appearance-none rounded-pill"
              style={{ background: `linear-gradient(90deg, #d97ba8 ${(intensity - 1) * 25}%, rgba(255,255,255,0.1) ${(intensity - 1) * 25}%)` }} />

            <p className="mt-5 mb-2 text-[0.72rem] font-semibold uppercase tracking-wide text-text-muted">{t('moReason')}</p>
            <div className="flex flex-wrap gap-1.5">
              {REASONS.map((r) => (
                <button key={r} onClick={() => setReason(reason === r ? null : r)}
                  className={`rounded-pill px-3 py-1.5 text-caption font-medium transition ${reason === r ? 'bg-accent-primary text-white' : 'bg-white/[0.05] text-text-secondary hover:text-text-primary'}`}>
                  {t(r)}
                </button>
              ))}
            </div>

            <p className="mt-5 mb-2 text-[0.72rem] font-semibold uppercase tracking-wide text-text-muted">{t('moWantTalk')}</p>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder={t('moNotePlaceholder')}
              className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary/50 focus:outline-none" />

            <div className="mt-5 flex justify-between gap-3">
              <Button variant="secondary" size="md" onClick={() => setStep('mood')}>← {t('learnBack')}</Button>
              <Button size="md" onClick={save}>{t('moSave')}</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
