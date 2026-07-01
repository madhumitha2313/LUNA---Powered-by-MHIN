import Navbar from './Navbar'
import Footer from './Footer'

/** Standard page frame: glass nav, padded content column, trust footer. */
export default function PageShell({ children, max = 'max-w-6xl' }) {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />
      <main className={`mx-auto ${max} px-5 pb-24 pt-28 sm:px-8`}>{children}</main>
      <Footer />
    </div>
  )
}
