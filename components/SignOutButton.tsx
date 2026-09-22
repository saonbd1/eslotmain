'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'

export default function SignOutButton() {
  const [pending, setPending] = useState(false)

  async function signOut() {
    setPending(true)
    try {
      await authClient.signOut()
    } finally {
      // Full reload so every component starts from a clean, signed-out state.
      window.location.assign('/')
    }
  }

  return <button className="outline-button" type="button" onClick={signOut} disabled={pending}>{pending ? 'Signing out…' : 'Sign out'}</button>
}
