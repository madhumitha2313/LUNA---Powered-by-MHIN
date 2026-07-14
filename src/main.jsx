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

// Preview / demo build (hash router): force the URL to the onboarding route
// BEFORE the router mounts, on every fresh page load. This guarantees the logo
// + flow always show when the file or hosted preview is (re)opened, even if the
// last session left the URL at #/home or stored the "onboarded" flag. Setting
// the hash here (pre-mount) avoids the router desync you'd get from redirecting
// during React's first render. In-app navigation after onboarding is untouched
// because it never reloads the page (so this line doesn't run again).
if (useHash) {
  const path = window.location.hash.replace(/^#/, '').split('?')[0]
  if (path !== '/onboarding') window.location.hash = '#/onboarding'
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
