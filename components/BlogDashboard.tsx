'use client'

import { FormEvent, useRef, useState } from 'react'
import { ImageIcon, LinkIcon, PencilIcon, PlusIcon, TrashIcon } from '@primer/octicons-react'

type Post = {
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

const emptyForm = { title: '', slug: '', description: '', excerpt: '', content: '', published: true }

export default function BlogDashboard({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [pending, setPending] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const contentRef = useRef<HTMLTextAreaElement>(null)

  function startCreate() {
    setEditingSlug(null)
    setForm(emptyForm)
    setError('')
    setNotice('')
    setShowForm(true)
  }

  function startEdit(post: Post) {
    setEditingSlug(post.slug)
    setForm({
      title: post.title,
      slug: post.slug,
      description: post.description,
      excerpt: post.excerpt,
      content: post.content,
      published: post.published,
    })
    setError('')
    setNotice('')
    setShowForm(true)
  }

  function cancelForm() {
    setShowForm(false)
    setEditingSlug(null)
    setForm(emptyForm)
  }

  function insertIntoContent(before: string, after: string, placeholder: string) {
    const textarea = contentRef.current
    if (!textarea) return
    const { selectionStart, selectionEnd, value } = textarea
    const selected = value.slice(selectionStart, selectionEnd) || placeholder
    const insertion = `${before}${selected}${after}`
    const nextValue = value.slice(0, selectionStart) + insertion + value.slice(selectionEnd)
    setForm((f) => ({ ...f, content: nextValue }))
    // Put the cursor right after the inserted text once React re-renders the textarea.
    const cursor = selectionStart + insertion.length
    requestAnimationFrame(() => {
      textarea.focus()
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  function addLink() {
    const url = window.prompt('Link URL (https://...)')
    if (!url) return
    insertIntoContent('[', `](${url})`, 'link text')
  }

  function addImage() {
    const url = window.prompt('Image URL (https://...)')
    if (!url) return
    const alt = window.prompt('Image description (for accessibility)', '') ?? ''
    const textarea = contentRef.current
    const pos = textarea ? textarea.selectionStart : form.content.length
    const before = form.content.slice(0, pos)
    const after = form.content.slice(pos)
    const needsLeadingBreak = before.length > 0 && !before.endsWith('\n\n')
    const needsTrailingBreak = after.length > 0 && !after.startsWith('\n\n')
    const snippet = `${needsLeadingBreak ? '\n\n' : ''}![${alt}](${url})${needsTrailingBreak ? '\n\n' : ''}`
    setForm((f) => ({ ...f, content: before + snippet + after }))
    const cursor = before.length + snippet.length
    requestAnimationFrame(() => {
      textarea?.focus()
      textarea?.setSelectionRange(cursor, cursor)
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    setPending(true)
    try {
      const url = editingSlug ? `/api/blog/${editingSlug}` : '/api/blog'
      const method = editingSlug ? 'PUT' : 'POST'
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const payload = await response.json() as { post?: Post; error?: string }
      if (!response.ok || !payload.post) {
        setError(payload.error || 'Something went wrong. Please try again.')
        return
      }
      setPosts((current) => {
        if (editingSlug) return current.map((post) => (post.slug === editingSlug ? payload.post! : post))
        return [payload.post!, ...current]
      })
      setNotice(editingSlug ? 'Post updated.' : 'Post created.')
      cancelForm()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  async function handleDelete(slug: string) {
    if (!window.confirm('Delete this post? This cannot be undone.')) return
    setDeleting(slug)
    setError('')
    setNotice('')
    try {
      const response = await fetch(`/api/blog/${slug}`, { method: 'DELETE' })
      const payload = await response.json() as { ok?: boolean; error?: string }
      if (!response.ok || !payload.ok) {
        setError(payload.error || 'Unable to delete that post.')
        return
      }
      setPosts((current) => current.filter((post) => post.slug !== slug))
      setNotice('Post deleted.')
      if (editingSlug === slug) cancelForm()
    } catch {
      setError('Unable to delete that post.')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="dashboard-shell">
      {!showForm && (
        <button className="primary-button" type="button" onClick={startCreate}>
          <PlusIcon size={16} /> New post
        </button>
      )}

      {notice && !showForm && <p className="form-notice" role="status">{notice}</p>}
      {error && !showForm && <p className="form-error" role="alert">{error}</p>}

      {showForm && (
        <form className="signup-form dashboard-form" onSubmit={handleSubmit}>
          <div className="auth-card-heading">
            <div><h2>{editingSlug ? 'Edit post' : 'New post'}</h2><p>{editingSlug ? `Editing "${editingSlug}"` : 'Fields marked with an asterisk are required.'}</p></div>
          </div>
          <label>Title *<input type="text" value={form.title} onChange={(event) => setForm((f) => ({ ...f, title: event.target.value }))} placeholder="How to shorten a link in seconds" required /></label>
          <label>URL slug<input type="text" value={form.slug} onChange={(event) => setForm((f) => ({ ...f, slug: event.target.value }))} placeholder="auto-generated from the title if left blank" /></label>
          <label>Meta description *<input type="text" value={form.description} onChange={(event) => setForm((f) => ({ ...f, description: event.target.value }))} placeholder="Shown in search results and social previews" required /></label>
          <label>Excerpt *<textarea rows={2} value={form.excerpt} onChange={(event) => setForm((f) => ({ ...f, excerpt: event.target.value }))} placeholder="A short teaser shown on the blog list page" required /></label>
          <label>Content *
            <div className="dashboard-toolbar">
              <button type="button" className="outline-button dashboard-tool" onClick={addLink}><LinkIcon size={13} /> Add link</button>
              <button type="button" className="outline-button dashboard-tool" onClick={addImage}><ImageIcon size={13} /> Add image</button>
            </div>
            <textarea ref={contentRef} rows={14} value={form.content} onChange={(event) => setForm((f) => ({ ...f, content: event.target.value }))} placeholder={'Write the article body here.\n\nBlank lines start a new paragraph.\n\n## A heading\n\nSelect text and click "Add link", or click "Add image" to insert one by URL.'} required />
          </label>
          <label className="checkbox-row"><input type="checkbox" checked={form.published} onChange={(event) => setForm((f) => ({ ...f, published: event.target.checked }))} /> Published (unpublished posts are saved as drafts and hidden from /blog)</label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <div className="account-actions dashboard-form-actions">
            <button className="primary-button" type="submit" disabled={pending}>{pending ? 'Saving…' : editingSlug ? 'Save changes' : 'Create post'}</button>
            <button className="outline-button" type="button" onClick={cancelForm} disabled={pending}>Cancel</button>
          </div>
        </form>
      )}

      <div className="dashboard-list">
        {posts.length === 0 && <p className="blog-intro">No posts yet. Create your first one above.</p>}
        {posts.map((post) => (
          <article className="dashboard-item" key={post.id}>
            <div className="dashboard-item-main">
              <div className="dashboard-item-title">
                <strong>{post.title}</strong>
                <span className={post.published ? 'dashboard-badge dashboard-badge-live' : 'dashboard-badge'}>{post.published ? 'Published' : 'Draft'}</span>
              </div>
              <p className="dashboard-item-meta">/blog/{post.slug} · {post.readTime} · updated {new Date(post.updatedAt).toLocaleDateString()}</p>
            </div>
            <div className="dashboard-item-actions">
              <button className="outline-button" type="button" onClick={() => startEdit(post)}><PencilIcon size={14} /> Edit</button>
              <button className="outline-button dashboard-delete" type="button" onClick={() => handleDelete(post.slug)} disabled={deleting === post.slug}><TrashIcon size={14} /> {deleting === post.slug ? 'Deleting…' : 'Delete'}</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
