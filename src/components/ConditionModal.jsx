import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VideoPlayer from './VideoPlayer'
import Button from './ui/Button'
import {
  XIcon, CheckCircleIcon, BookmarkIcon, ShareIcon, ArrowRightIcon,
  MicIcon, StethoscopeIcon, HeartIcon, LockIcon,
} from './ui/icons'
import { useT } from '../lib/i18n.jsx'
import {
  getLocalized, getProgress, saveProgress, markCompleted, isSaved, toggleSaved,
} from '../lib/conditions'

const SECTIONS = [
  { key: 'whatIsIt', labelKey: 'cmIntro' },
  { key: 'causes', labelKey: 'cmCauses' },
  { key: 'symptoms', labelKey: 'cmSymptoms' },
  { key: 'riskFactors', labelKey: 'cmRisk' },
  { key: 'prevention', labelKey: 'cmPrevention' },
  { key: 'treatment', labelKey: 'cmTreatment' },
  { key: 'lifestyle', labelKey: 'cmLifestyle' },
  { key: 'whenToSeeDoctor', labelKey: 'cmDoctor' },
]

export default function ConditionModal({ condition, onClose }) {
  const { t, lang } = useT()
  const navigate = useNavigate()
  const [visible, setVisible] = useState(false)
  const [section, setSection] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [saved, setSaved] = useState(() => isSaved(condition.id))
  const [shareMsg, setShareMsg] = useState('')
  const savedProgress = useRef(getProgress(condition.id))
  const playerRef = useRef(null)

  const { content, video, videoLocalized } = useMemo(() => getLocalized(condition, lang), [condition, lang])
  const name = t(condition.nameKey)
  const specialist = t(condition.specialistKey)

  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true))
    document.body.style.overflow = 'hidden'
    return () => { cancelAnimationFrame(id); document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function close() {
    setVisible(false)
    setTimeout(onClose, 220)
  }

  function handleTimeUpdate(current, duration) {
    if (!duration) return
    const idx = Math.min(SECTIONS.length - 1, Math.floor((current / duration) * SECTIONS.length))
    setSection(idx)
    saveProgress(condition.id, { watchedSeconds: current, duration })
  }

  function handleEnded() {
    setCompleted(true)
    markCompleted(condition.id)
  }

  function jumpToSection(i) {
    setSection(i)
    playerRef.current?.seek(i / SECTIONS.length)
  }

  function onSave() {
    setSaved(toggleSaved(condition.id))
  }
  async function onShare() {
    const text = `${name} — ${t('cmShareText')}`
    if (navigator.share) {
      try { await navigator.share({ title: name, text }); return } catch { /* cancelled */ }
    }
    try {
      await navigator.clipboard.writeText(text)
      setShareMsg(t('cmShareCopied'))
      setTimeout(() => setShareMsg(''), 1800)
    } catch { /* clipboard unavailable */ }
  }

  const sec = content[SECTIONS[section].key]

  return (
    <div className="fixed inset-0 z-[80] flex justify-end" aria-modal role="dialog" aria-label={name}>
      <div
        onClick={close}
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        className={`relative flex h-full w-full max-w-2xl flex-col overflow-y-auto bg-bg-primary shadow-lift transition-transform duration-300 ease-luna ${visible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/[0.06] bg-bg-primary/95 px-5 py-4 backdrop-blur">
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-heading text-lg font-semibold">{name}</h2>
            <p className="truncate text-caption text-accent-secondary">{specialist}</p>
          </div>
          <button onClick={onSave} aria-label={t('cmSave')} className={`rounded-full p-2 transition-colors ${saved ? 'text-accent-primary' : 'text-text-muted hover:text-text-secondary'}`}>
            <BookmarkIcon size={19} />
          </button>
          <button onClick={onShare} aria-label={t('cmShare')} className="rounded-full p-2 text-text-muted transition-colors hover:text-text-secondary">
            <ShareIcon size={18} />
          </button>
          <button onClick={close} aria-label={t('cmClose')} className="rounded-full p-2 text-text-muted transition-colors hover:bg-white/5 hover:text-text-primary">
            <XIcon size={20} />
          </button>
        </div>

        {shareMsg && <p className="bg-success/10 px-5 py-1.5 text-center text-caption text-success">{shareMsg}</p>}

        {!completed ? (
          <div className="animate-fade-up flex-1 px-5 py-5">
            <VideoPlayer
              ref={playerRef}
              src={video}
              initialTime={savedProgress.current.watchedSeconds || 0}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
            />
            {!videoLocalized && (
              <p className="mt-2.5 text-center text-[0.76rem] text-text-muted">{t('cmLocalizedSoon')}</p>
            )}
            <p className="mt-2 text-center text-caption text-text-muted">{condition.estimatedWatchTime}</p>

            {/* Interactive timeline */}
            <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
              {SECTIONS.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => jumpToSection(i)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-pill border px-3 py-1.5 text-[0.78rem] transition-all duration-250 ${
                    i === section
                      ? 'border-accent-primary/50 bg-accent-primary/15 text-text-primary'
                      : i < section
                        ? 'border-white/10 bg-white/[0.02] text-text-muted'
                        : 'border-white/[0.08] bg-transparent text-text-muted hover:border-white/20'
                  }`}
                >
                  {i < section && <CheckCircleIcon size={12} className="text-success" />}
                  {t(s.labelKey)}
                </button>
              ))}
            </div>

            {/* Synced educational card */}
            <div key={section} className="animate-fade-up mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
              <p className="mb-1.5 text-caption uppercase tracking-wide text-accent-secondary">{t(SECTIONS[section].labelKey)}</p>
              <p className="text-[0.95rem] leading-relaxed text-text-secondary">{sec}</p>
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => jumpToSection(Math.max(0, section - 1))}
                  disabled={section === 0}
                  className="text-caption text-text-muted hover:text-text-secondary disabled:opacity-30"
                >
                  ← {t('cmPrev')}
                </button>
                {section < SECTIONS.length - 1 ? (
                  <button onClick={() => jumpToSection(section + 1)} className="flex items-center gap-1 text-caption text-accent-secondary hover:underline">
                    {t('cmNext')} <ArrowRightIcon size={13} />
                  </button>
                ) : (
                  <button onClick={handleEnded} className="flex items-center gap-1 text-caption text-accent-secondary hover:underline">
                    {t('cmFinish')} <ArrowRightIcon size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              <ActionBtn icon={MicIcon} label={t('cmAskMira')} onClick={() => { close(); navigate('/voice') }} />
              <ActionBtn icon={HeartIcon} label={t('cmTrackSymptoms')} onClick={() => { close(); navigate('/symptoms') }} />
              <ActionBtn icon={StethoscopeIcon} label={t('cmFindSpecialists')} onClick={() => { close(); navigate('/doctors') }} />
              <ActionBtn icon={LockIcon} label={t('cmBookConsult')} badge={t('cmComingSoon')} disabled />
              <ActionBtn icon={BookmarkIcon} label={saved ? t('cmSaved') : t('cmSave')} onClick={onSave} active={saved} />
              <ActionBtn icon={ShareIcon} label={t('cmShare')} onClick={onShare} />
            </div>
          </div>
        ) : (
          <CompletionScreen
            t={t}
            name={name}
            onContinue={() => setCompleted(false)}
            onTrack={() => { close(); navigate('/symptoms') }}
            onFind={() => { close(); navigate('/doctors') }}
            onAsk={() => { close(); navigate('/voice') }}
          />
        )}
      </div>
    </div>
  )
}

function ActionBtn({ icon: Icon, label, badge, onClick, disabled, active }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3.5 text-center text-[0.78rem] transition-all duration-250 ${
        disabled
          ? 'cursor-not-allowed border-white/[0.06] bg-white/[0.01] text-text-muted/60'
          : active
            ? 'border-accent-primary/50 bg-accent-primary/10 text-accent-secondary'
            : 'border-white/[0.08] bg-white/[0.02] text-text-secondary hover:border-accent-primary/40 hover:bg-accent-primary/[0.06]'
      }`}
    >
      <Icon size={18} />
      <span className="leading-tight">{label}</span>
      {badge && <span className="rounded-pill bg-white/[0.06] px-1.5 py-0.5 text-[0.62rem] text-text-muted">{badge}</span>}
    </button>
  )
}

function CompletionScreen({ t, name, onContinue, onTrack, onFind, onAsk }) {
  return (
    <div className="animate-fade-up flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="relative flex h-20 w-20 items-center justify-center">
        <span className="animate-glow-pulse absolute inset-0 rounded-full bg-success/20" />
        <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-success to-accent-secondary text-white shadow-lift">
          <CheckCircleIcon size={38} />
        </span>
      </span>
      <h2 className="mt-6 font-heading text-2xl font-semibold tracking-tight">{t('cmCompleteTitle')}</h2>
      <p className="mx-auto mt-2 max-w-sm text-text-secondary">{t('cmCompleteBody').replace('{name}', name)}</p>

      <div className="mt-8 w-full max-w-xs space-y-2.5">
        <Button onClick={onContinue} size="lg" className="w-full">{t('cmContinueLearning')}</Button>
        <SecondaryBtn onClick={onTrack}>{t('cmTrackSymptoms')}</SecondaryBtn>
        <SecondaryBtn onClick={onFind}>{t('cmFindSpecialists')}</SecondaryBtn>
        <SecondaryBtn onClick={onAsk}>{t('cmAskMira')}</SecondaryBtn>
      </div>
    </div>
  )
}
function SecondaryBtn({ onClick, children }) {
  return (
    <button onClick={onClick} className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-2.5 text-[0.9rem] text-text-secondary transition hover:border-white/20 hover:text-text-primary">
      {children}
    </button>
  )
}
