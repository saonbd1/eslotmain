// Turns "[label](url)" inside plain text into a real link. Only http(s):, mailto:, and
// same-site relative URLs are allowed, so pasted text can never inject a javascript: link.
const LINK_PATTERN = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|\/[^\s)]*)\)/g

export default function RichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let key = 0
  let match: RegExpExecArray | null

  LINK_PATTERN.lastIndex = 0
  while ((match = LINK_PATTERN.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index))
    const [full, label, url] = match
    const external = url.startsWith('http')
    parts.push(
      <a key={key++} className="article-link" href={url} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
        {label}
      </a>
    )
    lastIndex = match.index + full.length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))

  return <>{parts}</>
}
