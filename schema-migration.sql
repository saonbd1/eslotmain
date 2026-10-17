-- Run this once in your Neon database (Neon console → SQL editor, or `psql`).
-- Adds support for custom slugs, UTM parameters, and enhanced analytics.

-- Add UTM parameter columns to short_links table
ALTER TABLE short_links
ADD COLUMN IF NOT EXISTS utm_source text,
ADD COLUMN IF NOT EXISTS utm_medium text,
ADD COLUMN IF NOT EXISTS utm_campaign text,
ADD COLUMN IF NOT EXISTS utm_term text,
ADD COLUMN IF NOT EXISTS utm_content text;

-- Add enhanced analytics columns to short_link_events table
ALTER TABLE short_link_events
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS device text,
ADD COLUMN IF NOT EXISTS browser text,
ADD COLUMN IF NOT EXISTS os text,
ADD COLUMN IF NOT EXISTS referrer text,
ADD COLUMN IF NOT EXISTS ip_address text;
