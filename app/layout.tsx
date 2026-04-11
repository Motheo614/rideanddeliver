import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import SeoJsonLd from '@/components/SeoJsonLd';
import { buildSiteGraphSchema } from '@/lib/seo/schema';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: {
    default: 'Rider Complex | Gear Up. Ride Smart. Earn More.',
    template: '%s | Rider Complex',
  },
  description: 'The ultimate gear review and buying guide site for bike delivery riders. Uber Eats, DoorDash, and more.',
  icons: {
    icon: [{ url: '/Assets/Favicon.png', type: 'image/png' }],
    shortcut: '/Assets/Favicon.png',
    apple: '/Assets/Favicon.png',
  },
  metadataBase: new URL('https://www.ridercomplex.com'),
  openGraph: {
    title: 'Rider Complex | Gear Up. Ride Smart. Earn More.',
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
      <body className="font-sans antialiased text-[#1a1a1a]" suppressHydrationWarning>
        <SeoJsonLd data={siteGraphSchema} />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
