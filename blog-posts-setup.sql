-- Run this once in your Neon database (Neon console → SQL editor, or `psql`).
-- Creates the table the blog dashboard reads and writes.

CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  excerpt text NOT NULL,
  content text NOT NULL,
  read_time text NOT NULL,
  published boolean NOT NULL DEFAULT true,
  author_id uuid,
  published_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Optional: restore the one article that used to be hardcoded in lib/blog.ts,
-- so you don't lose it when the dashboard takes over. Safe to skip or delete.
INSERT INTO blog_posts (slug, title, description, excerpt, content, read_time, published, published_at, updated_at)
VALUES (
  'bulk-url-shortener',
  'How to Shorten Multiple URLs at Once with Eslotmain',
  'Learn how Eslotmain''s bulk URL shortener helps you turn up to ten long links into clean, shareable short URLs in one submission.',
  'Managing several campaign links should not mean repeating the same task over and over. Eslotmain''s bulk URL shortener gives you a faster way to organize, shorten, and share multiple destinations from one focused workspace.',
$$## Why bulk shortening is useful

Long URLs are difficult to read, copy, and place in campaign materials. When a launch includes separate links for email, social, partners, and tracking variations, shortening each URL individually can quickly become repetitive.

A bulk workflow keeps those destinations together. You can review the full set before submitting, reduce manual switching, and leave with a clear list of short links ready to copy.

## How Eslotmain bulk shortening works

Open the Bulk submit page from the site navigation and paste one destination URL per row. The tool accepts up to ten HTTP or HTTPS URLs in a single submission and validates each entry before it creates anything.

After submission, Eslotmain returns a short link for every valid destination. Existing destinations can be recognized and reused, helping avoid unnecessary duplicate links while keeping your workflow predictable.

## A simple workflow for campaigns

Start by collecting the final destination URLs in a document or spreadsheet. Paste them into the bulk form, check that each link points to the intended page, and submit the group. Then copy the results into your campaign brief or publishing tool.

Because the output is presented as a clean list, it is easy to match each short URL with its original destination and share it with teammates.

## Keep links clear and accountable

Short URLs are most useful when the destination pages are already final and tested. Use descriptive notes in your own campaign records, keep a copy of the original URLs, and avoid shortening links that contain sensitive information unless you understand the destination's privacy implications.

Eslotmain is designed to make everyday link sharing faster. For a small batch of links, the bulk shortener provides a practical alternative to handling every URL one at a time.$$,
  '4 min read',
  true,
  '2026-09-14T00:00:00Z',
  '2026-09-14T00:00:00Z'
)
ON CONFLICT (slug) DO NOTHING;
