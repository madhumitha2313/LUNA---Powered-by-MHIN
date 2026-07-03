import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, HashRouter } from 'react-router-dom'
import App from './App.jsx'
import { LanguageProvider } from './lib/i18n.jsx'
import './index.css'

// The single-file / file:// preview uses hash routing so navigation works with
// no server; normal builds use clean path-based routing. Vite injects BASE_URL
// from the `base` config; strip the trailing slash for the router basename.
const useHash = import.meta.env.VITE_HASH_ROUTER === 'true'
const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

const Router = useHash ? HashRouter : BrowserRouter
const routerProps = useHash ? {} : { basename }

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router {...routerProps}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </Router>
  </React.StrictMode>
)
