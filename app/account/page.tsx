import Link from 'next/link'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'
import SignOutButton from '@/components/SignOutButton'
import { auth } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const session = await auth.api.getSession({ headers: await headers() })

  // Real session check (middleware only looks at the cookie). Keep ?error= so a bad verification link can be explained on /signin.
  if (!session) redirect(error ? `/signin?error=${encodeURIComponent(error)}` : '/signin')

  const { user } = session
  const firstName = user.name?.trim().split(/\s+/)[0] || 'there'

  return (
    <main className="auth-shell">
      <SiteHeader />
      <section className="auth-content page-width signin-content">
        <div className="auth-benefits">
          <div className="eyebrow"><span className="eyebrow-line" /> YOUR ACCOUNT</div>
          <h1>Welcome,<br /><span>{firstName}.</span></h1>
          <p className="auth-intro">You are signed in. Links you create while signed in are tied to this account, so you can look up their private analytics.</p>
        </div>
        <div className="auth-card">
          <div className="auth-form">
            <div className="auth-form-intro">
              {user.image && <img className="account-avatar" src={user.image} alt="" referrerPolicy="no-referrer" width={52} height={52} />}
              <h1 style={{ fontSize: 26 }}>{user.name || 'Your account'}</h1>
            </div>
            <dl className="account-details">
              <div><dt>Email</dt><dd>{user.email}</dd></div>
              <div><dt>Status</dt><dd>{user.emailVerified ? 'Email verified' : 'Email not verified'}</dd></div>
            </dl>
            <div className="account-actions">
              <Link className="primary-button auth-submit" href="/analytics">View link analytics</Link>
              <Link className="outline-button outline-link" href="/">Shorten a link</Link>
              {isAdminEmail(user.email) && <Link className="outline-button outline-link" href="/blog/dashboard">Manage blog posts</Link>}
              <SignOutButton />
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}
