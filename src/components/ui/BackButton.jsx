import { useNavigate } from 'react-router-dom'

/**
 * Returns to wherever the user actually came from (browser history) instead
 * of a hardcoded destination, so "back" never drops users on the wrong screen.
 * Falls back to a fixed path only when there's no in-app history to go back to
 * (e.g. a direct deep link).
 */
export default function BackButton({ fallback = '/home', className = '', children }) {
  const navigate = useNavigate()
  function go() {
    if (window.history.length > 2) navigate(-1)
    else navigate(fallback)
  }
  return (
    <button type="button" onClick={go} className={className}>
      {children}
    </button>
  )
}
