import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { PlayIcon, PauseIcon, FullscreenIcon, PipIcon, VolumeIcon, MuteIcon } from './ui/icons'

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2]

/**
 * Custom-chrome video player: play/pause, fullscreen, Picture-in-Picture,
 * playback speed, click-to-seek progress bar, resume-from-last-position, a
 * loading skeleton, and responsive sizing. Reports playback progress upward
 * so the surrounding modal can sync educational sections to it. Exposes
 * seek(fraction) via ref so an external timeline can jump the video itself.
 */
const VideoPlayer = forwardRef(function VideoPlayer({ src, poster, initialTime = 0, onTimeUpdate, onEnded, className = '' }, ref) {
  const videoRef = useRef(null)
  const wrapRef = useRef(null)
  const [ready, setReady] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [time, setTime] = useState(initialTime)
  const [duration, setDuration] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [speedOpen, setSpeedOpen] = useState(false)
  const [pipSupported, setPipSupported] = useState(false)
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [volumeOpen, setVolumeOpen] = useState(false)
  const seekedRef = useRef(false)

  useEffect(() => {
    setPipSupported(typeof document !== 'undefined' && !!document.pictureInPictureEnabled)
  }, [])

  function onLoadedMetadata() {
    const v = videoRef.current
    if (!v) return
    setDuration(v.duration || 0)
    if (initialTime > 0 && initialTime < v.duration && !seekedRef.current) {
      v.currentTime = initialTime
      seekedRef.current = true
    }
    setReady(true)
  }
  function onTime() {
    const v = videoRef.current
    if (!v) return
    setTime(v.currentTime)
    onTimeUpdate?.(v.currentTime, v.duration || 0)
  }
  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) v.play().catch(() => {})
    else v.pause()
  }
  function seekTo(fraction) {
    const v = videoRef.current
    if (!v || !duration) return
    v.currentTime = Math.max(0, Math.min(1, fraction)) * duration
  }
  useImperativeHandle(ref, () => ({ seek: seekTo }))
  function onBarClick(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    seekTo((e.clientX - rect.left) / rect.width)
  }
  function setPlaybackSpeed(s) {
    setSpeed(s)
    if (videoRef.current) videoRef.current.playbackRate = s
    setSpeedOpen(false)
  }
  function toggleMute() {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }
  function changeVolume(next) {
    const v = videoRef.current
    if (!v) return
    const vol = Math.max(0, Math.min(1, next))
    v.volume = vol
    v.muted = vol === 0
    setVolume(vol)
    setMuted(vol === 0)
  }
  function toggleFullscreen() {
    const el = wrapRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen?.()
    else el.requestFullscreen?.()
  }
  async function togglePip() {
    const v = videoRef.current
    if (!v) return
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture()
      else await v.requestPictureInPicture()
    } catch { /* PiP unsupported/blocked — silently ignore */ }
  }

  const pct = duration ? (time / duration) * 100 : 0
  const fmt = (s) => {
    if (!Number.isFinite(s)) return '0:00'
    const m = Math.floor(s / 60), r = Math.floor(s % 60)
    return `${m}:${String(r).padStart(2, '0')}`
  }

  return (
    <div ref={wrapRef} className={`group relative aspect-video w-full overflow-hidden rounded-2xl bg-black ${className}`}>
      {!ready && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/[0.06] via-white/[0.03] to-white/[0.06]" />
      )}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="h-full w-full object-cover"
        onLoadedMetadata={onLoadedMetadata}
        onTimeUpdate={onTime}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); onEnded?.() }}
        playsInline
      />

      {/* Center play/pause tap target */}
      <button
        type="button"
        onClick={togglePlay}
        aria-label={playing ? 'Pause' : 'Play'}
        className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors"
      >
        {!playing && ready && (
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 text-bg-primary shadow-lift transition-transform duration-250 group-hover:scale-105">
            <PlayIcon size={26} className="ml-1" />
          </span>
        )}
      </button>

      {/* Controls bar */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-2.5 pt-8 opacity-0 transition-opacity duration-250 group-hover:opacity-100 focus-within:opacity-100">
        <div
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pct)}
          onClick={onBarClick}
          className="relative mb-2.5 h-1.5 w-full cursor-pointer rounded-pill bg-white/25"
        >
          <div className="absolute inset-y-0 left-0 rounded-pill bg-accent-primary" style={{ width: `${pct}%` }} />
          <div className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `calc(${pct}% - 6px)` }} />
        </div>

        <div className="flex items-center gap-3 text-white">
          <button type="button" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} className="shrink-0">
            {playing ? <PauseIcon size={18} /> : <PlayIcon size={18} />}
          </button>
          <span className="font-stat text-[0.72rem] tabular-nums text-white/80">{fmt(time)} / {fmt(duration)}</span>

          <div className="ml-auto flex items-center gap-3">
            <div
              className="group/vol relative flex items-center"
              onMouseEnter={() => setVolumeOpen(true)}
              onMouseLeave={() => setVolumeOpen(false)}
            >
              <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} className="text-white/85 hover:text-white">
                {muted || volume === 0 ? <MuteIcon size={17} /> : <VolumeIcon size={17} />}
              </button>
              <div className={`overflow-hidden transition-all duration-200 ${volumeOpen ? 'ml-1.5 w-16' : 'w-0'}`}>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={muted ? 0 : volume}
                  onChange={(e) => changeVolume(Number(e.target.value))}
                  aria-label="Volume"
                  className="h-1 w-16 accent-accent-primary"
                />
              </div>
            </div>
            <span className="rounded-md border border-white/15 px-1.5 py-0.5 text-[0.64rem] font-medium text-white/70" title="Automatically matches quality to your connection">
              Auto
            </span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setSpeedOpen((o) => !o)}
                className="rounded-md px-1.5 py-0.5 text-[0.72rem] font-medium text-white/85 hover:bg-white/10"
              >
                {speed}×
              </button>
              {speedOpen && (
                <div className="absolute bottom-7 right-0 w-16 overflow-hidden rounded-lg border border-white/10 bg-bg-card shadow-lift">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      onClick={() => setPlaybackSpeed(s)}
                      className={`block w-full px-2.5 py-1.5 text-left text-[0.78rem] hover:bg-white/10 ${s === speed ? 'text-accent-secondary' : 'text-text-secondary'}`}
                    >
                      {s}×
                    </button>
                  ))}
                </div>
              )}
            </div>
            {pipSupported && (
              <button type="button" onClick={togglePip} aria-label="Picture in picture" className="text-white/85 hover:text-white">
                <PipIcon size={17} />
              </button>
            )}
            <button type="button" onClick={toggleFullscreen} aria-label="Fullscreen" className="text-white/85 hover:text-white">
              <FullscreenIcon size={17} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})
export default VideoPlayer
