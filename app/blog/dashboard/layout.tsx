import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog dashboard',
  description: 'Manage eslotmain.xyz blog posts.',
  robots: { index: false, follow: false },
}

export default function BlogDashboardLayout({ children }: { children: React.ReactNode }) {
  return children
}
