'use client'

import Link from 'next/link'
import { authClient } from '@/lib/auth-client'

// Shows "Account" when signed in and "Sign in" when signed out.
export default function HeaderAuth() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) return <span className="nav-signin" aria-hidden="true" style={{ visibility: 'hidden' }}>Sign in</span>
  if (session?.user) return <Link className="nav-signin" href="/account">Account</Link>
  return <Link className="nav-signin" href="/signin">Sign in</Link>
}
