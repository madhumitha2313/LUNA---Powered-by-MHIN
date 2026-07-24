import { useMemo, useState } from 'react'
import BackButton from '../components/ui/BackButton'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { useT } from '../lib/i18n.jsx'
import {
  BASE_URL, API_VERSION, ENDPOINTS, ERRORS, SDKS, WEBHOOKS, PIPELINE, MODEL_ROUTING, CHANGELOG,
  envelope, codeSample,
} from '../lib/apiDocs'

const SECTIONS = ['overview', 'auth', 'reference', 'sdks', 'orchestration', 'webhooks', 'errors', 'sandbox', 'changelog']
const SECTION_LABEL = {
  overview: '🚀 Overview', auth: '🔐 Authentication', reference: '🔌 API reference', sdks: '📦 SDKs',
  orchestration: '🧠 AI orchestration', webhooks: '🪝 Webhooks', errors: '⚠️ Errors', sandbox: '🧪 Sandbox', changelog: '📝 Changelog',
}
const METHOD_TONE = { GET: 'text-success bg-success/10', POST: 'text-accent-secondary bg-accent-primary/15', PUT: 'text-warning bg-warning/10', DELETE: 'text-danger bg-danger/10' }

export default function Developers() {
  const { t } = useT()
  const [sec, setSec] = useState('overview')
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-2xl">🧩</span>
          <div>
            <h1 className="font-heading text-2xl font-semibold">{t('devTitle')}</h1>
            <p className="text-caption text-text-muted">{t('devSub')}</p>
          </div>
          <Badge tone="ai" className="ml-auto">{BASE_URL}/api/{API_VERSION}</Badge>
        </div>

        <div className="mt-6 flex flex-col gap-5 lg:flex-row">
          <nav className="flex gap-1.5 overflow-x-auto lg:w-48 lg:flex-col">
            {SECTIONS.map((s) => (
              <button key={s} onClick={() => setSec(s)}
                className={`shrink-0 rounded-2xl px-3.5 py-2 text-left text-[0.88rem] transition lg:w-full ${sec === s ? 'bg-accent-primary/15 font-medium text-text-primary' : 'text-text-secondary hover:bg-white/[0.04]'}`}>
                {SECTION_LABEL[s]}
              </button>
            ))}
          </nav>

          <div className="min-w-0 flex-1">
            {sec === 'overview' && <Overview t={t} />}
            {sec === 'auth' && <Auth t={t} />}
            {sec === 'reference' && <Reference t={t} />}
            {sec === 'sdks' && <Sdks />}
            {sec === 'orchestration' && <Orchestration t={t} />}
            {sec === 'webhooks' && <Webhooks t={t} />}
            {sec === 'errors' && <Errors />}
            {sec === 'sandbox' && <Sandbox t={t} />}
            {sec === 'changelog' && <Changelog />}
          </div>
        </div>

        <p className="mt-10 text-center text-[0.75rem] text-text-muted">
          {t('devFooter')} · <BackButton fallback="/home" className="hover:text-accent-secondary">← {t('admBackApp')}</BackButton>
        </p>
      </div>
    </div>
  )
}

function CodeBlock({ code, lang }) {
  const [copied, setCopied] = useState(false)
  function copy() { try { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { /* */ } }
  return (
    <div className="relative">
      <button onClick={copy} className="absolute right-2 top-2 rounded-lg bg-white/[0.06] px-2 py-1 text-[0.68rem] text-text-muted hover:text-text-primary">{copied ? '✓' : '⧉'} {lang}</button>
      <pre className="overflow-x-auto rounded-2xl border border-white/[0.06] bg-[#0b0e14] p-4 text-[0.78rem] leading-relaxed text-text-secondary"><code>{code}</code></pre>
    </div>
  )
}

function Overview({ t }) {
  const clients = ['Mobile app', 'Web app', 'Admin', 'Doctor portal', 'AI services', 'Wearables', 'Hospital systems', 'External devs']
  return (
    <div className="space-y-5">
      <Card>
        <h3 className="font-heading text-lg font-semibold">{t('devApiFirst')}</h3>
        <p className="mt-2 text-[0.92rem] leading-relaxed text-text-secondary">{t('devApiFirstBody')}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {clients.map((c) => <span key={c} className="rounded-pill border border-white/10 bg-white/[0.03] px-3 py-1 text-caption text-text-secondary">{c}</span>)}
        </div>
      </Card>
      <Card>
        <h3 className="font-heading font-semibold">{t('devEnvelope')}</h3>
        <p className="mt-1 text-caption text-text-muted">{t('devEnvelopeSub')}</p>
        <div className="mt-3"><CodeBlock lang="json" code={JSON.stringify(envelope({}), null, 2)} /></div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-3">
        {[['REST', 'v1 · v2 (planned)'], ['Auth', 'OAuth2 · JWT'], ['Style', 'Versioned · deprecable']].map(([a, bd]) => (
          <Card key={a} className="p-4"><p className="text-caption text-text-muted">{a}</p><p className="mt-1 font-heading font-semibold">{bd}</p></Card>
        ))}
      </div>
    </div>
  )
}

function Auth({ t }) {
  return (
    <div className="space-y-5">
      <Card>
        <h3 className="font-heading font-semibold">{t('devAuthMethods')}</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {['Firebase Auth', 'Google OAuth', 'Apple Sign In', 'Email', 'Passkeys (planned)', 'Biometric (planned)'].map((m) => (
            <span key={m} className="rounded-pill border border-white/10 bg-white/[0.03] px-3 py-1.5 text-caption text-text-secondary">{m}</span>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="font-heading font-semibold">{t('devTokenFlow')}</h3>
        <ol className="mt-3 space-y-2 text-[0.88rem] text-text-secondary">
          {['Sign in → receive access + refresh tokens', 'Send access token as Authorization: Bearer', 'On 401, rotate with the refresh token', 'Tokens expire in 60 min; sessions rotate'].map((s, i) => (
            <li key={i} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-accent-primary/15 text-caption text-accent-secondary">{i + 1}</span>{s}</li>
          ))}
        </ol>
      </Card>
    </div>
  )
}

function Reference({ t }) {
  const [sel, setSel] = useState(ENDPOINTS[0].id)
  const [lang, setLang] = useState('curl')
  const ep = useMemo(() => ENDPOINTS.find((e) => e.id === sel), [sel])
  const groups = useMemo(() => [...new Set(ENDPOINTS.map((e) => e.group))], [])
  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      {/* endpoint list */}
      <Card className="h-fit p-3">
        {groups.map((g) => (
          <div key={g} className="mb-2">
            <p className="px-2 py-1 text-[0.68rem] uppercase tracking-wide text-text-muted">{g}</p>
            {ENDPOINTS.filter((e) => e.group === g).map((e) => (
              <button key={e.id} onClick={() => setSel(e.id)} className={`flex w-full items-center gap-2 rounded-xl px-2 py-1.5 text-left text-[0.78rem] transition ${sel === e.id ? 'bg-accent-primary/15 text-text-primary' : 'text-text-secondary hover:bg-white/[0.04]'}`}>
                <span className={`rounded px-1.5 py-0.5 text-[0.6rem] font-bold ${METHOD_TONE[e.method]}`}>{e.method}</span>
                <span className="truncate">{e.path.replace('/api/v1', '')}</span>
              </button>
            ))}
          </div>
        ))}
      </Card>

      {/* endpoint detail */}
      <div className="space-y-4">
        <Card>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-lg px-2 py-1 text-[0.72rem] font-bold ${METHOD_TONE[ep.method]}`}>{ep.method}</span>
            <code className="font-mono text-[0.85rem] text-text-primary">{ep.path}</code>
            {ep.auth ? <Badge tone="ai" className="ml-auto">🔐 {t('devAuthReq')}</Badge> : <Badge tone="success" className="ml-auto">{t('devPublic')}</Badge>}
          </div>
          <p className="mt-3 text-[0.92rem] text-text-secondary">{ep.summary}</p>
        </Card>

        <Card>
          <div className="flex items-center gap-1.5">
            {['curl', 'js', 'python'].map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`rounded-pill px-3 py-1 text-caption transition ${lang === l ? 'bg-accent-primary text-bg-primary' : 'text-text-secondary hover:text-text-primary'}`}>{l === 'js' ? 'JavaScript' : l === 'curl' ? 'cURL' : 'Python'}</button>
            ))}
          </div>
          <div className="mt-3"><CodeBlock lang={lang} code={codeSample(ep, lang)} /></div>
        </Card>

        <Card>
          <p className="mb-2 text-caption text-text-muted">{t('devResponse')} · 200</p>
          <CodeBlock lang="json" code={JSON.stringify(envelope(ep.data), null, 2)} />
        </Card>
      </div>
    </div>
  )
}

function Sdks() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {SDKS.map((s) => (
        <Card key={s.name}>
          <div className="flex items-center gap-2"><span className="text-2xl">{s.emoji}</span><h3 className="font-heading font-semibold">{s.name}</h3></div>
          <pre className="mt-3 overflow-x-auto rounded-xl border border-white/[0.06] bg-[#0b0e14] px-3 py-2 text-[0.78rem] text-text-secondary"><code>{s.install}</code></pre>
        </Card>
      ))}
    </div>
  )
}

function Orchestration({ t }) {
  return (
    <div className="space-y-5">
      <Card>
        <h3 className="font-heading font-semibold">{t('devPipeline')}</h3>
        <p className="mt-1 text-caption text-text-muted">{t('devPipelineSub')}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {PIPELINE.map(([e, label], i) => (
            <div key={label} className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[0.8rem] text-text-secondary">{e} {label}</span>
              {i < PIPELINE.length - 1 && <span className="text-text-muted">→</span>}
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="font-heading font-semibold">{t('devModelRouting')}</h3>
        <div className="mt-3 space-y-2">
          {MODEL_ROUTING.map(([task, model]) => (
            <div key={task} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-[0.85rem]">
              <span className="text-text-secondary">{task}</span>
              <span className="text-text-muted">→</span>
              <span className="ml-auto font-medium text-accent-secondary">{model}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function Webhooks({ t }) {
  return (
    <div className="space-y-5">
      <Card>
        <h3 className="font-heading font-semibold">{t('devWebhookEvents')}</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {WEBHOOKS.map(([ev, e]) => (
            <div key={ev} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 text-center">
              <div className="text-xl">{e}</div>
              <code className="mt-1 block text-[0.72rem] text-text-secondary">{ev}</code>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="font-heading font-semibold">{t('devWebhookPayload')}</h3>
        <div className="mt-3"><CodeBlock lang="json" code={JSON.stringify({ event: 'cycle.logged', deliveryId: 'dlv_9f2', signature: 'sha256=…', data: { userId: 'usr_10482', startDate: '2026-07-14' }, sentAt: '2026-07-14T12:00:00Z' }, null, 2)} /></div>
        <div className="mt-3 flex flex-wrap gap-2">
          {['Signing secret', 'Auto-retry', 'Delivery logs', 'Failure alerts'].map((f) => <span key={f} className="rounded-pill bg-white/[0.05] px-3 py-1 text-caption text-text-secondary">✓ {f}</span>)}
        </div>
      </Card>
    </div>
  )
}

function Errors() {
  return (
    <Card className="overflow-hidden">
      <h3 className="font-heading font-semibold">Error codes</h3>
      <p className="mt-1 text-caption text-text-muted">Structured, human-readable — each carries a code, message, next step and correlation id.</p>
      <div className="-mx-2 mt-3 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-[0.85rem]">
          <thead><tr className="text-[0.68rem] uppercase tracking-wide text-text-muted"><th className="px-2 py-2">Code</th><th className="px-2 py-2">Meaning</th><th className="px-2 py-2">Next step</th></tr></thead>
          <tbody>
            {ERRORS.map(([code, name, hint]) => (
              <tr key={code} className="border-t border-white/[0.05]">
                <td className="px-2 py-2.5"><span className={`rounded px-2 py-0.5 font-mono text-[0.75rem] ${code[0] === '4' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger'}`}>{code}</span></td>
                <td className="px-2 py-2.5 text-text-primary">{name}</td>
                <td className="px-2 py-2.5 text-text-secondary">{hint}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function Sandbox({ t }) {
  return (
    <div className="space-y-4">
      <Card className="bg-gradient-to-br from-[#6ee7b7]/[0.1] to-transparent">
        <h3 className="font-heading text-lg font-semibold">🧪 {t('devSandbox')}</h3>
        <p className="mt-1 text-[0.92rem] text-text-secondary">{t('devSandboxBody')}</p>
      </Card>
      <Card>
        <p className="text-caption text-text-muted">{t('devTestKey')}</p>
        <CodeBlock lang="env" code={'MIRA_ENV=sandbox\nMIRA_TOKEN=sk_test_51H8xMockKeyForSandboxOnly'} />
        <div className="mt-3 flex flex-wrap gap-2">
          {['Mock users', 'Mock reports', 'Mock AI replies', 'Dummy hospitals', 'No production data'].map((f) => <span key={f} className="rounded-pill bg-white/[0.05] px-3 py-1 text-caption text-text-secondary">{f}</span>)}
        </div>
      </Card>
    </div>
  )
}

function Changelog() {
  return (
    <Card>
      <h3 className="font-heading font-semibold">Changelog</h3>
      <ol className="mt-3 space-y-3">
        {CHANGELOG.map((c) => (
          <li key={c.v} className="flex gap-3">
            <Badge tone="ai">{c.v}</Badge>
            <div><p className="text-[0.88rem] text-text-primary">{c.note}</p><p className="text-caption text-text-muted">{c.when}</p></div>
          </li>
        ))}
      </ol>
    </Card>
  )
}
