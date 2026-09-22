'use client'

import { FormEvent, Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'
import { authClient } from '@/lib/auth-client'

export default function ResetPasswordPage() {
  return <Suspense fallback={<main className="auth-shell" />}><ResetPasswordForm /></Suspense>
}

function ResetPasswordForm() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [done, setDone] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (password !== confirmation) { setError('Passwords do not match.'); return }
    if (!token) { setError('This reset link is missing or invalid.'); return }
    setPending(true)
    setError('')
    const result = await authClient.resetPassword({ newPassword: password, token })
    setPending(false)
    if (result.error) { setError('This reset link is invalid or expired. Request a new one and try again.'); return }
    setDone(true)
  }

  return <main className="auth-shell"><SiteHeader /><section className="auth-content page-width reset-content"><div className="auth-benefits"><div className="eyebrow"><span className="eyebrow-line" /> PASSWORD RECOVERY</div><h1>Make it<br /><span>secure again.</span></h1><p className="auth-intro">Choose a new password for your eslotmain.xyz account.</p></div><div className="auth-card"><form className="auth-form" onSubmit={submit}><div className="auth-form-intro"><span className="eyebrow">ESLOTMAIN / RECOVERY</span><h1>{done ? 'Password updated' : 'Choose a new password'}</h1><p>{done ? 'Your account is secure again. Sign in to continue.' : 'Use at least eight characters and keep it somewhere safe.'}</p></div>{done ? <Link className="primary-button auth-submit" href="/signin">Continue to sign in</Link> : <><div className="auth-form-fields"><label>New password<input required minLength={8} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} /></label><label>Confirm password<input required minLength={8} type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></label></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="primary-button auth-submit" type="submit" disabled={pending}>{pending ? 'Updating…' : 'Update password'}</button></>}</form></div></section><Footer /></main>
}
