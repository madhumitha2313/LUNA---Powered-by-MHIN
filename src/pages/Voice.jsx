import { useEffect, useRef, useState } from 'react'
import MiraAvatar from '../components/MiraAvatar'
import BackButton from '../components/ui/BackButton'
import Badge from '../components/ui/Badge'
import { ArrowRightIcon, SparklesIcon, MicIcon, LeafIcon, HeartIcon } from '../components/ui/icons'
import { speechSupported, createRecognizer, speak, stopSpeaking } from '../lib/browserVoice'
import { addLog, getCycleStats, getProfile, getSettings } from '../lib/localStore'
import { detectSentiment, crisisResponse, comfortOpener } from '../lib/sentiment'
import { detectIntent, INTENT, SYMPTOMS, GREET_KEYS, CHIP_KEYS } from '../lib/miraChat'
import { PERSONAS, MODES, getPersona, setPersona } from '../lib/companion'
import { retrieve } from '../lib/knowledge'
import { orchestrate } from '../lib/agents'
import AiTransparency from '../components/AiTransparency'
import AgentTeam from '../components/AgentTeam'
import { useT, getLang } from '../lib/i18n.jsx'

const SR_LANG = { en: 'en-IN', ta: 'ta-IN', hi: 'hi-IN', ml: 'ml-IN', te: 'te-IN', kn: 'kn-IN', bn: 'bn-IN', mr: 'mr-IN' }

/**
 * Talk with Mira — a warm, empathy-first AI companion chat. Runs fully in the
 * browser: intent + sentiment detection, a clarifying question before advice,
 * food/wellness recommendations, memory of your cycle, and a calm crisis-safety
 * mode. Speak (Web Speech, in your language) or type. Audio is never stored.
 */
export default function Voice() {
  const { t, lang } = useT()
  const [messages, setMessages] = useState([])
  const [typing, setTyping] = useState(false)
  const [state, setState] = useState('idle') // idle | listening | speaking
  const [interim, setInterim] = useState('')
  const [typed, setTyped] = useState('')
  const [crisis, setCrisis] = useState(null)
  const [emotion, setEmotion] = useState('neutral') // neutral | happy | concerned
  const [persona, setPersonaState] = useState(getPersona())
  const [personaOpen, setPersonaOpen] = useState(false)
  const [howOpen, setHowOpen] = useState(false)
  const [team, setTeam] = useState(null) // { agents, orchestrator } for the AI-team panel
  const pendingRef = useRef(null) // last symptom we asked about
  const pendingKbRef = useRef(null) // knowledge retrieved for the pending symptom
  const recRef = useRef(null)
  const scrollRef = useRef(null)

  // Opening greeting — personalised + varies by day.
  useEffect(() => {
    const name = (getProfile().name || '').split(' ')[0]
    const stats = getCycleStats()
    const greetKey = GREET_KEYS[new Date().getDate() % GREET_KEYS.length]
    let text = t(greetKey).replace('{name}', name || t('there'))
    if (stats.cycleDay) text += ' ' + t('chatCycleNote').replace('{day}', stats.cycleDay)
    setMessages([{ role: 'mira', text }])
    return () => stopSpeaking()
  }, []) // eslint-disable-line

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing, interim])

  function say(text, recs, kb, agents) {
    setTyping(true)
    setTimeout(() => {
      setTyping(false)
      setMessages((m) => [...m, { role: 'mira', text, recs, kb, agents }])
      setState('speaking')
      speak(text, { lang: SR_LANG[getLang()] || 'en-IN', rate: persona.rate, pitch: persona.pitch })
      // Keep the speaking state roughly as long as the utterance.
      const ms = Math.min(6000, 1200 + text.length * 55)
      setTimeout(() => setState('idle'), ms)
    }, 650)
  }

  function choosePersona(id) {
    setPersonaState(setPersona(id))
    setPersonaOpen(false)
  }

  function pickMode(mode) {
    setEmotion('happy')
    setTimeout(() => setEmotion('neutral'), 2500)
    say(t(mode.opener))
  }

  function process(raw) {
    const text = raw.trim()
    if (!text) return
    setInterim('')
    setMessages((m) => [...m, { role: 'user', text }])

    // Safety first — self-harm / crisis short-circuits everything.
    if (detectSentiment(text) === 'crisis') {
      const c = crisisResponse()
      setCrisis(c)
      setEmotion('concerned')
      pendingRef.current = null
      const t2 = orchestrate({ text, sentiment: 'crisis', crisis: true })
      say(c.message, null, null, t2)
      return
    }

    const sentiment = detectSentiment(text)
    const intent = detectIntent(text)
    const pending = pendingRef.current
    const isSym = SYMPTOMS.includes(intent)
    // Orchestrate: which specialist agents collaborate on this message.
    const team = (kb, hasFoodRecs, hasRecs) => orchestrate({
      text, intent, sentiment, isSymptom: isSym, kb, hasFoodRecs, hasRecs, phase: getCycleStats().phase,
    })

    // Avatar emotion reacts to how the user feels.
    const warm = ['thanks', 'greeting', 'happy'].includes(intent)
    const nextEmotion = sentiment === 'low' || SYMPTOMS.includes(intent) ? 'concerned' : warm ? 'happy' : 'neutral'
    setEmotion(nextEmotion)
    if (nextEmotion !== 'neutral') setTimeout(() => setEmotion('neutral'), 4000)

    // Knowledge retrieval (RAG): find a relevant, cited education snippet.
    const kb = retrieve(text)

    // If we asked a clarifying question and they replied (not a new symptom) → advise.
    if (pending && !(SYMPTOMS.includes(intent) && intent !== pending)) {
      const meta = INTENT[pending]
      addLog({ chat: text, intent: pending })
      pendingRef.current = null
      const pendingKb = pendingKbRef.current
      pendingKbRef.current = null
      const recs = pickRecs(meta)
      say(t(meta.advice), recs, pendingKb, orchestrate({ text, intent: pending, sentiment, isSymptom: true, kb: pendingKb, hasFoodRecs: !!recs?.foods?.length, hasRecs: !!recs, phase: getCycleStats().phase }))
      return
    }

    // A new symptom → acknowledge + ask one clarifying question first.
    if (SYMPTOMS.includes(intent)) {
      pendingRef.current = intent
      pendingKbRef.current = kb // surface the knowledge card with the advice turn
      const meta = INTENT[intent]
      const opener = meta.urgent ? t('empathyUrgent') : t('empathySymptom')
      say(`${opener} ${t(meta.ask)}`, null, null, team(kb, false, false))
      return
    }

    // Feelings, food, greetings, thanks, general → respond directly.
    const meta = INTENT[intent] || INTENT.general
    let text2 = t(meta.advice)
    if (sentiment === 'low' && intent !== 'sad' && intent !== 'stress') text2 = comfortOpener() + ' ' + text2
    const recs = pickRecs(meta)
    say(text2, recs, kb, team(kb, !!recs?.foods?.length, !!recs))
  }

  function pickRecs(meta) {
    const foods = (meta.foods || []).map((k) => t(k))
    const wellness = (meta.wellness || []).map((k) => t(k))
    return foods.length || wellness.length ? { foods, wellness } : null
  }

  function startListening() {
    if (state === 'listening') {
      recRef.current?.stop()
      return
    }
    stopSpeaking()
    const rec = createRecognizer({
      lang: SR_LANG[getLang()] || 'en-IN',
      onStart: () => setState('listening'),
      onResult: ({ interim, final }) => {
        if (interim) setInterim(interim)
        if (final) process(final)
      },
      onError: () => setState('idle'),
      onEnd: () => setState((s) => (s === 'listening' ? 'idle' : s)),
    })
    if (!rec) return
    recRef.current = rec
    rec.start()
  }

  function submitTyped(e) {
    e.preventDefault()
    process(typed)
    setTyped('')
  }

  const avState = state === 'listening' ? 'listening' : typing ? 'thinking' : state === 'speaking' ? 'speaking' : 'idle'

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-bg-primary">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-[#FF4F9D]/[0.08] blur-[130px]" />

      {/* Top bar with expressive avatar */}
      <header className="relative z-30 flex items-center gap-3 border-b border-white/[0.06] px-5 py-3">
        <BackButton fallback="/home" className="text-accent-secondary hover:text-text-primary">←</BackButton>
        <MiraAvatar state={avState} emotion={emotion} size={48} />
        <div className="leading-tight">
          <p className="font-heading font-semibold">{t('chatTitle')}</p>
          <p className="text-caption text-accent-secondary">
            {state === 'listening' ? t('chatListening') : typing ? t('chatTyping') : state === 'speaking' ? t('chatSpeaking') : t('chatOnline')}
          </p>
        </div>

        {/* How MIRA thinks (transparency) */}
        <button onClick={() => setHowOpen(true)} aria-label={t('aiHowTitle')} title={t('aiHowTitle')}
          className="ml-auto grid h-9 w-9 place-items-center rounded-full border border-white/12 text-text-secondary transition hover:border-accent-ai/40 hover:text-accent-ai">ⓘ</button>

        {/* Voice personality picker */}
        <div className="relative">
          <button onClick={() => setPersonaOpen((o) => !o)} className="flex items-center gap-1.5 rounded-pill border border-white/12 bg-white/[0.03] px-3 py-1.5 text-caption text-text-secondary hover:border-accent-primary/40">
            <span className="text-base">{persona.emoji}</span>
            <span className="hidden sm:inline">{t(persona.key)}</span>
            <span className="text-[0.6rem]">▾</span>
          </button>
          {personaOpen && (
            <div className="absolute right-0 z-20 mt-2 w-52 rounded-2xl border border-white/10 bg-bg-card p-1.5 shadow-lift">
              <p className="px-2 py-1 text-[0.7rem] uppercase tracking-wide text-text-muted">{t('chatVoice')}</p>
              {PERSONAS.map((p) => (
                <button key={p.id} onClick={() => choosePersona(p.id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[0.88rem] transition ${persona.id === p.id ? 'bg-accent-primary/15 text-text-primary' : 'text-text-secondary hover:bg-white/[0.05]'}`}>
                  <span className="text-lg">{p.emoji}</span> {t(p.key)}
                  {persona.id === p.id && <span className="ml-auto text-accent-secondary">✓</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Conversation modes */}
      <div className="relative z-10 flex gap-2 overflow-x-auto border-b border-white/[0.05] px-4 py-2 sm:px-6">
        {MODES.map((m) => (
          <button key={m.id} onClick={() => pickMode(m)}
            className="flex shrink-0 items-center gap-1.5 rounded-pill border border-white/10 bg-white/[0.02] px-3 py-1 text-[0.78rem] text-text-secondary transition hover:border-accent-ai/40 hover:text-text-primary">
            <span>{m.emoji}</span> {t(m.key)}
          </button>
        ))}
      </div>

      {/* Conversation */}
      <main ref={scrollRef} className="relative z-10 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto w-full max-w-2xl space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
              <div className="max-w-[85%]">
                <div
                  className={
                    m.role === 'user'
                      ? 'rounded-2xl rounded-br-md bg-gradient-to-br from-[#FF7BB5]/25 to-[#FF2E8A]/20 px-4 py-2.5 text-[0.95rem] text-text-primary'
                      : 'rounded-2xl rounded-bl-md border border-accent-ai/20 bg-accent-ai/[0.06] px-4 py-2.5 text-[0.95rem] leading-relaxed text-text-secondary'
                  }
                >
                  {m.text}
                </div>
                {m.kb && <KnowledgeCard kb={m.kb} t={t} />}
                {m.agents && m.agents.agents.length > 2 && (
                  <button onClick={() => setTeam(m.agents)} className="mt-2 flex items-center gap-1.5 rounded-pill border border-accent-ai/20 bg-accent-ai/[0.06] px-3 py-1.5 text-[0.72rem] text-text-secondary transition hover:border-accent-ai/50">
                    <span className="flex -space-x-1">{m.agents.agents.slice(0, 4).map((a) => <span key={a.id} className="grid h-4 w-4 place-items-center rounded-full bg-bg-card text-[0.55rem] ring-1 ring-white/10">{a.emoji}</span>)}</span>
                    {m.agents.agents.length} {t('agCollaborated')} ▾
                  </button>
                )}
                {m.recs && (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {m.recs.foods.length > 0 && <RecCard icon={LeafIcon} tone="text-success" title={t('chatRecFoods')} items={m.recs.foods} />}
                    {m.recs.wellness.length > 0 && <RecCard icon={HeartIcon} tone="text-accent-secondary" title={t('chatRecWellness')} items={m.recs.wellness} />}
                  </div>
                )}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-2xl rounded-bl-md border border-accent-ai/20 bg-accent-ai/[0.06] px-4 py-3">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-accent-secondary/70" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          )}

          {interim && <p className="text-right text-caption text-accent-secondary/80">“{interim}”</p>}

          {/* Crisis support card */}
          {crisis && (
            <div className="rounded-3xl border border-accent-primary/40 bg-accent-primary/[0.08] p-5 shadow-glow">
              <div className="flex items-center gap-2">
                <HeartIcon size={20} className="text-accent-secondary" />
                <h2 className="font-heading text-lg font-semibold">{crisis.title}</h2>
              </div>
              {getSettings().emergencyPhone && (
                <a href={`tel:${getSettings().emergencyPhone}`} className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-accent-primary/40 bg-accent-primary/15 px-4 py-3 hover:bg-accent-primary/25">
                  <span className="text-[0.95rem] font-medium text-text-primary">{t('callContact')} {getSettings().emergencyName || ''}</span>
                  <span className="font-stat font-semibold text-accent-secondary">📞 {getSettings().emergencyPhone}</span>
                </a>
              )}
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {crisis.helplines.map((h) => (
                  <a key={h.number} href={`tel:${h.number}`} className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 hover:bg-white/[0.09]">
                    <span className="text-caption text-text-secondary">{h.name}</span>
                    <span className="font-stat font-semibold text-accent-secondary">📞 {h.display}</span>
                  </a>
                ))}
              </div>
              <button onClick={() => setCrisis(null)} className="mt-3 text-caption text-text-muted hover:text-text-primary">{t('imSafe')}</button>
            </div>
          )}
        </div>
      </main>

      {/* Suggestion chips */}
      {messages.length <= 2 && (
        <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-wrap gap-2 px-4 pb-2 sm:px-6">
          {CHIP_KEYS.map((k) => (
            <button
              key={k}
              onClick={() => process(t(k))}
              className="rounded-pill border border-white/12 bg-white/[0.03] px-3.5 py-1.5 text-caption text-text-secondary transition-colors hover:border-accent-primary/40 hover:text-text-primary"
            >
              {t(k)}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <form onSubmit={submitTyped} className="relative z-10 mx-auto flex w-full max-w-2xl items-center gap-2 border-t border-white/[0.06] px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={startListening}
          aria-label={t('chatListening')}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-250 ${
            state === 'listening'
              ? 'bg-gradient-to-br from-[#FF7BB5] to-[#FF2E8A] text-white shadow-[0_0_20px_rgba(255,79,157,0.6)]'
              : 'border border-white/15 text-accent-secondary hover:bg-white/5'
          }`}
        >
          <MicIcon size={20} />
        </button>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={t('chatPlaceholder')}
          className="flex-1 rounded-pill border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[0.95rem] text-text-primary placeholder:text-text-muted focus:border-accent-primary/40 focus:outline-none"
        />
        <button type="submit" disabled={!typed.trim()} aria-label="Send" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent-primary text-bg-primary disabled:opacity-40">
          <ArrowRightIcon size={18} />
        </button>
      </form>

      {howOpen && <AiTransparency onClose={() => setHowOpen(false)} />}
      {team && <AgentTeam involved={team.agents} orchestrator={team.orchestrator} onClose={() => setTeam(null)} />}
    </div>
  )
}

/** A cited, plain-language education card retrieved from MIRA's knowledge base. */
function KnowledgeCard({ kb, t }) {
  return (
    <div className={`mt-2 rounded-2xl border p-3.5 text-left ${kb.urgent ? 'border-danger/30 bg-danger/[0.06]' : 'border-accent-ai/20 bg-accent-ai/[0.05]'}`}>
      <div className="flex items-center gap-2">
        <span className="text-lg">{kb.emoji}</span>
        <span className="font-heading text-caption font-semibold text-text-primary">{kb.title}</span>
        <span className="ml-auto rounded-pill bg-white/[0.06] px-2 py-0.5 text-[0.62rem] text-text-muted">{t('kbLabel')}</span>
      </div>
      <p className="mt-2 text-[0.85rem] leading-relaxed text-text-secondary">{kb.summary}</p>
      {kb.why && <p className="mt-2 text-[0.8rem] leading-relaxed text-text-muted">💡 {kb.why}</p>}
      <div className="mt-2.5 flex items-center gap-2 border-t border-white/[0.06] pt-2">
        <span className="text-[0.68rem] text-text-muted">📚 {kb.source}</span>
        <span className="ml-auto text-[0.68rem] text-accent-secondary">{t('kbNotDiagnosis')}</span>
      </div>
    </div>
  )
}

function RecCard({ icon: Icon, tone, title, items }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 text-left">
      <div className="mb-2 flex items-center gap-2">
        <Icon size={16} className={tone} />
        <span className="font-heading text-caption font-semibold">{title}</span>
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {items.map((it) => (
          <li key={it} className="rounded-pill bg-white/[0.05] px-2.5 py-1 text-[0.8rem] text-text-secondary">{it}</li>
        ))}
      </ul>
    </div>
  )
}
