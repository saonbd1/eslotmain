import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Footer from '@/components/Footer'
import { SharePost } from '@/components/BlogComponents'
import RichText from '@/components/RichText'
import { getPublishedPost } from '@/lib/blog'
import SiteHeader from '@/components/SiteHeader'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedPost((await params).slug)
  if (!post) return { title: 'Article not found' }
  return { title: post.title, description: post.description, alternates: { canonical: `/blog/${post.slug}` }, openGraph: { type: 'article', title: post.title, description: post.description, publishedTime: post.publishedAt, modifiedTime: post.updatedAt } }
}

export default async function BlogPostPage({ params }: Props) {
  const article = await getPublishedPost((await params).slug)
  if (!article) notFound()
  const schema = { '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description: article.description, datePublished: article.publishedAt, dateModified: article.updatedAt, author: { '@type': 'Organization', name: 'Eslotmain' }, publisher: { '@type': 'Organization', name: 'Eslotmain', url: 'https://eslotmain.xyz' }, mainEntityOfPage: `https://eslotmain.xyz/blog/${article.slug}` }

  return (
    <main className="site-shell inner-page-shell">
      <SiteHeader />
      <article className="page-width blog-article">
        <p className="eyebrow">ESLOTMAIN / ARTICLE</p>
        <h1>{article.title}</h1>
        <p className="blog-article-description">{article.description}</p>
        <div className="blog-list-meta"><time dateTime={article.publishedAt}>{article.publishedAt.slice(0, 10)}</time><span>{article.readTime}</span></div>
        <div className="article-body">
          <p>{article.excerpt}</p>
          {article.sections.map((section, index) => (
            <section key={`${section.heading}-${index}`}>
              {section.heading && <h2>{section.heading}</h2>}
              {section.nodes.map((node, nodeIndex) =>
                node.type === 'image' ? (
                  <figure className="article-image-figure" key={nodeIndex}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="article-image" src={node.src} alt={node.alt} loading="lazy" />
                    {node.alt && <figcaption>{node.alt}</figcaption>}
                  </figure>
                ) : (
                  <p key={nodeIndex}><RichText text={node.text} /></p>
                )
              )}
            </section>
          ))}
        </div>
        <SharePost title={article.title} slug={article.slug} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </article>
      <Footer />
    </main>
  )
}
