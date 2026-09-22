import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = { title: 'Terms of Service', description: 'Terms of Service for eslotmain.xyz.', alternates: { canonical: '/terms' } }

export default function Page() {
  return <LegalPage eyebrow="Terms" title="Use eslotmain.xyz with care." intro="These Terms of Service govern access to and use of the eslotmain.xyz URL-shortening service." sections={[
    { title: 'Acceptable use', content: <p>You may use the service only for lawful purposes. You must not submit URLs that distribute malware, phishing, deceptive redirects, illegal content, spam, or material that infringes another person&apos;s rights.</p> },
    { title: 'Accounts and security', content: <p>You are responsible for activity under your account and for protecting sign-in credentials. Wallet authentication confirms control of an address; never share a private key or seed phrase.</p> },
    { title: 'Links and availability', content: <p>Short links point to third-party destinations. We do not control or endorse those destinations and may disable links that violate these terms or create security risks. The service is provided on an availability basis and may change, pause, or end.</p> },
    { title: 'Disclaimers and contact', content: <p>To the extent permitted by law, eslotmain.xyz is not responsible for third-party content, outages, or indirect losses arising from use of the service. Questions or reports can be sent to <a href="mailto:hello@eslotmain.xyz">hello@eslotmain.xyz</a>.</p> },
  ]} />
}
