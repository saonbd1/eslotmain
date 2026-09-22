import { Suspense } from 'react'
import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'
import AuthForm from '@/components/AuthForm'

export default function SigninPage() {
  return (
    <main className="auth-shell">
      <SiteHeader />
      <section className="auth-content page-width signin-content">
        <div className="auth-benefits">
          <div className="eyebrow"><span className="eyebrow-line" /> WELCOME BACK</div>
          <h1>Good to see<br /><span>you again.</span></h1>
          <p className="auth-intro">Sign in to manage your shortened links and private click analytics.</p>
        </div>
        <div className="auth-card">
          <Suspense fallback={null}><AuthForm mode="signin" /></Suspense>
        </div>
      </section>
      <Footer />
    </main>
  )
}
