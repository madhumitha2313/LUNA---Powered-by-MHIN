/**
 * Sample data for the MIRA Operations Console (Part 18). This is clearly-
 * labelled DEMO data for the admin UI — aggregate metrics and placeholder
 * records, never real users' health data. In production these would come from
 * a permissioned, audited backend.
 */

export const KPIS = [
  { key: 'kpiTotal', value: '128,420', delta: '+4.2%', up: true, emoji: '👥' },
  { key: 'kpiDau', value: '24,310', delta: '+2.1%', up: true, emoji: '🟢' },
  { key: 'kpiMau', value: '89,200', delta: '+6.8%', up: true, emoji: '📈' },
  { key: 'kpiPremium', value: '9,840', delta: '+1.4%', up: true, emoji: '⭐' },
  { key: 'kpiNew', value: '612', delta: 'today', up: true, emoji: '✨' },
  { key: 'kpiRetention', value: '68%', delta: '30-day', up: true, emoji: '🔁' },
  { key: 'kpiAi', value: '342,100', delta: 'this week', up: true, emoji: '🧠' },
  { key: 'kpiReports', value: '12,840', delta: 'uploaded', up: true, emoji: '📄' },
  { key: 'kpiCrash', value: '0.4%', delta: 'crash rate', up: false, emoji: '🛡️' },
  { key: 'kpiSession', value: '6m 12s', delta: 'avg session', up: true, emoji: '⏱️' },
]

// Monthly registered-user totals (thousands) — single-series line.
export const USER_GROWTH = [
  { m: 'Jan', v: 42 }, { m: 'Feb', v: 55 }, { m: 'Mar', v: 63 }, { m: 'Apr', v: 74 },
  { m: 'May', v: 88 }, { m: 'Jun', v: 101 }, { m: 'Jul', v: 118 }, { m: 'Aug', v: 128 },
]

// Feature usage share (%) — single measure, magnitude.
export const FEATURE_USAGE = [
  ['Talk with Mira', 86], ['Cycle', 78], ['Mood', 64], ['Nutrition', 57],
  ['Guide', 49], ['Journey', 41], ['Planner', 33], ['Safety', 12],
]

export const LANGUAGES = [
  ['English', 46], ['Tamil', 22], ['Hindi', 14], ['Telugu', 7], ['Malayalam', 6], ['Others', 5],
]

export const USERS = [
  { id: 'U-10482', name: 'Ananya R.', country: 'IN', lang: 'Tamil', plan: 'Premium', last: '2m ago', status: 'active' },
  { id: 'U-10483', name: 'Priya S.', country: 'IN', lang: 'Hindi', plan: 'Free', last: '1h ago', status: 'active' },
  { id: 'U-10488', name: 'Meera K.', country: 'IN', lang: 'Malayalam', plan: 'Premium', last: '3h ago', status: 'active' },
  { id: 'U-10501', name: 'Divya N.', country: 'IN', lang: 'Telugu', plan: 'Free', last: '1d ago', status: 'active' },
  { id: 'U-10514', name: 'Sana M.', country: 'AE', lang: 'English', plan: 'Premium', last: '2d ago', status: 'suspended' },
  { id: 'U-10530', name: 'Kavya P.', country: 'IN', lang: 'Tamil', plan: 'Free', last: '5d ago', status: 'inactive' },
]

export const AI_CENTER = [
  { key: 'aiModel', value: 'mira-reason-v4' },
  { key: 'aiPrompt', value: 'v18.2 (live)' },
  { key: 'aiLatency', value: '1.24s', tone: 'good' },
  { key: 'aiHallucination', value: '0.6%', tone: 'good' },
  { key: 'aiSafety', value: '3 open', tone: 'warn' },
  { key: 'aiSat', value: '4.6 / 5', tone: 'good' },
]

export const PROMPTS = [
  { v: 'v18.2', author: 'A. Rao', when: '2h ago', status: 'live', reason: 'Softened luteal-phase wording' },
  { v: 'v18.1', author: 'A. Rao', when: '3d ago', status: 'archived', reason: 'Added Tamil code-mix examples' },
  { v: 'v18.0', author: 'S. Iyer', when: '2w ago', status: 'archived', reason: 'Safety guardrail refresh' },
]

export const CMS = [
  { title: 'Understanding PCOS', cat: 'PCOS', lang: 'EN', status: 'published' },
  { title: 'First Period Guide', cat: 'First Period', lang: 'TA', status: 'published' },
  { title: 'Iron & your cycle', cat: 'Nutrition', lang: 'EN', status: 'review' },
  { title: 'Luteal-phase self-care', cat: 'Mental Wellness', lang: 'HI', status: 'draft' },
  { title: 'Endometriosis explained', cat: 'Conditions', lang: 'EN', status: 'review' },
]

export const DOCTORS = [
  { name: 'Dr. Lakshmi Menon', spec: 'Gynaecologist', city: 'Chennai', exp: '14y', status: 'verified' },
  { name: 'Dr. Ritu Sharma', spec: 'Endocrinologist', city: 'Delhi', exp: '11y', status: 'pending' },
  { name: 'Dr. Fatima Ali', spec: 'Gynaecologist', city: 'Kochi', exp: '9y', status: 'verified' },
  { name: 'Dr. Nisha Rao', spec: 'Nutritionist', city: 'Bengaluru', exp: '7y', status: 'pending' },
]

export const HOSPITALS = [
  { name: 'Apollo Women’s Centre', city: 'Chennai', type: 'Women’s clinic', emg: true },
  { name: 'Fortis Maternity', city: 'Bengaluru', type: 'Maternity', emg: true },
  { name: 'City Diagnostics Lab', city: 'Kochi', type: 'Laboratory', emg: false },
]

export const FLAGS = [
  { key: 'flgDigitalTwin', on: true, rollout: '100%' },
  { key: 'flgMoodRoom', on: true, rollout: '100%' },
  { key: 'flgVideoLessons', on: false, rollout: 'Beta · 5%' },
  { key: 'flgTelemedicine', on: false, rollout: 'Internal' },
  { key: 'flgMaintenance', on: false, rollout: 'Off' },
]

export const TICKETS = [
  { id: 'T-4821', cat: 'AI Response', status: 'open', when: '10m ago' },
  { id: 'T-4818', cat: 'Bug', status: 'in progress', when: '1h ago' },
  { id: 'T-4809', cat: 'Feedback', status: 'resolved', when: '4h ago' },
  { id: 'T-4801', cat: 'Health Content', status: 'assigned', when: '1d ago' },
]

export const AUDIT = [
  { who: 'A. Rao (Admin)', action: 'Published prompt v18.2', when: '2h ago' },
  { who: 'S. Iyer (Super Admin)', action: 'Enabled flag: Video Lessons (Beta)', when: '5h ago' },
  { who: 'M. Nair (Moderator)', action: 'Approved article “Iron & your cycle”', when: '6h ago' },
  { who: 'System', action: 'Nightly analytics export (CSV)', when: '12h ago' },
]

// Which console sections each role may see (permission demo).
export const ROLE_SECTIONS = {
  superadmin: ['overview', 'users', 'ai', 'cms', 'doctors', 'flags', 'support', 'audit'],
  admin: ['overview', 'users', 'ai', 'cms', 'doctors', 'support'],
  moderator: ['overview', 'cms', 'support'],
  doctor: ['doctor'],
  nutritionist: ['nutritionist'],
}
export const ROLES = [
  { id: 'superadmin', key: 'roleSuper', emoji: '🛡️' },
  { id: 'admin', key: 'roleAdmin', emoji: '⚙️' },
  { id: 'moderator', key: 'roleMod', emoji: '🔍' },
  { id: 'doctor', key: 'roleDoctor', emoji: '🩺' },
  { id: 'nutritionist', key: 'roleNutri', emoji: '🥗' },
]
