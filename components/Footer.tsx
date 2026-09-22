import { LinkIcon } from '@primer/octicons-react'

export default function Footer() {
  return (
    <footer className="site-footer page-width">
      <a className="brand" href="/" aria-label="eslotmain.xyz home">
        <span className="brand-mark"><LinkIcon size={14} /></span>
        <span>eslotmain<span className="brand-dot">.</span>xyz</span>
      </a>
      <div className="site-footer-links">
        <a href="/#features">Features</a>
        <a href="/#analytics">Analytics</a>
        <a href="/blog">Blog</a>
        <a href="/legal">Legal</a>
        <a href="/privacy">Privacy</a>
        <a href="/terms">Terms</a>
        <a href="mailto:hello@eslotmain.xyz">Contact</a>
      </div>
      <span className="site-footer-copy">© 2026 eslotmain.xyz</span>
    </footer>
  )
}
