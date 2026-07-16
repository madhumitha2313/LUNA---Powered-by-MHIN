import Button from './ui/Button'
import { useT } from '../lib/i18n.jsx'
import { AGENTS, AGENT_ORDER } from '../lib/agents'

/**
 * "MIRA's AI team" — reveals the multi-agent system. The full roster of
 * specialist agents with an orchestrator at the centre; the ones that
 * collaborated on the last message are highlighted, with the orchestrator's
 * reasoning + confidence. Optional transparency — the chat itself stays one
 * seamless companion.
 */
export default function AgentTeam({ involved = [], orchestrator, onClose }) {
  const { t } = useT()
  const involvedSet = new Set(involved.map((a) => a.id))
  const byId = Object.fromEntries((involved || []).map((a) => [a.id, a]))

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧩</span>
          <h3 className="font-heading text-lg font-semibold">{t('agTeamTitle')}</h3>
          <button onClick={onClose} className="ml-auto text-text-muted hover:text-text-primary">✕</button>
        </div>
        <p className="mt-1 text-caption text-text-muted">{t('agTeamSub')}</p>

        {/* Orchestrator summary */}
        {orchestrator && (
          <div className="mt-4 rounded-3xl border border-accent-ai/25 bg-accent-ai/[0.06] p-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧠</span>
              <p className="font-heading font-semibold">{t('agOrchestrator')}</p>
              <span className="ml-auto rounded-pill bg-white/[0.06] px-2.5 py-0.5 text-[0.7rem] text-text-muted">{orchestrator.confidence}% {t('ciConfidence')}</span>
            </div>
            <p className="mt-2 text-[0.88rem] text-text-secondary">{t(orchestrator.reasonKey)}</p>
            <p className="mt-1 text-caption text-success">🛡️ {t('agSafetyPassed')}</p>
          </div>
        )}

        {/* Roster */}
        <p className="mt-5 mb-2 text-[0.72rem] font-semibold uppercase tracking-wide text-text-muted">{t('agRoster')}</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {AGENT_ORDER.map((id) => {
            const a = AGENTS[id]
            const on = involvedSet.has(id)
            return (
              <div key={id} className={`rounded-2xl border p-3 transition ${on ? 'border-accent-primary/40 bg-accent-primary/[0.08]' : 'border-white/[0.06] bg-white/[0.02] opacity-60'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-xl">{a.emoji}</span>
                  {on && <span className="text-[0.6rem] text-success">● {t('agActive')}</span>}
                </div>
                <p className="mt-1.5 text-[0.78rem] font-medium leading-tight text-text-primary">{t(a.key)}</p>
                {on && byId[id]?.contribution && <p className="mt-1 text-[0.68rem] leading-snug text-text-muted">{t(byId[id].contribution)}</p>}
              </div>
            )
          })}
        </div>

        <p className="mt-4 text-[0.75rem] leading-relaxed text-text-muted">💡 {t('agTeamNote')}</p>
        <div className="mt-4 flex justify-end"><Button size="md" onClick={onClose}>{t('learnDone')}</Button></div>
      </div>
    </div>
  )
}
