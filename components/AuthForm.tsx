'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowRightIcon, CheckCircleFillIcon, LockIcon, PersonIcon } from '@primer/octicons-react'
import { authClient } from '@/lib/auth-client'

type Mode = 'signin' | 'signup'
type Pending = 'email' | 'google' | 'resend' | null

// Where people land after signing in, verifying their email, or finishing Google sign-in.
const AFTER_AUTH_URL = '/account'

// Better Auth sends people back to /signin?error=<code> when something goes wrong (e.g. Google flow or an expired link).
const URL_ERRORS: Record<string, string> = {
  access_denied: 'Google sign-in was cancelled. Please try again.',
  state_mismatch: 'Your sign-in session expired. Please try again.',
  please_restart_the_process: 'Your sign-in session expired. Please try again.',
  unable_to_create_user: 'We could not create your account. Please try again in a moment.',
  unable_to_link_account: 'We could not link your Google account. Please try again.',
  account_not_linked: 'An account with this email already exists. Sign in with your email and password instead.',
  email_not_found: 'Google did not share an email address with us, so we could not sign you in.',
  invalid_token: 'That verification link is invalid or has expired. Sign in to get a new one.',
  token_expired: 'That verification link has expired. Sign in to get a new one.',
}

function describeUrlError(code: string | null) {
  if (!code) return ''
  return URL_ERRORS[code.toLowerCase()] ?? 'Sign-in failed. Please try again.'
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const isSignIn = mode === 'signin'
  const params = useSearchParams()
  const { data: session } = authClient.useSession()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [pending, setPending] = useState<Pending>(null)
  const [error, setError] = useState(() => describeUrlError(params.get('error')))
  const [notice, setNotice] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  // Already signed in? Skip the form.
  useEffect(() => {
    if (session?.user) window.location.replace(AFTER_AUTH_URL)
  }, [session])

  async function continueWithGoogle() {
    setError('')
    setNotice('')
    setPending('google')
    const result = await authClient.signIn.social({
      provider: 'google',
      callbackURL: AFTER_AUTH_URL,
      newUserCallbackURL: AFTER_AUTH_URL,
      errorCallbackURL: isSignIn ? '/signin' : '/signup',
    })
    // On success the browser is redirected to Google, so we only get here if starting the flow failed.
    if (result?.error) {
      setPending(null)
      setError(result.error.message || 'Google sign-in is unavailable right now. Please try again.')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    setNeedsVerification(false)
    setPending('email')
    try {
      if (isSignIn) {
        const { error: signInError } = await authClient.signIn.email({ email, password, callbackURL: AFTER_AUTH_URL })
        if (signInError) {
          if (signInError.status === 403 || signInError.code === 'EMAIL_NOT_VERIFIED') {
            setNeedsVerification(true)
            setError('Please verify your email address before signing in. Check your inbox for the verification link.')
          } else {
            setError(signInError.message || 'Invalid email or password.')
          }
          return
        }
        window.location.assign(AFTER_AUTH_URL)
      } else {
        const { error: signUpError } = await authClient.signUp.email({ name: name.trim(), email, password, callbackURL: AFTER_AUTH_URL })
        if (signUpError) {
          if (signUpError.code === 'USER_ALREADY_EXISTS' || signUpError.status === 422) {
            setError('An account with this email already exists. Try signing in instead.')
          } else {
            setError(signUpError.message || 'We could not create your account. Please try again.')
          }
          return
        }
        setSentTo(email)
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPending(null)
    }
  }

  async function resendVerification() {
    const target = sentTo ?? email
    if (!target) return
    setError('')
    setNotice('')
    setPending('resend')
    try {
      const { error: resendError } = await authClient.sendVerificationEmail({ email: target, callbackURL: AFTER_AUTH_URL })
      if (resendError) setError(resendError.message || 'We could not send the email. Please try again shortly.')
      else setNotice('We sent another verification email. Check your inbox and spam folder.')
    } catch {
      setError('We could not send the email. Please try again shortly.')
    } finally {
      setPending(null)
    }
  }

  if (sentTo) {
    return (
      <div className="auth-inline-success">
        <div className="signup-success reset-success">
          <CheckCircleFillIcon size={40} />
          <div className="eyebrow"><span className="eyebrow-line" /> CHECK YOUR INBOX</div>
          <h2>Verify your email.</h2>
          <p>We sent a verification link to <strong>{sentTo}</strong>. Open it to activate your account &mdash; you will be signed in automatically. It can take a minute to arrive, so check your spam folder too.</p>
          {notice && <p className="form-notice" role="status">{notice}</p>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="outline-button" type="button" onClick={resendVerification} disabled={pending !== null}>{pending === 'resend' ? 'Sending…' : 'Resend verification email'}</button>
          <Link className="reset-signin-link" href="/signin">Return to sign in <ArrowRightIcon size={14} /></Link>
        </div>
      </div>
    )
  }

  const busy = pending !== null

  return (
    <div className="auth-form-wrap">
      <div className="auth-card-heading">
        <span className="auth-card-icon">{isSignIn ? <LockIcon size={17} /> : <PersonIcon size={17} />}</span>
        <div>
          <h2>{isSignIn ? 'Sign in to your account' : 'Create your account'}</h2>
          <p>{isSignIn ? 'Keep your links moving forward.' : 'Start shortening links in seconds.'}</p>
        </div>
      </div>

      <button className="outline-button google-button" type="button" onClick={continueWithGoogle} disabled={busy}>
        <span className="google-mark" aria-hidden="true">G</span>
        {pending === 'google' ? 'Redirecting to Google…' : 'Continue with Google'}
      </button>

      <div className="auth-divider"><span>or use your email</span></div>

      <form className="signup-form" onSubmit={handleSubmit}>
        {!isSignIn && (
          <label>Full name<input type="text" name="name" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" required /></label>
        )}
        <label>Email address<input type="email" name="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="alex@company.com" required /></label>
        <label>Password<input type="password" name="password" autoComplete={isSignIn ? 'current-password' : 'new-password'} minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={isSignIn ? 'Your password' : 'At least 8 characters'} required /></label>
        {isSignIn && <div className="form-options"><span /><Link href="/forgot-password">Forgot password?</Link></div>}
        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-notice" role="status">{notice}</p>}
        {needsVerification && <button className="outline-button" type="button" onClick={resendVerification} disabled={busy}>{pending === 'resend' ? 'Sending…' : 'Resend verification email'}</button>}
        <button className="primary-button" type="submit" disabled={busy}>
          {pending === 'email' ? (isSignIn ? 'Signing in…' : 'Creating account…') : (isSignIn ? 'Sign in' : 'Create account')} <ArrowRightIcon size={16} />
        </button>
      </form>

      <p className="auth-switch">{isSignIn ? 'New to eslotmain.xyz?' : 'Already have an account?'}{' '}
        <Link href={isSignIn ? '/signup' : '/signin'}>{isSignIn ? 'Create an account' : 'Sign in'}</Link>
      </p>
    </div>
  )
}
