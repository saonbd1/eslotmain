import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Link analytics',
  description: 'Track clicks and understand how your eslotmain.xyz short links perform.',
  alternates: { canonical: '/analytics' },
}

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children
}
