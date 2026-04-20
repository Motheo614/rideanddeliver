import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import ClarityInit from '@/components/ClarityInit';
import SeoJsonLd from '@/components/SeoJsonLd';
import { buildSiteGraphSchema } from '@/lib/seo/schema';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'Rider Complex | Gear, Reviews & Earnings for Bike Delivery Riders',
    template: '%s | Rider Complex',
  },
  description: 'The ultimate gear review and buying guide site for bike delivery riders. Uber Eats, DoorDash, and more.',
  alternates: {
    canonical: 'https://www.ridercomplex.com',
  },
  icons: {
    icon: [{ url: '/Assets/Favicon.png', type: 'image/png' }],
    shortcut: '/Assets/Favicon.png',
    apple: '/Assets/Favicon.png',
  },
  metadataBase: new URL('https://www.ridercomplex.com'),
  openGraph: {
    title: 'Rider Complex | Gear, Reviews & Earnings for Bike Delivery Riders',
    description: 'The ultimate gear review and buying guide site for bike delivery riders. Uber Eats, DoorDash, and more.',
    url: '/',
    siteName: 'Rider Complex',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/Assets/Logo.png',
        width: 1200,
        height: 630,
        alt: 'Rider Complex',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rider Complex | Gear Up. Ride Smart. Earn More.',
    description: 'The ultimate gear review and buying guide site for bike delivery riders. Uber Eats, DoorDash, and more.',
    images: ['/Assets/Logo.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const siteGraphSchema = buildSiteGraphSchema();

  return (
    <html lang="en" className={`${inter.variable}`}>
      <head>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-1D1KDRR8SJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-1D1KDRR8SJ');
          `}
        </Script>
      </head>
      <body className="font-sans antialiased text-[#1a1a1a]" suppressHydrationWarning>
        <ClarityInit />
        <SeoJsonLd data={siteGraphSchema} />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
