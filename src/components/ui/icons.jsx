/**
 * Rounded line icons — stroke-based, inherit currentColor, consistent 1.6 weight.
 * No clipart, no filled glyphs. Keep additions in the same visual style.
 */
function Svg({ children, size = 22, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

export const MicIcon = (p) => (
  <Svg {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <path d="M12 18v3" />
  </Svg>
)

export const SparklesIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3Z" />
    <path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z" />
  </Svg>
)

export const FileIcon = (p) => (
  <Svg {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h6" />
  </Svg>
)

export const TrendIcon = (p) => (
  <Svg {...p}>
    <path d="M3 17l6-6 4 4 7-7" />
    <path d="M17 8h4v4" />
  </Svg>
)

export const StethoscopeIcon = (p) => (
  <Svg {...p}>
    <path d="M5 3v6a4 4 0 0 0 8 0V3" />
    <path d="M5 3H3.5M13 3h1.5" />
    <path d="M9 13v3a5 5 0 0 0 10 0v-1" />
    <circle cx="19" cy="13" r="2" />
  </Svg>
)

export const UsersIcon = (p) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.2a3.2 3.2 0 0 1 0 6.1" />
    <path d="M17.5 14.4A5.5 5.5 0 0 1 20.5 19.5" />
  </Svg>
)

export const ShieldIcon = (p) => (
  <Svg {...p}>
    <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
    <path d="M9 12l2 2 4-4" />
  </Svg>
)

export const LeafIcon = (p) => (
  <Svg {...p}>
    <path d="M5 19c0-8 6-13 14-13 0 8-5 14-13 14a6 6 0 0 1-1-1Z" />
    <path d="M9 15c2.5-2.5 5-4 8-5" />
  </Svg>
)

export const MoonIcon = (p) => (
  <Svg {...p}>
    <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
  </Svg>
)

export const PlayIcon = (p) => (
  <Svg {...p}>
    <path d="M8 5.5v13l11-6.5L8 5.5Z" />
  </Svg>
)

export const ArrowRightIcon = (p) => (
  <Svg {...p}>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </Svg>
)

export const LockIcon = (p) => (
  <Svg {...p}>
    <rect x="5" y="11" width="14" height="9" rx="2.5" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    <path d="M12 15v2" />
  </Svg>
)

export const HeartIcon = (p) => (
  <Svg {...p}>
    <path d="M12 20s-7-4.4-9.2-9A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 9.2 5c-2.2 4.6-9.2 9-9.2 9Z" />
  </Svg>
)

export const BrainIcon = (p) => (
  <Svg {...p}>
    <path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-1 5.8A3 3 0 0 0 7 18a3 3 0 0 0 5 1" />
    <path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 1 5.8A3 3 0 0 1 17 18a3 3 0 0 1-5 1" />
    <path d="M12 5v14" />
  </Svg>
)

export const PauseIcon = (p) => (
  <Svg {...p}>
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </Svg>
)

export const FullscreenIcon = (p) => (
  <Svg {...p}>
    <path d="M4 9V5a1 1 0 0 1 1-1h4" />
    <path d="M20 9V5a1 1 0 0 0-1-1h-4" />
    <path d="M4 15v4a1 1 0 0 0 1 1h4" />
    <path d="M20 15v4a1 1 0 0 1-1 1h-4" />
  </Svg>
)

export const PipIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="4" width="18" height="14" rx="2" />
    <rect x="12" y="11" width="7" height="5" rx="1" fill="currentColor" stroke="none" />
  </Svg>
)

export const XIcon = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
)

export const ChevronDownIcon = (p) => (
  <Svg {...p}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
)

export const CheckCircleIcon = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.3 2.3L16 10" />
  </Svg>
)

export const BookmarkIcon = (p) => (
  <Svg {...p}>
    <path d="M6 4h12a1 1 0 0 1 1 1v15l-7-4-7 4V5a1 1 0 0 1 1-1Z" />
  </Svg>
)

export const ShareIcon = (p) => (
  <Svg {...p}>
    <circle cx="18" cy="5" r="2.4" />
    <circle cx="6" cy="12" r="2.4" />
    <circle cx="18" cy="19" r="2.4" />
    <path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6" />
  </Svg>
)
