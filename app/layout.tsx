
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { SessionProvider } from '@/components/session-provider'
import { Toaster } from '@/components/ui/toaster'
import GoogleAnalytics from '@/components/analytics/google-analytics'

const inter = Inter({ subsets: ['latin'] })

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: 'SOaC Framework - AI-Powered Security Operations Platform | Enterprise Cybersecurity Automation',
  description: 'Transform security operations with AI-powered threat detection, automated response, and intelligent compliance. Enterprise-grade Security Operations as Code platform trusted by global organizations. Deploy in minutes, detect threats in seconds, respond automatically.',
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'https://soacframe.io'),
  openGraph: {
    title: 'SOaC Framework - AI-Powered Security Operations Platform',
    description: 'Enterprise-grade security automation with AI-powered threat detection, SOAR orchestration, and compliance management. Reduce response time by 95% with intelligent playbooks.',
    url: 'https://soacframe.io',
    siteName: 'SOaC Framework',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SOaC Framework - Enterprise Security Operations Platform'
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SOaC Framework - AI-Powered Security Operations Platform',
    description: 'Enterprise-grade security automation. AI-powered threat detection. Automated response. Deploy in minutes.',
    images: ['/og-image.png'],
    creator: '@soacframework',
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  keywords: [
    'security operations platform',
    'AI cybersecurity',
    'SOAR platform',
    'automated threat detection',
    'security automation software',
    'incident response automation',
    'SIEM integration platform',
    'EDR integration',
    'security orchestration',
    'threat intelligence platform',
    'compliance automation',
    'security operations center',
    'SOC automation',
    'cyber threat detection',
    'security operations as code',
    'enterprise cybersecurity platform',
    'MITRE ATT&CK framework',
    'security workflow automation',
    'multi-phase attack detection',
    'behavioral threat analysis',
    'security playbook automation',
    'real-time threat monitoring',
    'security analytics platform',
    'cloud security operations',
    'AI security operations',
    'security orchestration',
    'threat intelligence'
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <GoogleAnalytics />
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
