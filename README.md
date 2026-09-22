# sniply

This is a [Next.js](https://nextjs.org) project bootstrapped with [v0](https://v0.app).

## Built with v0

This repository is linked to a [v0](https://v0.app) project. You can continue developing by visiting the link below -- start new chats to make changes, and v0 will push commits directly to this repo. Every merge to `main` will automatically deploy.

[Continue working on v0 →](https://v0.app/chat/projects/prj_33hfYDlg2ejDbGRcophEqILHOZd9)

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Authentication configuration

Authentication uses Better Auth with Drizzle and Neon Postgres (email + password with email verification, and Google). Sign-in, sign-up, the account page (`/account`), password reset and the link-analytics API all use this one system. Configure these environment variables in Vercel (Production scope) and locally, then **redeploy** - Vercel only applies env changes to new deployments:

```bash
NEON_DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=https://eslotmain.xyz
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
RESEND_API_KEY=...
RESEND_EMAIL_DOMAIN=eslotmain.xyz
```

- **Google:** in Google Cloud Console add `https://eslotmain.xyz/api/auth/callback/google` as an authorized redirect URI (and `http://localhost:3000/api/auth/callback/google` for local testing). If the OAuth consent screen is in "Testing" mode, only listed test users can sign in - publish it for everyone.
- **Email:** `RESEND_EMAIL_DOMAIN` must be a bare domain that is *verified in Resend* (Resend dashboard > Domains). Without it the app falls back to `onboarding@resend.dev`, which Resend only delivers to the email address of your own Resend account. Send failures are logged as `[auth] Resend rejected ...` in the Vercel runtime logs.
- **Database:** the Neon database must contain the `neon_auth.user`, `neon_auth.session`, `neon_auth.account`, and `neon_auth.verification` tables used by the Drizzle adapter.

## Blog dashboard

`/blog/dashboard` is a create/edit/delete UI for blog posts, restricted to the emails listed in `ADMIN_EMAILS` (comma-separated, e.g. `ADMIN_EMAILS=you@eslotmain.xyz`). Anyone else who visits it is redirected to `/blog`; signed-out visitors are sent to `/signin` first. Sign in (or sign up) with one of those addresses to get a "Manage posts" link on `/blog` and `/account`.

Posts live in a `blog_posts` table that isn't created by anything else in this repo (there's no migration tool wired up) — run **`blog-posts-setup.sql`** once against your Neon database before using the dashboard. It also has an optional block to restore the one article that used to be hardcoded in `lib/blog.ts`.

Write the post body as plain text: a blank line starts a new paragraph, and a line starting with `## ` starts a new section with that heading. For a clickable link, write `[link text](https://example.com)` inside a paragraph — either type it directly or select text in the editor and click "Add link". For an image, click "Add image" (or put `![description](https://example.com/image.jpg)` on its own line) — this only accepts an image URL, there's no file upload yet, so host the image somewhere (e.g. imgur, your own storage) first and paste its URL. Read time and the URL slug (from the title, if you leave the slug field blank) are generated automatically.

## Learn More

To learn more, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
- [v0 Documentation](https://v0.app/docs) - learn about v0 and how to use it.
