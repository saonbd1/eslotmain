import type { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import { PencilIcon } from '@primer/octicons-react'
import Footer from '@/components/Footer'
import { listPublishedPosts } from '@/lib/blog'
import SiteHeader from '@/components/SiteHeader'
import { auth } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'All Published Articles on Eslotmain Blog',
  description: 'Practical guides and ideas for shortening, organizing, and sharing links with Eslotmain.',
  alternates: { canonical: '/blog' },
}

export default async function BlogPage() {
  const [posts, session] = await Promise.all([
    listPublishedPosts(),
    auth.api.getSession({ headers: await headers() }),
  ])
  const isAdmin = isAdminEmail(session?.user.email)

  return (
    <main className="site-shell inner-page-shell">
      <SiteHeader />
      <div className="page-width blog-page">
        <div className="blog-page-heading">
          <div>
            <p className="eyebrow">ESLOTMAIN / JOURNAL</p>
            <h1>All Published Articles on Eslotmain Blog</h1>
          </div>
          {isAdmin && <Link className="outline-button outline-link dashboard-manage-link" href="/blog/dashboard"><PencilIcon size={14} /> Manage posts</Link>}
        </div>
        <p className="blog-intro">Clear, practical ideas for making long links easier to manage, share, and understand. Explore product guides and simple workflows built around better link sharing.</p>
        <div className="blog-list">
          {posts.length === 0 && <p className="blog-intro">No articles published yet. Check back soon.</p>}
          {posts.map((post) => (
            <article className="blog-list-item" key={post.slug}>
              <div className="blog-list-meta"><time dateTime={post.publishedAt}>{post.publishedAt.slice(0, 10)}</time><span>{post.readTime}</span></div>
              <div><h2><Link href={`/blog/${post.slug}`}>{post.title}</Link></h2><p>{post.excerpt}</p><Link className="text-link" href={`/blog/${post.slug}`}>Read article →</Link></div>
            </article>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  )
}
