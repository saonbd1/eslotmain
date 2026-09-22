import type { Metadata } from 'next'
import { ArrowLeftIcon } from '@primer/octicons-react'
import BulkShortener from '@/components/BulkShortener'
import Footer from '@/components/Footer'
import SiteHeader from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'Bulk URL shortener',
  description: 'Shorten up to 10 URLs at once with eslotmain.xyz.',
  alternates: { canonical: '/bulk' },
}

export default function BulkPage() {
  return (
    <main className="site-shell inner-page-shell">
      <SiteHeader />
      <section className="bulk-page-intro page-width">
        <a className="back-link" href="/"><ArrowLeftIcon size={14} /> Back to home</a>
        <p className="eyebrow"><span className="eyebrow-line" /> BULK LINK WORKSPACE</p>
        <h1>Shorten your campaign links in one pass.</h1>
        <p>Submit up to 10 destinations together and keep every generated short link organized in one place.</p>
      </section>
      <BulkShortener />
      <Footer />
    </main>
  )
}
