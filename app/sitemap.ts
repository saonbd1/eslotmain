import type { MetadataRoute } from 'next'
import { listPublishedPosts } from '@/lib/blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://eslotmain.xyz'
  const now = new Date()

  const staticEntries: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/analytics`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ]

  try {
    const posts = await listPublishedPosts()
    const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))
    return [...staticEntries, ...postEntries]
  } catch {
    // If the DB is briefly unreachable at build/request time, still return the static routes.
    return staticEntries
  }
}
