import { ShieldIcon, LockIcon, MicIcon, HeartIcon } from '../ui/icons'

/**
 * Reusable trust-signal strip. Mount this on every relevant screen (not just
 * the landing page) so the privacy story is reinforced visually throughout.
 */
export const TRUST_SIGNALS = [
  { icon: ShieldIcon, label: 'Privacy by Design' },
  { icon: LockIcon, label: 'End-to-End Encryption' },
  { icon: MicIcon, label: 'Voice Deleted After Processing' },
  { icon: HeartIcon, label: 'Your Data Belongs To You' },
]

export default function TrustBar({ className = '' }) {
  return (
    <div
      id="trust"
      className={`flex flex-wrap items-center justify-center gap-x-8 gap-y-3 ${className}`}
    >
      {TRUST_SIGNALS.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-2 text-caption text-text-muted"
        >
          <Icon size={16} className="text-accent-secondary/80" />
          {label}
        </span>
      ))}
    </div>
  )
}
