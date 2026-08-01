import { useEffect, useRef, useState } from 'react'
import introVideo from '../assets/videos/mira-logo-intro.mp4'

/**
 * Full-screen MIRA logo intro — plays once, every time the app opens, before
 * routing continues as normal (Welcome / dashboard, unchanged). Falls back to
 * a timer matching the clip's own length in case autoplay is blocked or the
 * video fails to load, so a visitor is never stuck on the splash.
 */
export default function IntroSplash({ onDone }) {
  const videoRef = useRef(null)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const finish = () => {
      setFading(true)
      setTimeout(onDone, 350) // match the fade-out below
    }
    const fallback = setTimeout(finish, 7000)
    const video = videoRef.current
    video?.play?.().catch(() => {})
    return () => clearTimeout(fallback)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function finishNow() {
    setFading(true)
    setTimeout(onDone, 350)
  }

  return (
    <div
      className="fixed inset-0 z-[999] grid place-items-center bg-black transition-opacity duration-300"
      style={{ opacity: fading ? 0 : 1 }}
    >
      <video
        ref={videoRef}
        src={introVideo}
        autoPlay
        muted
        playsInline
        onEnded={finishNow}
        onError={finishNow}
        className="h-full w-full object-contain"
      />
    </div>
  )
}
