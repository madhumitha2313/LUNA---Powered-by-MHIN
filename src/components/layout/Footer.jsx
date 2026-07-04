import Logo from '../Logo'
import TrustBar from './TrustBar'
import { useT } from '../../lib/i18n.jsx'

export default function Footer() {
  const { t } = useT()
  return (
    <footer className="border-t border-white/[0.06] bg-bg-secondary/40">
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <TrustBar className="pb-10" />

        <div className="flex flex-col items-center justify-between gap-6 border-t border-white/[0.06] pt-8 sm:flex-row">
          <Logo withTagline />
          <p className="max-w-md text-center text-caption text-text-muted sm:text-right">
            {t('footerDisclaimer')}
          </p>
        </div>

        <p className="mt-6 text-center text-caption text-text-muted/70">
          © {new Date().getFullYear()} MIRA · powered by MHIN
        </p>
      </div>
    </footer>
  )
}
