import { Link } from 'react-router-dom'
import Button from './ui/Button'
import { useT } from '../lib/i18n.jsx'
import { KB } from '../lib/knowledge'

/**
 * "How MIRA thinks" — a transparency panel that shows, in plain language, the
 * reasoning pipeline behind every reply, the safety guardrails, where its
 * knowledge comes from, and how to control memory. Explainability is part of
 * the product, not a footnote.
 */
export default function AiTransparency({ onClose }) {
  const { t } = useT()
  const pipeline = [
    ['🌐', 'aiPipeLang'], ['💗', 'aiPipeEmotion'], ['🎯', 'aiPipeIntent'],
    ['🔄', 'aiPipeContext'], ['📚', 'aiPipeKnowledge'], ['🛡️', 'aiPipeSafety'], ['💬', 'aiPipeResponse'],
  ]
  const guardrails = ['aiGuard1', 'aiGuard2', 'aiGuard3', 'aiGuard4', 'aiGuard5']
  const sources = [...new Set(KB.map((k) => k.source))]

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <h3 className="font-heading text-lg font-semibold">{t('aiHowTitle')}</h3>
          <button onClick={onClose} className="ml-auto text-text-muted hover:text-text-primary">✕</button>
        </div>
        <p className="mt-1 text-caption text-text-muted">{t('aiHowSub')}</p>

        {/* Pipeline */}
        <h4 className="mt-5 mb-2 text-[0.72rem] font-semibold uppercase tracking-wide text-accent-secondary">{t('aiPipeline')}</h4>
        <div className="space-y-1.5">
          {pipeline.map(([icon, key], i) => (
            <div key={key} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2.5">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-primary/15 text-caption text-accent-secondary">{i + 1}</span>
              <span className="text-lg">{icon}</span>
              <span className="text-[0.85rem] text-text-secondary">{t(key)}</span>
            </div>
          ))}
        </div>

        {/* Safety guardrails */}
        <h4 className="mt-6 mb-2 text-[0.72rem] font-semibold uppercase tracking-wide text-accent-secondary">{t('aiGuardrails')}</h4>
        <ul className="space-y-1.5">
          {guardrails.map((g) => (
            <li key={g} className="flex items-start gap-2 rounded-2xl border border-success/15 bg-success/[0.05] p-2.5 text-[0.85rem] text-text-secondary">
              <span className="text-success">✓</span> {t(g)}
            </li>
          ))}
        </ul>

        {/* Knowledge sources */}
        <h4 className="mt-6 mb-2 text-[0.72rem] font-semibold uppercase tracking-wide text-accent-secondary">{t('aiSources')}</h4>
        <p className="text-caption text-text-secondary">{t('aiSourcesNote')}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {sources.map((s) => <span key={s} className="rounded-pill border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[0.72rem] text-text-muted">{s}</span>)}
        </div>

        {/* Memory & privacy */}
        <h4 className="mt-6 mb-2 text-[0.72rem] font-semibold uppercase tracking-wide text-accent-secondary">{t('aiMemory')}</h4>
        <p className="text-caption text-text-secondary">{t('aiMemoryNote')}</p>

        <div className="mt-5 flex justify-end gap-2">
          <Button as={Link} to="/mira" variant="secondary" size="md" onClick={onClose}>🧠 {t('aiManageMemory')}</Button>
          <Button size="md" onClick={onClose}>{t('learnDone')}</Button>
        </div>
      </div>
    </div>
  )
}
