import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { isAdminEmail } from '@/lib/admin'
import { createPost, listAllPosts } from '@/lib/blog'

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !isAdminEmail(session.user.email)) return null
  return session.user
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })
  try {
    const posts = await listAllPosts()
    return NextResponse.json({ posts })
  } catch {
    return NextResponse.json({ error: 'Unable to load posts right now.' }, { status: 503 })
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Not authorized.' }, { status: 403 })

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Send a JSON body.' }, { status: 400 })
  }

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  const excerpt = typeof body.excerpt === 'string' ? body.excerpt.trim() : ''
  const content = typeof body.content === 'string' ? body.content : ''
  const slug = typeof body.slug === 'string' ? body.slug.trim() : ''
  const published = body.published !== false

  if (!title || !description || !excerpt || !content.trim()) {
    return NextResponse.json({ error: 'Title, description, excerpt, and content are all required.' }, { status: 400 })
  }

  try {
    const post = await createPost({ title, slug, description, excerpt, content, published }, admin.id)
    return NextResponse.json({ post }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Unable to create the post right now.' }, { status: 503 })
  }
}
