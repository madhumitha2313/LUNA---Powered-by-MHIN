# LUNA · powered by MHIN

A Tamil-voice-first menstrual health companion. Speak naturally; LUNA turns the
conversation into structured, trustworthy health intelligence you can understand
and share with a doctor when it matters.

> LUNA surfaces **risk indicators** and **patterns worth discussing with a
> doctor** — never a diagnosis.

---

## Status (what's built vs. pending)

| Phase | Scope | Status |
|------|-------|--------|
| Design system | "Moonlight Serenity" tokens (color/type/motion/components) | ✅ Built & reused everywhere |
| Step 0 | Connection verification script (Appwrite + Anthropic round-trips) | ✅ Script ready — needs real keys to pass |
| Phase 1 | Landing page (hero, problem, features, trust) | ✅ Built — full design treatment |
| Phase 2 | Voice screen | 🟡 UI shell built (orb, chips, confidence). **Live capture blocked on voice-provider decision** |
| Phases 3–12 | Dashboard, intelligence, timeline, insights, upload, doctor, community, sustainability, settings, SMS | ⬜ Pending (need credentials + provider) |

**Blocked on you:** the Tamil STT/TTS provider choice, plus real credentials
(Appwrite project + API key, Anthropic key). See `.env.example`.

---

## Design system — "Moonlight Serenity"

The token set is the single source of truth and is expressed three ways, all in
lockstep:

- **CSS variables** — `src/index.css` (canonical color values)
- **Tailwind theme** — `tailwind.config.js` (utilities resolve to the CSS vars)
- **JS tokens** — `src/theme/tokens.js` (for canvas/SVG/JS interpolation)

Rules enforced in code: 24px card radius, soft shadows (no hard drop-shadows),
glass blur on the nav bar **only**, 250ms house easing everywhere, rounded line
icons, no neon, no ad-hoc per-component colors. Fonts: General Sans (headings),
Inter (body), Manrope (numbers/stats).

---

## Tech stack

- **Frontend:** React + Vite + Tailwind (theme extended with the tokens)
- **Backend/DB:** Appwrite Cloud (document-level permissions)
- **AI:** Anthropic API — server-side only, **never** called from the browser
- **Voice:** Tamil STT/TTS — *provider pending*
- **Hosting:** Vercel/Netlify + Appwrite Cloud (target)

### Trust boundary

`VITE_*` env vars are bundled into the browser — **public values only**. Secrets
(Anthropic key, Appwrite server API key, voice keys) stay server-side and are
reached through server functions. See `src/lib/anthropic.js` and `src/lib/voice.js`.

Raw voice audio is **never persisted**: `transcribeAndDiscard()` in
`src/lib/voice.js` discards the audio blob in a `finally` block immediately after
transcription — it is never written to storage or the database.

---

## Getting started

```bash
npm install
cp .env.example .env        # then fill in real credentials (Appwrite, Anthropic, Sarvam)

npm run verify:connections  # Step 0 — confirms real Appwrite + Anthropic round-trips
npm run appwrite:bootstrap  # provision the 3 collections + document-level permissions

# Secret-holding proxy (Anthropic + Sarvam Tamil STT/TTS):
cd server && npm install && cd ..
npm run server              # http://localhost:8787  (set VITE_FUNCTIONS_BASE_URL to this)

npm run dev                 # http://localhost:5173
npm run build               # production build
```

The browser never holds a secret: `/extract`, `/stt`, `/tts` all run on the
`server/` proxy, which is the only process that sees the Anthropic and Sarvam
keys.

`verify:connections` reports each check as PASS / FAIL / SKIP. Checks whose env
is missing are SKIPPED (not failed), so you can run it as credentials arrive.

---

## Project structure

```
src/
  index.css                 # design tokens (CSS vars) + base styles
  theme/tokens.js           # JS mirror of the tokens
  lib/
    config.js               # browser-safe runtime config (VITE_*)
    anthropic.js            # AI calls — routed through server function
    voice.js                # STT/TTS integration + audio-discard path
  components/
    ui/                     # Button, Card, Badge, icons — token-driven primitives
    layout/                 # Navbar (glass), Footer, TrustBar
    voice/                  # VoiceOrb, ExtractionChip, ConfidenceMeter
    illustrations/          # MoonScene (editorial hero, pure vector)
  sections/landing/         # Hero, Problem, Features, ClosingCTA
  pages/                    # Landing, Voice
scripts/
  verify-connections.mjs    # Step 0
```

---

## Privacy & safety guarantees (enforced, not just claimed)

- **k≥10 suppression** (Phase 9) — named exactly that in code/UI; *not*
  differential privacy.
- **No diagnoses** — outputs are framed as risk indicators / patterns.
- **Voice discarded after processing** — see the `finally` block in `voice.js`.
- **No mocked data** anywhere except the explicitly-flagged Phase 9 seed script.
