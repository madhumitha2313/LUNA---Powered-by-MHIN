import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageShell from '../components/layout/PageShell'
import BottomNav from '../components/layout/BottomNav'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { SparklesIcon, ShieldIcon, UsersIcon } from '../components/ui/icons'
import { useT } from '../lib/i18n.jsx'
import { getProfile } from '../lib/localStore'
import {
  SAFE_SPACES, space, isJoined, toggleSpace, IDENTITY_MODES, setIdentity, displayName,
  REACTIONS, react, myReaction, feed, createPost, moderate, POST_TAGS, MOD_STATES, GUIDELINES,
  REPORT_REASONS, reportContent, EXPERTS, CHALLENGES, joinedChallenge, toggleChallenge,
  SUGGESTED_BUDDIES, isBuddy, toggleBuddy, SUCCESS_STORIES, EVENTS, isRegistered, toggleEvent,
  reputation, digest, recommendedSpaces, getCommunity,
} from '../lib/communityHub'

function fill(t, key, vars = {}) { let s = t(key); Object.entries(vars).forEach(([k, v]) => { s = s.replace(new RegExp(`\\{${k}\\}`, 'g'), v) }); return s }

export default function Community() {
  const { t } = useT()
  const [tab, setTab] = useState('feed')
  const [tick, setTick] = useState(0)
  const bump = () => setTick((v) => v + 1)
  const [reportFor, setReportFor] = useState(null)

  const tabs = [['feed', '💬', 'coTabFeed'], ['spaces', '🌸', 'coTabSpaces'], ['connect', '🤝', 'coTabConnect'], ['safety', '🛡️', 'coTabSafety']]

  return (
    <PageShell max="max-w-4xl">
      <div className="text-center">
        <Badge tone="ai" icon={<UsersIcon size={14} />}>{t('coBadge')}</Badge>
        <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight sm:text-4xl">{t('coHeadingCom')}</h1>
        <p className="mt-2 text-text-secondary">{t('coSubCom')}</p>
      </div>

      <div className="sticky top-2 z-20 mx-auto mt-6 flex max-w-md gap-1 rounded-pill border border-white/10 bg-bg-card/80 p-1 backdrop-blur">
        {tabs.map(([id, emoji, key]) => (
          <button key={id} onClick={() => setTab(id)} className={`flex-1 rounded-pill px-2 py-2 text-[0.8rem] font-medium transition ${tab === id ? 'bg-accent-primary text-bg-primary' : 'text-text-secondary hover:text-text-primary'}`}>
            <span className="mr-1">{emoji}</span>{t(key)}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === 'feed' && <FeedTab t={t} tick={tick} bump={bump} onReport={setReportFor} />}
        {tab === 'spaces' && <SpacesTab t={t} tick={tick} bump={bump} />}
        {tab === 'connect' && <ConnectTab t={t} tick={tick} bump={bump} />}
        {tab === 'safety' && <SafetyTab t={t} tick={tick} bump={bump} />}
      </div>

      <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-4 text-center">
        <p className="text-[0.82rem] leading-relaxed text-text-muted">🛡️ {t('coDisclaimerCom')}</p>
      </div>

      <div className="h-24" />
      {reportFor && <ReportModal t={t} target={reportFor} onClose={() => setReportFor(null)} onDone={() => { setReportFor(null); bump() }} />}
      <BottomNav />
    </PageShell>
  )
}

// ── FEED ──────────────────────────────────────────────────────────────────────
function FeedTab({ t, tick, bump, onReport }) {
  const c = useMemo(() => getCommunity(), [tick])
  const posts = useMemo(() => feed(), [tick])
  const dig = useMemo(() => digest(t), [tick])
  const profile = getProfile()

  return (
    <div className="space-y-6">
      {/* Identity */}
      <Card className="bg-white/[0.02]">
        <p className="mb-2 text-caption font-semibold text-text-secondary">🎭 {t('coIdentity')}</p>
        <div className="flex flex-wrap gap-1.5">
          {IDENTITY_MODES.map((m) => (
            <button key={m.id} onClick={() => { setIdentity(m.id); bump() }} className={`rounded-pill px-3 py-1.5 text-[0.74rem] font-medium transition ${c.identity === m.id ? 'bg-accent-primary text-bg-primary' : 'border border-white/10 text-text-secondary hover:text-text-primary'}`}>{m.emoji} {t(m.key)}</button>
          ))}
        </div>
        {c.identity === 'nickname' && (
          <input defaultValue={c.nickname} placeholder={t('coNicknamePh')} onBlur={(e) => { setIdentity('nickname', e.target.value.trim()); bump() }} className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-caption outline-none focus:border-accent-primary/50" />
        )}
        <p className="mt-2 text-[0.72rem] text-text-muted">{fill(t, 'coPostingAs', { name: displayName(t, profile.name) })}</p>
      </Card>

      {/* Today's wellness topic */}
      <Card className="flex items-center gap-3 bg-gradient-to-br from-[#d97ba8]/[0.1] to-transparent">
        <span className="text-3xl">🌷</span>
        <div><p className="text-caption text-text-muted">{t('coTodayTopic')}</p><p className="font-heading font-semibold">{t('coTodayTopicText')}</p></div>
      </Card>

      {/* Composer */}
      <Composer t={t} joined={c.joined} onPosted={bump} />

      {/* AI digest */}
      {dig.length > 0 && (
        <Card className="bg-accent-ai/[0.05]">
          <p className="mb-2 flex items-center gap-1.5 text-caption font-semibold text-accent-ai"><SparklesIcon size={13} /> {t('coDigest')}</p>
          <ul className="space-y-1">
            {dig.map((d, i) => <li key={i} className="text-[0.84rem] text-text-secondary">{d.icon} {fill(t, d.key, d.vars)}</li>)}
          </ul>
        </Card>
      )}

      {/* Feed */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🔥</span><h2 className="font-heading text-lg font-semibold">{t('coTrending')}</h2></div>
        <div className="space-y-3">
          {posts.map((p) => <PostCard key={p.id} t={t} post={p} onReact={bump} onReport={onReport} />)}
        </div>
      </div>
    </div>
  )
}

function Composer({ t, joined, onPosted }) {
  const [body, setBody] = useState('')
  const [sp, setSp] = useState(joined[0] || 'selfcare')
  const [anon, setAnon] = useState(false)
  const [tag, setTag] = useState('experience')
  const [result, setResult] = useState(null)
  const mod = body.trim().length > 3 ? moderate(body) : null

  function post() {
    const r = createPost({ space: sp, body: body.trim(), tag, anon })
    if (r.ok) { setBody(''); setResult({ status: 'posted', mod: r.mod }); onPosted() }
    else setResult({ status: 'blocked', mod: r.mod })
  }

  return (
    <Card>
      <textarea value={body} onChange={(e) => { setBody(e.target.value); setResult(null) }} rows={3} placeholder={t('coComposePh')} className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-[0.9rem] outline-none focus:border-accent-primary/50" />
      {mod && mod.status !== 'ok' && (
        <div className={`mt-2 rounded-xl border p-2.5 text-[0.78rem] ${mod.status === 'block' ? 'border-danger/25 bg-danger/[0.06] text-danger' : mod.status === 'crisis' ? 'border-accent-ai/25 bg-accent-ai/[0.06] text-accent-ai' : 'border-warning/25 bg-warning/[0.06] text-warning'}`}>
          {mod.status === 'block' ? '🚫 ' : mod.status === 'crisis' ? '💗 ' : '⚠️ '}{t(mod.key)}
          {mod.status === 'crisis' && <Link to="/safety" className="ml-1 underline">{t('coGetSupport')}</Link>}
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <select value={sp} onChange={(e) => setSp(e.target.value)} className="rounded-pill border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[0.74rem] outline-none">
          {SAFE_SPACES.filter((s) => joined.includes(s.id)).concat(SAFE_SPACES.filter((s) => !joined.includes(s.id))).map((s) => <option key={s.id} value={s.id} className="bg-bg-card">{s.emoji} {t(s.key)}</option>)}
        </select>
        <div className="flex gap-1">
          {Object.entries(POST_TAGS).map(([k, e]) => <button key={k} onClick={() => setTag(k)} className={`rounded-pill px-2 py-1 text-[0.7rem] ${tag === k ? 'bg-accent-primary/15 text-text-primary' : 'text-text-muted hover:text-text-secondary'}`}>{e}</button>)}
        </div>
        <button onClick={() => setAnon(!anon)} className={`rounded-pill px-2.5 py-1 text-[0.7rem] transition ${anon ? 'bg-white/10 text-text-primary' : 'text-text-muted'}`}>🕶️ {t('coAnon')}</button>
        <Button size="sm" className="ml-auto" disabled={body.trim().length < 4 || (mod && mod.status === 'block')} onClick={post}>{t('coPost')}</Button>
      </div>
      {result?.status === 'posted' && <p className="mt-2 text-[0.76rem] text-success">✓ {t('coPosted')}{result.mod.status === 'warn' ? ' · ' + t('coPostedWarn') : ''}</p>}
      {result?.status === 'blocked' && <p className="mt-2 text-[0.76rem] text-danger">🚫 {t('coBlocked')}</p>}
      <p className="mt-2 text-[0.7rem] text-text-muted">🤖 {t('coModNote')}</p>
    </Card>
  )
}

function PostCard({ t, post, onReact, onReport }) {
  const [open, setOpen] = useState(false)
  const mine = myReaction(post.id)
  const total = post.reacts + (mine ? 1 : 0)
  const name = post.anon ? t('idAnonName') : post.mine ? t('coYou') : t(post.nameKey)
  return (
    <Card>
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.05] text-lg">{post.avatar}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[0.86rem] font-semibold">{name}</p>
          <p className="text-[0.68rem] text-text-muted">{POST_TAGS[post.tag]} {t(space(post.space)?.key || '')}</p>
        </div>
        <button onClick={() => onReport({ id: post.id })} className="text-[0.7rem] text-text-muted hover:text-danger" title={t('coReport')}>⚑</button>
      </div>
      <p className="mt-2.5 whitespace-pre-wrap text-[0.9rem] leading-relaxed text-text-secondary">{post.bodyKey ? t(post.bodyKey) : post.body}</p>
      {/* Reaction bar */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {REACTIONS.map((r) => (
          <button key={r.id} onClick={() => { react(post.id, r.id); onReact() }} title={t(r.key)} className={`rounded-pill px-2 py-1 text-[0.8rem] transition ${mine === r.id ? 'bg-accent-primary/15 ring-1 ring-accent-primary/40' : 'hover:bg-white/[0.05]'}`}>{r.emoji}</button>
        ))}
        <span className="ml-1 text-[0.72rem] text-text-muted">{fill(t, 'coSupported', { n: total })}</span>
        <button onClick={() => setOpen(!open)} className="ml-auto text-[0.72rem] text-accent-secondary hover:underline">💬 {fill(t, 'coComments', { n: post.comments })}</button>
      </div>
      {open && (
        <div className="mt-3 space-y-2 border-t border-white/[0.06] pt-3">
          <p className="text-[0.78rem] text-text-muted">{t('coCommentsPreview')}</p>
          <div className="flex items-start gap-2 rounded-xl bg-white/[0.02] p-2.5"><span>🌸</span><p className="text-[0.8rem] text-text-secondary">{t('coSampleComment')}</p></div>
        </div>
      )}
    </Card>
  )
}

// ── SPACES ────────────────────────────────────────────────────────────────────
function SpacesTab({ t, tick, bump }) {
  const recs = useMemo(() => recommendedSpaces(), [tick])
  return (
    <div className="space-y-6">
      {recs.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-2"><SparklesIcon size={16} className="text-accent-ai" /><h2 className="font-heading text-lg font-semibold">{t('coRecommended')}</h2></div>
          <div className="space-y-2">
            {recs.map((r) => {
              const s = space(r.id)
              return (
                <Card key={r.id} className="flex items-center gap-3 bg-accent-ai/[0.06]">
                  <span className="text-2xl">{s.emoji}</span>
                  <div className="min-w-0 flex-1"><p className="font-heading text-[0.9rem] font-semibold">{t(s.key)}</p><p className="text-[0.76rem] text-accent-ai">✨ {t(r.reasonKey)}</p></div>
                  <Button size="sm" onClick={() => { toggleSpace(r.id); bump() }}>{t('coJoin')}</Button>
                </Card>
              )
            })}
          </div>
        </div>
      )}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🌸</span><h2 className="font-heading text-lg font-semibold">{t('coSafeSpaces')}</h2></div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {SAFE_SPACES.map((s) => {
            const joined = isJoined(s.id)
            return (
              <Card key={s.id} className={`flex items-center gap-3 ${joined ? 'border-accent-primary/25 bg-accent-primary/[0.05]' : ''}`}>
                <span className="text-2xl">{s.emoji}</span>
                <div className="min-w-0 flex-1"><p className="font-heading text-[0.88rem] font-semibold">{t(s.key)}</p><p className="text-[0.7rem] text-text-muted">{fill(t, 'coMembers', { n: s.members.toLocaleString() })}</p></div>
                <Button size="sm" variant={joined ? 'ghost' : 'secondary'} onClick={() => { toggleSpace(s.id); bump() }}>{joined ? '✓ ' + t('coJoined') : t('coJoin')}</Button>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── CONNECT ───────────────────────────────────────────────────────────────────
function ConnectTab({ t, tick, bump }) {
  return (
    <div className="space-y-6">
      {/* Ask an Expert */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>👩‍⚕️</span><h2 className="font-heading text-lg font-semibold">{t('coAskExpert')}</h2></div>
        <p className="mb-3 text-caption text-text-muted">{t('coAskExpertSub')}</p>
        <div className="space-y-2">
          {EXPERTS.map((e) => (
            <Card key={e.id} className="flex items-center gap-3">
              <span className="text-2xl">{e.avatar}</span>
              <div className="min-w-0 flex-1"><p className="font-heading text-[0.88rem] font-semibold">{t(e.nameKey)} {e.live && <Badge tone="danger" className="ml-1">● {t('coLive')}</Badge>}</p><p className="text-[0.72rem] text-text-muted">{t(e.roleKey)} · {t(e.topicKey)}</p></div>
              <div className="text-right"><p className="text-[0.7rem] text-text-secondary">{t(e.whenKey)}</p><button className="text-[0.72rem] text-accent-secondary hover:underline">{t('coAskQuestion')}</button></div>
            </Card>
          ))}
        </div>
      </div>

      {/* Challenges */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🏆</span><h2 className="font-heading text-lg font-semibold">{t('coChallenges')}</h2></div>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {CHALLENGES.map((ch) => {
            const joined = joinedChallenge(ch.id)
            return (
              <Card key={ch.id} className={joined ? 'border-accent-primary/25 bg-accent-primary/[0.05]' : ''}>
                <div className="flex items-center gap-2"><span className="text-2xl">{ch.emoji}</span><div className="flex-1"><p className="font-heading text-[0.88rem] font-semibold">{t(ch.key)}</p><p className="text-[0.7rem] text-text-muted">{fill(t, 'coChDays', { d: ch.days })} · +{ch.xp} XP</p></div></div>
                <p className="mt-2 text-[0.78rem] leading-relaxed text-text-secondary">{t(ch.descKey)}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[0.7rem] text-text-muted">{fill(t, 'coChJoined', { n: ch.participants.toLocaleString() })}</span>
                  <Button size="sm" variant={joined ? 'ghost' : 'secondary'} onClick={() => { toggleChallenge(ch.id); bump() }}>{joined ? '✓ ' + t('coJoined') : t('coJoinChallenge')}</Button>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Wellness buddies */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🤝</span><h2 className="font-heading text-lg font-semibold">{t('coBuddies')}</h2></div>
        <p className="mb-3 text-caption text-text-muted">{t('coBuddiesSub')}</p>
        <div className="space-y-2">
          {SUGGESTED_BUDDIES.map((b) => {
            const on = isBuddy(b.id)
            return (
              <Card key={b.id} className="flex items-center gap-3">
                <span className="text-2xl">{b.avatar}</span>
                <div className="min-w-0 flex-1"><p className="font-heading text-[0.88rem] font-semibold">{t(b.nameKey)}</p><p className="text-[0.72rem] text-text-muted">🎯 {t(b.goalKey)} · ✨ {t(b.matchKey)}</p></div>
                <Button size="sm" variant={on ? 'ghost' : 'secondary'} onClick={() => { toggleBuddy(b.id); bump() }}>{on ? '✓ ' + t('coConnected') : t('coConnect')}</Button>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Events */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🎥</span><h2 className="font-heading text-lg font-semibold">{t('coEvents')}</h2></div>
        <div className="space-y-2">
          {EVENTS.map((e) => {
            const reg = isRegistered(e.id)
            return (
              <Card key={e.id} className="flex items-center gap-3">
                <span className="text-2xl">{e.emoji}</span>
                <div className="min-w-0 flex-1"><p className="font-heading text-[0.88rem] font-semibold">{t(e.titleKey)}</p><p className="text-[0.72rem] text-text-muted">{t(e.typeKey)} · {t(e.whenKey)}</p></div>
                <Button size="sm" variant={reg ? 'ghost' : 'secondary'} onClick={() => { toggleEvent(e.id); bump() }}>{reg ? '✓ ' + t('coRegistered') : t('coRegister')}</Button>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Success stories */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🌟</span><h2 className="font-heading text-lg font-semibold">{t('coStories')}</h2></div>
        <div className="space-y-2">
          {SUCCESS_STORIES.map((s) => (
            <Card key={s.id} className="bg-gradient-to-br from-[#a78bfa]/[0.08] to-transparent">
              <p className="flex items-center gap-2 font-heading text-[0.9rem] font-semibold">{s.emoji} {t(s.titleKey)}</p>
              <p className="mt-1 text-[0.84rem] leading-relaxed text-text-secondary">{t(s.bodyKey)}</p>
            </Card>
          ))}
        </div>
        <p className="mt-2 text-[0.72rem] text-text-muted">{t('coStoriesNote')}</p>
      </div>
    </div>
  )
}

// ── SAFETY ────────────────────────────────────────────────────────────────────
function SafetyTab({ t, tick, bump }) {
  const rep = useMemo(() => reputation(), [tick])
  const c = useMemo(() => getCommunity(), [tick])
  return (
    <div className="space-y-6">
      {/* Guidelines */}
      <div>
        <div className="mb-3 flex items-center gap-2"><ShieldIcon size={16} className="text-success" /><h2 className="font-heading text-lg font-semibold">{t('coGuidelines')}</h2></div>
        <Card>
          <ul className="space-y-2">
            {GUIDELINES.map((g) => <li key={g} className="flex items-start gap-2 text-[0.86rem] text-text-secondary"><span className="text-success">✓</span> {t(g)}</li>)}
          </ul>
        </Card>
      </div>

      {/* Reputation (kindness, not popularity) */}
      <div>
        <div className="mb-1 flex items-center gap-2"><span>💖</span><h2 className="font-heading text-lg font-semibold">{t('coReputation')}</h2></div>
        <p className="mb-3 text-caption text-text-muted">{t('coReputationSub')}</p>
        <Card>
          <div className="flex flex-wrap gap-2">
            {rep.badges.map((b) => (
              <div key={b.id} className={`flex items-center gap-1.5 rounded-pill border px-3 py-1.5 text-[0.74rem] ${b.earned ? 'border-accent-primary/30 bg-accent-primary/10 text-text-primary' : 'border-white/[0.06] text-text-muted opacity-50'}`}>{b.emoji} {t(b.key)}</div>
            ))}
          </div>
        </Card>
      </div>

      {/* AI moderation + reporting */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🤖</span><h2 className="font-heading text-lg font-semibold">{t('coModeration')}</h2></div>
        <Card>
          <p className="text-[0.86rem] leading-relaxed text-text-secondary">{t('coModerationDesc')}</p>
          <p className="mb-2 mt-3 text-caption font-semibold text-text-secondary">{t('coModStates')}</p>
          <div className="flex flex-wrap gap-1.5">
            {MOD_STATES.map((m) => <span key={m} className="rounded-pill bg-white/[0.05] px-2.5 py-1 text-[0.7rem] text-text-secondary">{t(m)}</span>)}
          </div>
          <p className="mt-3 text-[0.78rem] text-text-muted">{fill(t, 'coReportsFiled', { n: c.reports.length })}</p>
        </Card>
      </div>

      {/* Privacy controls */}
      <div>
        <div className="mb-3 flex items-center gap-2"><span>🔒</span><h2 className="font-heading text-lg font-semibold">{t('coPrivacyCom')}</h2></div>
        <Card>
          <ul className="space-y-2">
            {['coPrivProfile', 'coPrivPosts', 'coPrivMessages', 'coPrivMembership', 'coPrivAnon'].map((k) => (
              <li key={k} className="flex items-start gap-2 text-[0.84rem] text-text-secondary"><span>🔹</span> {t(k)}</li>
            ))}
          </ul>
          <p className="mt-3 text-[0.78rem] text-text-muted">🛡️ {t('coPrivacyComNote')}</p>
        </Card>
      </div>
    </div>
  )
}

function ReportModal({ t, target, onClose, onDone }) {
  const [reason, setReason] = useState(null)
  const [note, setNote] = useState('')
  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl border border-white/10 bg-bg-card p-6 shadow-lift animate-fade-up sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="float-right text-text-muted hover:text-text-primary">✕</button>
        <h3 className="font-heading text-lg font-semibold">{t('coReportTitle')}</h3>
        <p className="mt-1 text-caption text-text-secondary">{t('coReportSub')}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {REPORT_REASONS.map((r) => <button key={r} onClick={() => setReason(r)} className={`rounded-pill px-3 py-1.5 text-[0.74rem] transition ${reason === r ? 'bg-accent-primary text-bg-primary' : 'border border-white/10 text-text-secondary hover:text-text-primary'}`}>{t(r)}</button>)}
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder={t('coReportNote')} className="mt-3 w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-caption outline-none focus:border-accent-primary/50" />
        <Button className="mt-3 w-full" disabled={!reason} onClick={() => { reportContent(target.id, reason, note); onDone() }}>{t('coSubmitReport')}</Button>
        <p className="mt-2 text-center text-[0.72rem] text-text-muted">{t('coReportHuman')}</p>
      </div>
    </div>
  )
}
