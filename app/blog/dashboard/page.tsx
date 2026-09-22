import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'
import BlogDashboard from '@/components/BlogDashboard'
import { auth } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin'
import { listAllPosts } from '@/lib/blog'

export const dynamic = 'force-dynamic'

export default async function BlogDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/signin?next=/blog/dashboard')
  if (!isAdminEmail(session.user.email)) redirect('/blog')

  const posts = await listAllPosts()

  return (
    <main className="site-shell inner-page-shell">
      <SiteHeader />
      <div className="page-width blog-page">
        <p className="eyebrow">ESLOTMAIN / DASHBOARD</p>
        <h1>Blog posts</h1>
        <p className="blog-intro">Create, edit, and publish articles for the eslotmain.xyz blog.</p>
        <BlogDashboard initialPosts={posts} />
      </div>
      <Footer />
    </main>
  )
}
