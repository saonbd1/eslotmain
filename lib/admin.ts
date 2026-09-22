// Anyone can sign up, but only these emails can manage the blog.
// Set ADMIN_EMAILS in Vercel as a comma-separated list, e.g. "you@eslotmain.xyz,cofounder@eslotmain.xyz".
export function isAdminEmail(email?: string | null) {
  if (!email) return false
  const allowed = (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
  return allowed.includes(email.toLowerCase())
}
