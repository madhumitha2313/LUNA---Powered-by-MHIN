/**
 * Editorial hero illustration — a woman reaching toward a glowing moon under a
 * dark starry sky, with botanical leaf accents and soft pink lighting.
 *
 * Built entirely from vectors + gradients so it stays crisp at any size, needs
 * no external asset, and inherits the design tokens. Replace with commissioned
 * editorial art later if desired — the layout reserves the same footprint.
 */
export default function MoonScene({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <svg
        viewBox="0 0 480 480"
        className="h-full w-full"
        role="img"
        aria-label="A woman reaching toward a glowing moon in a starry sky"
      >
        <defs>
          <radialGradient id="ms-moon" cx="40%" cy="36%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#F5C6D6" />
            <stop offset="70%" stopColor="#D97BA8" />
            <stop offset="100%" stopColor="#A78BFA" />
          </radialGradient>
          <radialGradient id="ms-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D97BA8" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#A78BFA" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ms-fig" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2A3346" />
            <stop offset="100%" stopColor="#0D1117" />
          </linearGradient>
          <linearGradient id="ms-leaf" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6EE7B7" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* Ambient halo */}
        <circle cx="250" cy="190" r="210" fill="url(#ms-halo)" />

        {/* Orbital ring */}
        <ellipse
          cx="250"
          cy="190"
          rx="168"
          ry="168"
          fill="none"
          stroke="rgba(245,198,214,0.18)"
          strokeWidth="1"
          strokeDasharray="2 7"
        />

        {/* The moon */}
        <circle cx="250" cy="178" r="104" fill="url(#ms-moon)" />
        {/* Craters — subtle darker overlays */}
        <circle cx="220" cy="150" r="16" fill="#D97BA8" opacity="0.28" />
        <circle cx="280" cy="200" r="22" fill="#A78BFA" opacity="0.22" />
        <circle cx="262" cy="138" r="9" fill="#A78BFA" opacity="0.25" />
        <circle cx="226" cy="206" r="11" fill="#D97BA8" opacity="0.22" />

        {/* Botanical leaf accents */}
        <g stroke="url(#ms-leaf)" strokeWidth="1.6" fill="none" strokeLinecap="round">
          <path d="M78 360c34-10 58-34 70-72" />
          <path d="M96 330c14-2 26-10 32-24" />
          <path d="M110 352c16 0 30-6 40-20" />
          <path d="M402 360c-34-10-58-34-70-72" />
          <path d="M384 330c-14-2-26-10-32-24" />
          <path d="M370 352c-16 0-30-6-40-20" />
        </g>
        <g fill="url(#ms-leaf)" opacity="0.7">
          <ellipse cx="150" cy="289" rx="7" ry="16" transform="rotate(38 150 289)" />
          <ellipse cx="350" cy="289" rx="7" ry="16" transform="rotate(-38 350 289)" />
        </g>

        {/* Reaching figure silhouette */}
        <g fill="url(#ms-fig)">
          {/* head */}
          <circle cx="250" cy="318" r="17" />
          {/* torso + flowing gown */}
          <path d="M250 333c-30 0-44 22-50 56-5 28-9 55-9 71h118c0-16-4-43-9-71-6-34-20-56-50-56Z" />
          {/* raised arm reaching to moon */}
          <path
            d="M250 340c-4-14-2-30 8-52 6-13 18-30 30-44"
            stroke="url(#ms-fig)"
            strokeWidth="11"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Foreground horizon glow */}
        <ellipse cx="250" cy="468" rx="190" ry="30" fill="url(#ms-halo)" opacity="0.6" />
      </svg>

      {/* Floating stars layered over the SVG for parallax-y twinkle */}
      <Star className="left-[8%] top-[14%]" size={3} delay="0s" />
      <Star className="left-[82%] top-[10%]" size={4} delay="1.2s" />
      <Star className="left-[70%] top-[28%]" size={2} delay="0.6s" />
      <Star className="left-[20%] top-[34%]" size={2} delay="2.1s" />
      <Star className="left-[88%] top-[44%]" size={3} delay="1.6s" />
      <Star className="left-[12%] top-[54%]" size={2} delay="0.9s" />
    </div>
  )
}

function Star({ className = '', size = 3, delay = '0s' }) {
  return (
    <span
      className={`absolute rounded-full bg-accent-secondary shadow-[0_0_8px_2px_rgba(245,198,214,0.7)] animate-float ${className}`}
      style={{ width: size, height: size, animationDelay: delay }}
    />
  )
}
