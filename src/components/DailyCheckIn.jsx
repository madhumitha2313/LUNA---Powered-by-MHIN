import { useState } from 'react'
import Button from './ui/Button'
import { useT } from '../lib/i18n.jsx'
import { addLog, getCycleStats } from '../lib/localStore'

/**
 * Daily health check-in. A quick, friendly multi-field logger — mood, pain,
 * energy, flow, sleep, stress, water, cravings, symptoms and a note — that
 * writes one entry to the local log and feeds the intelligence engine.
 */

const MOODS = [['great', '😄'], ['happy', '🙂'], ['ok', '😐'], ['low', '😔'], ['anxious', '😰'], ['angry', '😣']]
const FLOWS = [['none', '○'], ['spotting', '·'], ['light', '💧'], ['medium', '💧💧'], ['heavy', '🩸'], ['veryheavy', '🩸🩸']]
const LEVELS = [['low', 'low'], ['ok', 'ok'], ['high', 'high']]
const SLEEPS = [['poor', '😴'], ['ok', '🌙'], ['good', '✨']]
const SYMPTOMS = ['cramps', 'headache', 'backPain', 'acne', 'bloating', 'nausea', 'breastTender', 'fatigue', 'hairFall', 'moodSwings', 'anxiety', 'insomnia', 'digestive', 'spotting', 'pelvicPain']

export default function DailyCheckIn({ onClose, onSaved }) {
  const { t } = useT()
  const [mood, setMood] = useState(null)
  const [pain, setPain] = useState(0)
  const [energy, setEnergy] = useState(null)
  const [flow, setFlow] = useState(null)
  const [sleep, setSleep] = useState(null)
  const [stress, setStress] = useState(null)
  const [water, setWater] = useState(0)
  const [cravings, setCravings] = useState(false)
  const [symptoms, setSymptoms] = useState([])
  const [notes, setNotes] = useState('')

  function toggleSymptom(id) {
    setSymptoms((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  function save() {
    const entry = { phase: getCycleStats().phase || null }
    if (mood) entry.mood = mood
    entry.pain = pain
    if (energy) entry.energy = energy
    if (flow) entry.flow = flow
    if (sleep) entry.sleep = sleep
    if (stress) entry.stress = stress
    entry.water = water
    if (cravings) entry.cravings = true
    if (symptoms.length) entry.symptoms = symptoms
    if (notes.trim()) entry.notes = notes.trim()
    addLog(entry)
    onSaved?.()
    onClose()
  }

  const chip = (active) =>
    `rounded-pill px-3 py-1.5 text-caption font-medium transition ${active ? 'bg-accent-primary text-white' : 'bg-white/[0.05] text-text-secondary hover:text-text-primary'}`

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💗</span>
          <h3 className="font-heading text-lg font-semibold">{t('ciTitle')}</h3>
          <button onClick={onClose} className="ml-auto text-text-muted hover:text-text-primary">✕</button>
        </div>
        <p className="mt-1 text-caption text-text-muted">{t('ciSub')}</p>

        {/* Mood */}
        <Section label={t('ciMood')}>
          <div className="flex flex-wrap gap-2">
            {MOODS.map(([id, e]) => (
              <button key={id} onClick={() => setMood(id)} className={`flex items-center gap-1.5 ${chip(mood === id)}`}>
                <span className="text-base">{e}</span> {t(`mood_${id}`)}
              </button>
            ))}
          </div>
        </Section>

        {/* Pain slider */}
        <Section label={`${t('ciPain')} · ${pain}/10`}>
          <input type="range" min="0" max="10" value={pain} onChange={(e) => setPain(Number(e.target.value))}
            className="mira-range h-2 w-full cursor-pointer appearance-none rounded-pill"
            style={{ background: `linear-gradient(90deg, #fb7185 ${pain * 10}%, rgba(255,255,255,0.1) ${pain * 10}%)` }} />
        </Section>

        {/* Flow */}
        <Section label={t('ciFlow')}>
          <div className="flex flex-wrap gap-2">
            {FLOWS.map(([id, e]) => (
              <button key={id} onClick={() => setFlow(id)} className={`flex items-center gap-1.5 ${chip(flow === id)}`}>
                <span>{e}</span> {t(`flow_${id}`)}
              </button>
            ))}
          </div>
        </Section>

        {/* Energy + Stress */}
        <div className="grid grid-cols-2 gap-4">
          <Section label={t('ciEnergy')}>
            <div className="flex gap-2">{LEVELS.map(([id]) => <button key={id} onClick={() => setEnergy(id)} className={chip(energy === id)}>{t(`lvl_${id}`)}</button>)}</div>
          </Section>
          <Section label={t('ciStress')}>
            <div className="flex gap-2">{LEVELS.map(([id]) => <button key={id} onClick={() => setStress(id)} className={chip(stress === id)}>{t(`lvl_${id}`)}</button>)}</div>
          </Section>
        </div>

        {/* Sleep + Water */}
        <div className="grid grid-cols-2 gap-4">
          <Section label={t('ciSleep')}>
            <div className="flex gap-2">{SLEEPS.map(([id, e]) => <button key={id} onClick={() => setSleep(id)} className={`${chip(sleep === id)}`}>{e} {t(`sleep_${id}`)}</button>)}</div>
          </Section>
          <Section label={`${t('ciWater')} · ${water}`}>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 8 }).map((_, n) => (
                <button key={n} onClick={() => setWater(n + 1 === water ? n : n + 1)} aria-label={`${n + 1}`}
                  className={`text-lg transition ${n < water ? 'opacity-100' : 'opacity-30 grayscale'}`}>💧</button>
              ))}
            </div>
          </Section>
        </div>

        {/* Symptoms */}
        <Section label={t('ciSymptoms')}>
          <div className="flex flex-wrap gap-1.5">
            {SYMPTOMS.map((id) => (
              <button key={id} onClick={() => toggleSymptom(id)} className={chip(symptoms.includes(id))}>{t(`sym_${id}`)}</button>
            ))}
          </div>
        </Section>

        {/* Cravings + Notes */}
        <Section label={t('ciMore')}>
          <button onClick={() => setCravings((v) => !v)} className={`${chip(cravings)} mb-3`}>🍫 {t('ciCravings')}</button>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder={t('ciNotes')}
            className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-primary/50 focus:outline-none" />
        </Section>

        <div className="mt-5 flex justify-end gap-3">
          <Button variant="secondary" size="md" onClick={onClose}>{t('ciCancel')}</Button>
          <Button size="md" onClick={save}>{t('ciSave')}</Button>
        </div>
      </div>
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div className="mt-4">
      <p className="mb-2 text-[0.72rem] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      {children}
    </div>
  )
}
