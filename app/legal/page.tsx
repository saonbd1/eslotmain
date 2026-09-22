import type { Metadata } from 'next'
import LegalPage from '@/components/LegalPage'

export const metadata: Metadata = { title: 'Legal information', description: 'Legal information for eslotmain.xyz.', alternates: { canonical: '/legal' } }

export default function Page() {
  return <LegalPage eyebrow="Legal" title="Clear terms for a simple service." intro="This page explains the basic legal framework for using eslotmain.xyz. Please read it alongside our Privacy Policy and Terms of Service." sections={[
    { title: 'Service provider', content: <p>eslotmain.xyz is an online URL-shortening service. For questions about this service or these pages, contact <a href="mailto:hello@eslotmain.xyz">hello@eslotmain.xyz</a>.</p> },
    { title: 'Your responsibilities', content: <p>You are responsible for the URLs and content you submit, for complying with applicable law, and for keeping your account credentials secure. Do not use the service for malware, phishing, fraud, harassment, copyright infringement, or other unlawful activity.</p> },
    { title: 'Related policies', content: <p>Our <a href="/privacy">Privacy Policy</a> explains data handling, while our <a href="/terms">Terms of Service</a> describe the rules and limitations that apply to use of the platform.</p> },
  ]} />
}
