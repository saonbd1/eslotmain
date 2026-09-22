import { Suspense } from 'react'
import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'
import AuthForm from '@/components/AuthForm'

export default function SignupPage() {
  return (
    <main className="auth-shell">
      <SiteHeader />
      <section className="auth-content page-width">
        <div className="auth-benefits">
          <div className="eyebrow"><span className="eyebrow-line" /> START YOUR LINK JOURNEY</div>
          <h1>Make every link<br /><span>work harder.</span></h1>
          <p className="auth-intro">Create an account to manage shortened links and see private analytics.</p>
        </div>
        <div className="auth-card">
          <Suspense fallback={null}><AuthForm mode="signup" /></Suspense>
        </div>
      </section>
      <Footer />
    </main>
  )
}
