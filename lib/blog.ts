import { and, desc, eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'

export type BlogPostRecord = {
  id: string
  slug: string
  title: string
  description: string
  excerpt: string
  content: string
  readTime: string
  published: boolean
  publishedAt: string
  updatedAt: string
}

export type BlogSectionNode = { type: 'paragraph'; text: string } | { type: 'image'; src: string; alt: string }
export type BlogSection = { heading: string; nodes: BlogSectionNode[] }

export type BlogPost = BlogPostRecord & {
  sections: BlogSection[]
}

const IMAGE_LINE = /^!\[([^\]]*)\]\((\S+)\)$/

// Body format: blank line = paragraph break; a line starting with "## " begins a new section;
// a line that is only "![alt text](https://image-url)" becomes a standalone image.
// Inline "[link text](https://url)" inside a paragraph is turned into a link when the post is rendered.
export function parseSections(content: string): BlogSection[] {
  const sections: BlogSection[] = []
  let current: BlogSection = { heading: '', nodes: [] }
  let buffer: string[] = []

  function flushParagraph() {
    const text = buffer.join(' ').replace(/\s+/g, ' ').trim()
    if (text) current.nodes.push({ type: 'paragraph', text })
    buffer = []
  }

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trimEnd()
    const imageMatch = line.trim().match(IMAGE_LINE)
    if (line.startsWith('## ')) {
      flushParagraph()
      if (current.heading || current.nodes.length) sections.push(current)
      current = { heading: line.slice(3).trim(), nodes: [] }
    } else if (imageMatch) {
      flushParagraph()
      current.nodes.push({ type: 'image', alt: imageMatch[1].trim(), src: imageMatch[2].trim() })
    } else if (line.trim() === '') {
      flushParagraph()
    } else {
      buffer.push(line.trim())
    }
  }
  flushParagraph()
  if (current.heading || current.nodes.length) sections.push(current)
  return sections
}

export function computeReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length
  const minutes = Math.max(1, Math.round(words / 200))
  return `${minutes} min read`
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'post'
}

async function uniqueSlug(base: string, excludeSlug?: string) {
  let candidate = slugify(base)
  let attempt = 1
  // Keep trying candidate-2, candidate-3, ... until one is free (or belongs to the post being edited).
  while (true) {
    if (candidate === excludeSlug) return candidate
    const [existing] = await db.select({ slug: blogPosts.slug }).from(blogPosts).where(eq(blogPosts.slug, candidate)).limit(1)
    if (!existing) return candidate
    attempt += 1
    candidate = `${slugify(base)}-${attempt}`
  }
}

function toRow(record: typeof blogPosts.$inferSelect): BlogPostRecord {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    description: record.description,
    excerpt: record.excerpt,
    content: record.content,
    readTime: record.readTime,
    published: record.published,
    publishedAt: record.publishedAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
  }
}

function withSections(record: BlogPostRecord): BlogPost {
  return { ...record, sections: parseSections(record.content) }
}

/** Public listing: published posts only, newest first. Used by /blog. */
export async function listPublishedPosts(): Promise<BlogPost[]> {
  const rows = await db.select().from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.publishedAt))
  return rows.map(toRow).map(withSections)
}

/** Admin listing: every post including drafts, newest first. Used by the dashboard. */
export async function listAllPosts(): Promise<BlogPostRecord[]> {
  const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.updatedAt))
  return rows.map(toRow)
}

/** Public lookup by slug: only returns the post if it is published. Used by /blog/[slug]. */
export async function getPublishedPost(slug: string): Promise<BlogPost | null> {
  const [row] = await db.select().from(blogPosts).where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true))).limit(1)
  return row ? withSections(toRow(row)) : null
}

/** Admin lookup by slug: returns drafts too. Used by the dashboard's edit form. */
export async function getPostBySlugForAdmin(slug: string): Promise<BlogPostRecord | null> {
  const [row] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).limit(1)
  return row ? toRow(row) : null
}

export type BlogPostInput = {
  title: string
  slug?: string
  description: string
  excerpt: string
  content: string
  published: boolean
}

export async function createPost(input: BlogPostInput, authorId?: string): Promise<BlogPostRecord> {
  const slug = await uniqueSlug(input.slug || input.title)
  const [row] = await db.insert(blogPosts).values({
    slug,
    title: input.title.trim(),
    description: input.description.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content,
    readTime: computeReadTime(input.content),
    published: input.published,
    authorId: authorId ?? null,
  }).returning()
  return toRow(row)
}

export async function updatePost(currentSlug: string, input: BlogPostInput): Promise<BlogPostRecord | null> {
  const desiredSlug = input.slug || input.title
  const slug = await uniqueSlug(desiredSlug, currentSlug)
  const [row] = await db.update(blogPosts).set({
    slug,
    title: input.title.trim(),
    description: input.description.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content,
    readTime: computeReadTime(input.content),
    published: input.published,
    updatedAt: new Date(),
  }).where(eq(blogPosts.slug, currentSlug)).returning()
  return row ? toRow(row) : null
}

export async function deletePost(slug: string): Promise<boolean> {
  const deleted = await db.delete(blogPosts).where(eq(blogPosts.slug, slug)).returning({ slug: blogPosts.slug })
  return deleted.length > 0
}
