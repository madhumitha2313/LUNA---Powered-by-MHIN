/**
 * Client-side PDF export — rasterizes an existing DOM node (a "report-sheet")
 * into a paginated PDF and triggers a direct download. No browser print
 * dialog is ever opened. Both the Health Summary Report and the MIRA Core
 * Report use this so their PDFs share the same clean, professional layout.
 */
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * @param {HTMLElement} element - the report-sheet node to export
 * @param {string} filename - e.g. "Health_Summary_Report_28-Jul-2026.pdf"
 */
export async function downloadElementAsPdf(element, filename) {
  if (!element) return
  // Temporarily render with the same clean white styling the app already
  // uses for print, so the PDF matches the established "professional sheet"
  // look regardless of the current dark-theme UI.
  element.classList.add('pdf-render')
  try {
    // Bounded so a slow/unreachable external stylesheet (e.g. a webfont CDN)
    // can never leave the Download button stuck — it falls back to whatever
    // fonts are already loaded rather than hanging indefinitely.
    const canvas = await withTimeout(
      html2canvas(element, {
        scale: 1.5,
        backgroundColor: '#ffffff',
        useCORS: true,
        imageTimeout: 6000,
        windowWidth: element.scrollWidth,
      }),
      20000,
      'PDF generation timed out'
    )
    // JPEG at high quality keeps a mostly-white report sheet small (a few
    // hundred KB instead of several MB) so it's comfortable on mobile data.
    const imgData = canvas.toDataURL('image/jpeg', 0.88)
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4', compress: true })
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let heightLeft = imgHeight
    let position = 0
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    while (heightLeft > 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    pdf.save(filename)
  } finally {
    element.classList.remove('pdf-render')
  }
}

function withTimeout(promise, ms, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(message)), ms)),
  ])
}

/** "28-Jul-2026" style date suffix for report filenames. */
export function fileDateStamp(d = new Date()) {
  const day = String(d.getDate()).padStart(2, '0')
  const month = d.toLocaleDateString('en-GB', { month: 'short' })
  return `${day}-${month}-${d.getFullYear()}`
}
