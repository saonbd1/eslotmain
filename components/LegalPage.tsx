import type { ReactNode } from 'react'
import Footer from './Footer'
import SiteHeader from './SiteHeader'

type LegalSection = { title: string; content: ReactNode }

export default function LegalPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: LegalSection[] }) {
  return (
    <div className="inner-page-shell">
      <SiteHeader />
      <main className="page-width legal-page">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="legal-intro">{intro}</p>
        <p className="legal-updated">Last updated: August 31, 2026</p>
        <div className="legal-sections">
          {sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <div>{section.content}</div>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
