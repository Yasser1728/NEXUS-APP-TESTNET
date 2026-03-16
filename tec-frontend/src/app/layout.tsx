import './globals.css';
import Script from 'next/script';
import { Cormorant_Garamond, DM_Sans } from 'next/font/google';
import { ClientProviders } from '@/components/ClientProviders';
import PiSdkLoader from '@/components/PiSdkLoader';
import { BackendOfflineBanner } from '@/components/BackendOfflineBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { Metadata } from 'next';

// ─── APP CONFIG ───────────────────────────────────────────────
// ✏️ غير القيم دي بس في كل app جديد
const APP_NAME    = 'Nexus';
const APP_TAGLINE = 'Gateway to 24 Apps';
const APP_DESC    = 'Connect, navigate and explore the full TEC ecosystem in one place. Built on Pi Network.';
const APP_KEYWORDS = ['Nexus', 'TEC', 'Pi Network', 'Pi', 'blockchain', 'ecosystem', '24 apps'];
// ──────────────────────────────────────────────────────────────

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://nexus-app-testnet.vercel.app';

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_DESC,
  keywords: APP_KEYWORDS,
  authors: [{ name: APP_NAME, url: APP_URL }],
  creator: APP_NAME,
  publisher: APP_NAME,
  metadataBase: new URL(APP_URL),

  openGraph: {
    type: 'website',
    url: APP_URL,
    siteName: `${APP_NAME} — ${APP_TAGLINE}`,
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESC,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `${APP_NAME} — ${APP_TAGLINE}`,
      },
    ],
    locale: 'en_US',
  },

  twitter: {
    card: 'summary_large_image',
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: APP_DESC,
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },

  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },

  manifest: '/manifest.json',
};

const piSandbox = process.env.NEXT_PUBLIC_PI_SANDBOX !== 'false';
const sdkTimeoutEnv = process.env.NEXT_PUBLIC_PI_SDK_TIMEOUT
  ? parseInt(process.env.NEXT_PUBLIC_PI_SDK_TIMEOUT, 10)
  : 25000;
const sdkTimeout = sdkTimeoutEnv > 0 && sdkTimeoutEnv < 120000 ? sdkTimeoutEnv : 25000;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={`${cormorantGaramond.variable} ${dmSans.variable}`}>
      <body>
        <Script src="https://sdk.minepi.com/pi-sdk.js" strategy="beforeInteractive" />
        <PiSdkLoader sandbox={piSandbox} timeout={sdkTimeout} />
        <BackendOfflineBanner />
        <ClientProviders>
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ClientProviders>
      </body>
    </html>
  );
}
