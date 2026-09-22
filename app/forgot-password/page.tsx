'use client'

import { FormEvent, useState } from 'react'
import { ArrowRightIcon, CheckCircleFillIcon, InboxIcon, LockIcon } from '@primer/octicons-react'
import { authClient } from '@/lib/auth-client'
import Link from 'next/link'
import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)
  const [email, setEmail] = useState('')

  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setError('')
    const result = await authClient.requestPasswordReset({ email, redirectTo: `${window.location.origin}/reset-password` })
    setPending(false)
    if (result.error) {
      setError('We could not process that request. Please try again.')
      return
    }
    setSubmitted(true)
  }

  return (
    <main className="auth-shell">
      <div className="auth-orbit auth-orbit-one" aria-hidden="true" />
      <div className="auth-orbit auth-orbit-two" aria-hidden="true" />
      <SiteHeader />

      <section className="auth-content page-width reset-content">
        <div className="auth-benefits">
          <div className="eyebrow"><span className="eyebrow-line" /> ACCOUNT RECOVERY</div>
          <h1>Get back to<br /><span>what matters.</span></h1>
          <p className="auth-intro">It happens. We’ll help you reset your password and get back to sharing links with confidence.</p>
          <div className="reset-steps">
            <ResetStep number="01" title="Enter your email" text="Use the email connected to your eslotmain.xyz account." />
            <ResetStep number="02" title="Check your inbox" text="We’ll send a secure password reset link to you." />
            <ResetStep number="03" title="Choose a new password" text="Create a fresh password and continue where you left off." />
          </div>
        </div>

        <div className="auth-card">
          {submitted ? (
            <div className="signup-success reset-success"><CheckCircleFillIcon size={40} /><div className="eyebrow"><span className="eyebrow-line" /> CHECK YOUR INBOX</div><h2>Reset link sent.</h2><p>We sent password reset instructions to <strong>{email}</strong>. If you do not see the email, check your spam folder or try again.</p><button className="outline-button" type="button" onClick={() => setSubmitted(false)}>Use a different email</button><Link className="reset-signin-link" href="/signin">Return to sign in <ArrowRightIcon size={14} /></Link></div>
          ) : (
            <>
              <div className="auth-card-heading"><span className="auth-card-icon"><InboxIcon size={17} /></span><div><h2>Reset your password</h2><p>We’ll send instructions to your inbox.</p></div></div>
              <p className="reset-card-instruction">Enter your account email below. You will receive a secure link to create a new password.</p>
              <form className="signup-form" onSubmit={handleSubmit}>
                <label>Email address<input type="email" name="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@company.com" required /></label>
                {error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button" type="submit" disabled={pending}>{pending ? 'Sending…' : 'Send reset link'} <ArrowRightIcon size={16} /></button>
              </form>
              <div className="auth-divider"><span>Remember your password?</span></div>
              <Link className="outline-button outline-link" href="/signin">Return to sign in</Link>
              <p className="secure-note"><LockIcon size={12} /> Reset links are private and expire for your security.</p>
            </>
          )}
        </div>
      </section>
      <Footer />
    </main>
  )
}

function ResetStep({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="reset-step"><span className="reset-step-number">{number}</span><div><strong>{title}</strong><p>{text}</p></div></div>
}
