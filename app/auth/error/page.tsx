import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Authentication error',
  description: 'Authentication link error for eslotmain.xyz.',
  alternates: { canonical: '/auth/error' },
  robots: { index: false, follow: false },
}

export default function AuthErrorPage() {
  return (
    <main className="auth-shell">
      <nav className="auth-nav page-width"><Link className="brand" href="/">eslotmain.xyz</Link></nav>
      <section className="auth-content page-width" style={{ minHeight: '60vh', display: 'grid', placeItems: 'center' }}>
        <div className="auth-card">
          <div className="eyebrow"><span className="eyebrow-line" /> AUTHENTICATION ERROR</div>
          <h1>That link has expired.</h1>
          <p className="auth-intro">Please request a new confirmation email and try again.</p>
          <Link className="primary-button" href="/signup">Return to sign up</Link>
        </div>
      </section>
    </main>
  )
}
