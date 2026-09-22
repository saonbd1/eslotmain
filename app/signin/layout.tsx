import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your eslotmain.xyz account.',
  alternates: { canonical: '/signin' },
  robots: { index: false, follow: false },
}

export default function SigninLayout({ children }: { children: React.ReactNode }) {
  return children
}
