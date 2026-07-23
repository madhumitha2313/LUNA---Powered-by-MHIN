import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import { AppShell } from './App.jsx'
import { LanguageProvider } from './lib/i18n.jsx'
import './index.css'

// The single-file / file:// preview uses hash routing so navigation works with
// no server; normal builds use clean path-based routing. Vite injects BASE_URL
// from the `base` config; strip the trailing slash for the router basename.
const useHash = import.meta.env.VITE_HASH_ROUTER === 'true'
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

// Preview / demo build (hash router): set the initial route BEFORE the router
// mounts so a fresh (re)open always resolves auth first. A signed-out visitor
// lands on the welcome/splash screen (welcome → login / sign up); a returning
// signed-in user has their session restored straight to the dashboard. Setting
// the hash here (pre-mount) avoids the router desync of redirecting during
// React's first render. In-app navigation never reloads, so this runs once.
if (useHash) {
  const authed = (() => { try { return !!localStorage.getItem('mira.session.v1') } catch { return false } })()
  const path = window.location.hash.replace(/^#/, '').split('?')[0]
  const authPages = ['/welcome', '/login', '/signup']
  const publicFlow = [...authPages, '/onboarding', '/terms', '/privacy']
  if (!authed && !publicFlow.includes(path)) window.location.hash = '#/welcome'
  else if (authed && authPages.includes(path)) window.location.hash = '#/home'
}

const Router = useHash ? HashRouter : BrowserRouter
const routerProps = useHash ? {} : { basename }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router {...routerProps}>
      <LanguageProvider>
        <AppShell />
      </LanguageProvider>
    </Router>
  </React.StrictMode>
)
