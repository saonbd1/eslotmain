import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'

const siteUrl = 'https://eslotmain.xyz'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'eslotmain.xyz — Short links. Big possibilities.',
    template: '%s | eslotmain.xyz',
  },
  description: 'Create memorable short links, share them anywhere, and understand every click with eslotmain.xyz.',
  applicationName: 'eslotmain.xyz',
  icons: {
    icon: [{ url: '/favicon.png', type: 'image/png', sizes: '64x64' }],
    shortcut: ['/favicon.png'],
    apple: [{ url: '/favicon.png', type: 'image/png', sizes: '64x64' }],
  },
  generator: 'Next.js',
  keywords: ['URL shortener', 'short links', 'branded links', 'link analytics', 'campaign links'],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    siteName: 'eslotmain.xyz',
    title: 'eslotmain.xyz — Short links. Big possibilities.',
    description: 'Create memorable short links, share them anywhere, and understand every click.',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'eslotmain.xyz — Short links. Big possibilities.',
    description: 'Create memorable short links, share them anywhere, and understand every click.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'eslotmain.xyz',
      description: 'Short links, branded sharing, and click analytics.',
      inLanguage: 'en-US',
    },
    {
      '@type': 'SoftwareApplication',
      '@id': `${siteUrl}/#application`,
      name: 'eslotmain.xyz',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: siteUrl,
      description: 'A URL shortener for memorable links and campaign analytics.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-color-mode="dark" data-light-theme="light" data-dark-theme="dark" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </body>
    </html>
  )
}
