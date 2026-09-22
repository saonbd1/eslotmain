import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = { title: 'Privacy Policy', description: 'Privacy Policy for eslotmain.xyz.', alternates: { canonical: '/privacy' } }

export default function Page() {
  return <LegalPage eyebrow="Privacy" title="Your links, handled responsibly." intro="This Privacy Policy describes the information eslotmain.xyz may process when you visit or use the service." sections={[
    { title: 'Information we process', content: <p>We may process account information such as your email address, authentication details, and wallet address if you choose wallet sign-in. When you create a short link, we process the destination URL, generated short code, timestamps, and limited technical information needed to protect and operate the service.</p> },
    { title: 'How we use information', content: <p>We use information to provide, secure, troubleshoot, and improve the service; prevent abuse; respond to requests; and comply with legal obligations. We do not ask for or store wallet private keys or seed phrases.</p> },
    { title: 'Storage and providers', content: <p>Service data may be stored with infrastructure providers such as Supabase. We retain information only as reasonably necessary for the purposes above, legal requirements, dispute resolution, and security.</p> },
    { title: 'Your choices', content: <p>You may contact us to ask about access, correction, or deletion of personal information, subject to legal and operational limits. Contact: <a href="mailto:hello@eslotmain.xyz">hello@eslotmain.xyz</a>.</p> },
  ]} />
}
