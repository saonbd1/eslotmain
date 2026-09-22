import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from '@/lib/db'
import * as schema from '@/lib/db/schema'
import { Resend } from 'resend'

const SITE_URL = 'https://eslotmain.xyz'

// RESEND_EMAIL_DOMAIN must be a bare domain that is VERIFIED in Resend (e.g. "eslotmain.xyz").
// Be forgiving if it was pasted as "https://eslotmain.xyz" or "no-reply@eslotmain.xyz".
function normalizeDomain(value?: string) {
  if (!value) return ''
  return value.trim().replace(/^https?:\/\//i, '').replace(/^.*@/, '').replace(/\/.*$/, '').toLowerCase()
}

const emailDomain = normalizeDomain(process.env.RESEND_EMAIL_DOMAIN)
const emailSender = emailDomain ? `eslotmain <no-reply@${emailDomain}>` : 'eslotmain <onboarding@resend.dev>'

if (!emailDomain && process.env.NODE_ENV === 'production') {
  // Resend's shared onboarding@resend.dev sender only delivers to the email address of your own Resend account.
  console.warn('[auth] RESEND_EMAIL_DOMAIN is not set. Falling back to onboarding@resend.dev, which cannot deliver to other people. Verify your domain in Resend and set RESEND_EMAIL_DOMAIN.')
}

function logAuthError(label: string, error: unknown) {
  console.error(`[auth] ${label}`, error instanceof Error ? error.message : JSON.stringify(error))
}

async function sendTransactionalEmail({ to, subject, html, idempotencyKey }: { to: string; subject: string; html: string; idempotencyKey: string }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    logAuthError('RESEND_API_KEY is not set - email not sent', { subject })
    throw new Error('Email is not configured')
  }
  const resend = new Resend(apiKey)
  const { data, error } = await resend.emails.send({ from: emailSender, to: [to], subject, html }, { idempotencyKey })
  if (error) {
    // Better Auth catches errors thrown from these callbacks and only logs them, so the sign-up screen still says
    // "email sent". Look for this line in the Vercel runtime logs to see the real reason (unverified domain, sandbox sender, bad key...).
    logAuthError(`Resend rejected "${subject}" (from: ${emailSender})`, error)
    throw new Error('Unable to send email')
  }
  console.log(`[auth] Sent "${subject}" via Resend (id: ${data?.id})`)
}

const origins = [
  'http://localhost:3000',
  SITE_URL,
  'https://www.eslotmain.xyz',
  process.env.BETTER_AUTH_URL,
  process.env.V0_RUNTIME_URL,
  process.env.V0_DEV_APP_URL,
  process.env.V0_BUILD_URL,
  process.env.V0_SANDBOX_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
].filter((origin): origin is string => Boolean(origin))

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg', schema: { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification } }),
  baseURL: process.env.BETTER_AUTH_URL ?? SITE_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: origins,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    },
  },
  account: {
    // If someone signs up with email first and later uses "Continue with Google" (same, Google-verified email),
    // link the two instead of failing.
    accountLinking: { enabled: true, trustedProviders: ['google'] },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendTransactionalEmail({
        to: user.email,
        subject: 'Reset your eslotmain password',
        html: `<p>We received a request to reset your eslotmain password.</p><p><a href="${url}">Reset your password</a></p><p>If you did not request this, you can safely ignore this email.</p>`,
        idempotencyKey: `password-reset/${user.id}/${new URL(url).searchParams.get('token') ?? 'request'}`,
      })
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendTransactionalEmail({
        to: user.email,
        subject: 'Verify your eslotmain account',
        html: `<p>Welcome to eslotmain.</p><p>Please verify your email address to activate your account:</p><p><a href="${url}">Verify my email</a></p>`,
        idempotencyKey: `email-verification/${user.id}/${new URL(url).searchParams.get('token') ?? 'request'}`,
      })
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },
  advanced: {
    database: { generateId: 'uuid' },
    ...(process.env.NODE_ENV === 'development' ? {
      defaultCookieAttributes: { sameSite: 'none' as const, secure: true },
    } : {}),
  },
})
